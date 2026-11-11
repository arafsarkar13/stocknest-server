import { productRepository } from "../repositories/productRepository.js";
import { categoryRepository } from "../repositories/categoryRepository.js";
import ApiError from "../utils/ApiError.js";
import escapeRegex from "../utils/escapeRegex.js";

const FIELDS = [
  "name",
  "sku",
  "description",
  "category",
  "supplier",
  "price",
  "costPrice",
  "stock",
  "lowStockLimit",
  "image",
  "brand",
];
const NUMBER_FIELDS = ["price", "costPrice", "stock", "lowStockLimit"];

// keep only allowed fields and convert numbers
const pickFields = (body) => {
  const data = {};
  FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });

  if (data.supplier === "") data.supplier = null;
  if (!data.sku) delete data.sku;
  if (data.sku) data.sku = String(data.sku).trim().toUpperCase();

  NUMBER_FIELDS.forEach((field) => {
    if (data[field] !== undefined && data[field] !== "")
      data[field] = Number(data[field]);
  });
  return data;
};

const makeSku = () => `NM-${Date.now().toString(36).toUpperCase()}`;

// "mens-shirts" -> "Mens Shirts"
const toTitle = (text) =>
  text.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const productService = {
  async list(query) {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(parseInt(query.limit) || 12, 50);

    const filter = {};
    if (query.search) {
      const regex = new RegExp(escapeRegex(query.search), "i");
      filter.$or = [{ name: regex }, { sku: regex }, { brand: regex }];
    }
    if (query.category) filter.category = query.category;
    if (query.lowStock === "true")
      filter.$expr = { $lte: ["$stock", "$lowStockLimit"] };

    const { products, total } = await productRepository.findPaginated(
      filter,
      page,
      limit,
    );
    return { products, total, page, pages: Math.ceil(total / limit) || 1 };
  },

  async getOne(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new ApiError(404, "Product not found");
    return product;
  },

  create(body) {
    const data = pickFields(body);
    if (!data.sku) data.sku = makeSku();
    return productRepository.create(data);
  },

  async update(id, body) {
    const product = await productRepository.update(id, pickFields(body));
    if (!product) throw new ApiError(404, "Product not found");
    return product;
  },

  async remove(id) {
    const product = await productRepository.delete(id);
    if (!product) throw new ApiError(404, "Product not found");
    return product;
  },

  // products picked on the client from https://dummyjson.com/products
  async importFromDummy(items) {
    if (!Array.isArray(items) || items.length === 0)
      throw new ApiError(400, "No products to import");
    if (items.length > 100)
      throw new ApiError(400, "You can import up to 100 products at a time");

    let imported = 0;
    let skipped = 0;
    const categoryIds = {};

    for (const item of items) {
      const exists = await productRepository.findByExternalId(item.id);
      if (exists) {
        skipped++;
        continue;
      }

      const categoryName = toTitle(item.category || "general");
      if (!categoryIds[categoryName]) {
        const category = await categoryRepository.findOrCreate(categoryName);
        categoryIds[categoryName] = category._id;
      }

      const price = Number(item.price) || 0;
      try {
        await productRepository.create({
          name: item.title,
          sku: item.sku || `DJ-${item.id}`,
          description: item.description || "",
          category: categoryIds[categoryName],
          price,
          costPrice: Math.round(price * 0.7 * 100) / 100, // assume a 30% margin
          stock: Number(item.stock) || 0,
          image: item.thumbnail || "",
          brand: item.brand || "",
          source: "dummyjson",
          externalId: item.id,
        });
        imported++;
      } catch (error) {
        skipped++; // for example, the SKU already exists
      }
    }

    return { imported, skipped };
  },
};
