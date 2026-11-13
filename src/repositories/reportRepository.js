import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

const completed = { status: "completed" };

export const reportRepository = {
  // revenue, number of sales and total discount of all completed sales
  async salesTotals() {
    const [row] = await Sale.aggregate([
      { $match: completed },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
          discount: { $sum: "$discount" },
          orders: { $sum: 1 },
        },
      },
    ]);
    return row || { revenue: 0, discount: 0, orders: 0 };
  },

  // profit before discount = (selling price - cost price) x quantity for every sold item
  async itemProfit() {
    const [row] = await Sale.aggregate([
      { $match: completed },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          profit: {
            $sum: {
              $multiply: [
                { $subtract: ["$items.unitPrice", "$items.costPrice"] },
                "$items.quantity",
              ],
            },
          },
          unitsSold: { $sum: "$items.quantity" },
        },
      },
    ]);
    return row || { profit: 0, unitsSold: 0 };
  },

  // revenue per day (Bangladesh time, UTC+6)
  salesByDay(since) {
    return Sale.aggregate([
      { $match: { ...completed, createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "+06:00",
            },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },

  // best selling products
  topProducts(limit = 5) {
    return Sale.aggregate([
      { $match: completed },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          units: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { units: -1 } },
      { $limit: limit },
    ]);
  },

  // revenue per category ($lookup joins sale items -> products -> categories)
  salesByCategory(limit = 6) {
    return Sale.aggregate([
      { $match: completed },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$category.name", "Uncategorized"] },
          revenue: { $sum: "$items.lineTotal" },
          units: { $sum: "$items.quantity" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
    ]);
  },

  // stock summary of the whole catalog
  async inventorySummary() {
    const [row] = await Product.aggregate([
      {
        $group: {
          _id: null,
          products: { $sum: 1 },
          units: { $sum: "$stock" },
          stockValue: { $sum: { $multiply: ["$stock", "$costPrice"] } },
          lowStock: {
            $sum: { $cond: [{ $lte: ["$stock", "$lowStockLimit"] }, 1, 0] },
          },
          outOfStock: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } },
        },
      },
    ]);
    return (
      row || {
        products: 0,
        units: 0,
        stockValue: 0,
        lowStock: 0,
        outOfStock: 0,
      }
    );
  },

  lowStockProducts(limit = 6) {
    return Product.find({ $expr: { $lte: ["$stock", "$lowStockLimit"] } })
      .sort({ stock: 1 })
      .limit(limit)
      .select("name sku stock lowStockLimit");
  },

  // used by the Excel exports
  productsForExport: () =>
    Product.find()
      .populate("category", "name")
      .populate("supplier", "name")
      .sort({ name: 1 }),

  salesForExport: () =>
    Sale.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(5000),
};
