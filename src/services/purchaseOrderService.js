import { purchaseOrderRepository } from "../repositories/purchaseOrderRepository.js";
import { productRepository } from "../repositories/productRepository.js";
import { supplierRepository } from "../repositories/supplierRepository.js";
import { stockMovementRepository } from "../repositories/stockMovementRepository.js";
import ApiError from "../utils/ApiError.js";

const STATUSES = ["pending", "received", "cancelled"];
const round2 = (number) => Math.round(number * 100) / 100;

// example: PO-20261111-4821
const makePoNumber = () => {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PO-${day}-${random}`;
};

// checks the request and builds the order data. Totals are calculated here, never trusted from the client.
const buildOrderData = async (body) => {
  const supplier = await supplierRepository.findById(body.supplier);
  if (!supplier) throw new ApiError(400, "Please choose a valid supplier");

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new ApiError(400, "Add at least one product to the order");
  }

  const products = await productRepository.findManyByIds(
    body.items.map((item) => item.product),
  );
  const productMap = new Map(
    products.map((product) => [product._id.toString(), product]),
  );
  const used = new Set();

  const items = body.items.map((item) => {
    const product = productMap.get(String(item.product));
    if (!product)
      throw new ApiError(400, "One of the products no longer exists");
    if (used.has(product._id.toString()))
      throw new ApiError(400, `"${product.name}" is added twice`);
    used.add(product._id.toString());

    const quantity = Number(item.quantity);
    const unitCost = Number(item.unitCost);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ApiError(
        400,
        `Quantity for "${product.name}" must be a whole number of 1 or more`,
      );
    }
    if (Number.isNaN(unitCost) || unitCost < 0) {
      throw new ApiError(400, `Unit cost for "${product.name}" is not valid`);
    }

    return {
      product: product._id,
      name: product.name,
      sku: product.sku,
      quantity,
      unitCost,
      lineTotal: round2(quantity * unitCost),
    };
  });

  return {
    supplier: supplier._id,
    items,
    totalAmount: round2(items.reduce((sum, item) => sum + item.lineTotal, 0)),
    note: body.note || "",
  };
};

// used when a status change did not apply, to explain why
const explainFailedChange = async (id) => {
  const order = await purchaseOrderRepository.findById(id);
  if (!order) throw new ApiError(404, "Purchase order not found");
  throw new ApiError(400, `This order is already ${order.status}`);
};

export const purchaseOrderService = {
  async list(query) {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(parseInt(query.limit) || 10, 50);

    const filter = {};
    if (STATUSES.includes(query.status)) filter.status = query.status;

    const { orders, total } = await purchaseOrderRepository.findPaginated(
      filter,
      page,
      limit,
    );
    return { orders, total, page, pages: Math.ceil(total / limit) || 1 };
  },

  async getOne(id) {
    const order = await purchaseOrderRepository.findById(id);
    if (!order) throw new ApiError(404, "Purchase order not found");
    return order;
  },

  async create(body, userId) {
    const data = await buildOrderData(body);
    const order = await purchaseOrderRepository.create({
      ...data,
      poNumber: makePoNumber(),
      createdBy: userId,
    });
    return purchaseOrderRepository.findById(order._id);
  },

  async update(id, body) {
    const order = await purchaseOrderRepository.findById(id);
    if (!order) throw new ApiError(404, "Purchase order not found");
    if (order.status !== "pending")
      throw new ApiError(400, "Only pending orders can be edited");

    const data = await buildOrderData(body);
    return purchaseOrderRepository.update(id, data);
  },

  // pending -> received: adds stock and writes stock history
  async receive(id, userId) {
    const order = await purchaseOrderRepository.changeStatus(
      id,
      "pending",
      "received",
      {
        receivedAt: new Date(),
      },
    );
    if (!order) return explainFailedChange(id);

    await productRepository.adjustStockMany(
      order.items.map((item) => ({
        productId: item.product,
        quantity: item.quantity,
        costPrice: item.unitCost,
      })),
    );

    await stockMovementRepository.createMany(
      order.items.map((item) => ({
        product: item.product,
        productName: item.name,
        type: "in",
        quantity: item.quantity,
        reference: order.poNumber,
        note: `Received from ${order.supplier.name}`,
        createdBy: userId,
      })),
    );

    return order;
  },

  // pending -> cancelled
  async cancel(id) {
    const order = await purchaseOrderRepository.changeStatus(
      id,
      "pending",
      "cancelled",
    );
    if (!order) return explainFailedChange(id);
    return order;
  },

  async remove(id) {
    const order = await purchaseOrderRepository.findById(id);
    if (!order) throw new ApiError(404, "Purchase order not found");
    if (order.status === "received") {
      throw new ApiError(
        400,
        "Received orders cannot be deleted because stock history depends on them",
      );
    }
    await purchaseOrderRepository.delete(id);
    return order;
  },
};
