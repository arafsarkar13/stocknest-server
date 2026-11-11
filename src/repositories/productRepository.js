import Product from "../models/Product.js";

const populateFields = [
  { path: "category", select: "name" },
  { path: "supplier", select: "name" },
];

export const productRepository = {
  async findPaginated(filter, page, limit) {
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate(populateFields)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);
    return { products, total };
  },

  findById: (id) => Product.findById(id).populate(populateFields),
  findByExternalId: (externalId) => Product.findOne({ externalId }),
  create: (data) => Product.create(data),
  update: (id, data) =>
    Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate(populateFields),
  delete: (id) => Product.findByIdAndDelete(id),

  countByCategory: (categoryId) =>
    Product.countDocuments({ category: categoryId }),
  countBySupplier: (supplierId) =>
    Product.countDocuments({ supplier: supplierId }),
};
