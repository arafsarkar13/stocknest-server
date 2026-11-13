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

  findManyByIds: (ids) =>
    Product.find({ _id: { $in: ids } }).select(
      "name sku costPrice price stock",
    ),

  // Adjust stock for multiple products
  adjustStockMany: (changes) =>
    Product.bulkWrite(
      changes.map((change) => ({
        updateOne: {
          filter: { _id: change.productId },
          update: {
            $inc: { stock: change.quantity },
            ...(change.costPrice !== undefined && {
              $set: { costPrice: change.costPrice },
            }),
          },
        },
      })),
    ),

  // Decrease stock only when enough stock is available
  async decreaseStock(items) {
    const done = [];

    for (const item of items) {
      const result = await Product.updateOne(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
      );

      if (result.modifiedCount === 0) {
        // Restore previously deducted stock
        if (done.length > 0) {
          await productRepository.adjustStockMany(
            done.map((d) => ({
              productId: d.product,
              quantity: d.quantity,
            })),
          );
        }

        return { ok: false, failed: item };
      }

      done.push(item);
    }

    return { ok: true };
  },

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
