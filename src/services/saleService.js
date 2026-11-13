import { saleRepository } from "../repositories/saleRepository.js";
import { productRepository } from "../repositories/productRepository.js";
import { stockMovementRepository } from "../repositories/stockMovementRepository.js";
import ApiError from "../utils/ApiError.js";
import escapeRegex from "../utils/escapeRegex.js";

const PAYMENTS = ["cash", "card", "mobile"];
const round2 = (number) => Math.round(number * 100) / 100;

// example: INV-20261112-4821
const makeInvoiceNumber = () => {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `INV-${day}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// staff can only open their own sales
const checkAccess = (sale, user) => {
  if (
    user.role === "staff" &&
    sale.createdBy?._id.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "You can only view your own sales");
  }
};

export const saleService = {
  async list(query, user) {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(parseInt(query.limit) || 10, 50);

    const filter = {};
    if (["completed", "cancelled"].includes(query.status))
      filter.status = query.status;
    if (user.role === "staff") filter.createdBy = user._id;
    if (query.search) {
      const regex = new RegExp(escapeRegex(query.search), "i");
      filter.$or = [{ invoiceNumber: regex }, { customerName: regex }];
    }

    const { sales, total } = await saleRepository.findPaginated(
      filter,
      page,
      limit,
    );
    return { sales, total, page, pages: Math.ceil(total / limit) || 1 };
  },

  async getOne(id, user) {
    const sale = await saleRepository.findById(id);
    if (!sale) throw new ApiError(404, "Sale not found");
    checkAccess(sale, user);
    return sale;
  },

  async create(body, user) {
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new ApiError(400, "Add at least one product to the sale");
    }

    const products = await productRepository.findManyByIds(
      body.items.map((item) => item.product),
    );
    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );
    const used = new Set();

    // prices and names come from the database, never from the browser
    const items = body.items.map((item) => {
      const product = productMap.get(String(item.product));
      if (!product)
        throw new ApiError(400, "One of the products no longer exists");
      if (used.has(product._id.toString()))
        throw new ApiError(400, `"${product.name}" is added twice`);
      used.add(product._id.toString());

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new ApiError(
          400,
          `Quantity for "${product.name}" must be a whole number of 1 or more`,
        );
      }
      if (product.stock < quantity) {
        throw new ApiError(
          400,
          `Only ${product.stock} of "${product.name}" left in stock`,
        );
      }

      return {
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity,
        unitPrice: product.price,
        costPrice: product.costPrice || 0,
        lineTotal: round2(quantity * product.price),
      };
    });

    const subtotal = round2(
      items.reduce((sum, item) => sum + item.lineTotal, 0),
    );
    const discount = round2(Number(body.discount) || 0);
    if (discount < 0 || discount > subtotal) {
      throw new ApiError(400, "Discount must be between 0 and the subtotal");
    }

    // take the stock first (this is the guard against overselling)
    const stockResult = await productRepository.decreaseStock(items);
    if (!stockResult.ok) {
      throw new ApiError(
        400,
        `Not enough stock for "${stockResult.failed.name}"`,
      );
    }

    let sale;
    try {
      sale = await saleRepository.create({
        invoiceNumber: makeInvoiceNumber(),
        customerName: body.customerName?.trim() || "Walk-in Customer",
        customerPhone: body.customerPhone || "",
        items,
        subtotal,
        discount,
        totalAmount: round2(subtotal - discount),
        paymentMethod: PAYMENTS.includes(body.paymentMethod)
          ? body.paymentMethod
          : "cash",
        createdBy: user._id,
      });
    } catch (error) {
      // saving failed, so put the stock back
      await productRepository.adjustStockMany(
        items.map((item) => ({
          productId: item.product,
          quantity: item.quantity,
        })),
      );
      throw error;
    }

    await stockMovementRepository.createMany(
      items.map((item) => ({
        product: item.product,
        productName: item.name,
        type: "out",
        quantity: item.quantity,
        reference: sale.invoiceNumber,
        note: `Sold to ${sale.customerName}`,
        createdBy: user._id,
      })),
    );

    return saleRepository.findById(sale._id);
  },

  // completed -> cancelled, and the stock goes back to the shelf
  async cancel(id, user) {
    const sale = await saleRepository.changeStatus(
      id,
      "completed",
      "cancelled",
    );
    if (!sale) {
      const existing = await saleRepository.findById(id);
      if (!existing) throw new ApiError(404, "Sale not found");
      throw new ApiError(400, "This sale is already cancelled");
    }

    await productRepository.adjustStockMany(
      sale.items.map((item) => ({
        productId: item.product,
        quantity: item.quantity,
      })),
    );

    await stockMovementRepository.createMany(
      sale.items.map((item) => ({
        product: item.product,
        productName: item.name,
        type: "in",
        quantity: item.quantity,
        reference: sale.invoiceNumber,
        note: "Sale cancelled, stock returned",
        createdBy: user._id,
      })),
    );

    return sale;
  },
};
