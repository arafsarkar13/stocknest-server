import PurchaseOrder from "../models/PurchaseOrder.js";

const populateFields = [
  { path: "supplier", select: "name email phone" },
  { path: "createdBy", select: "name" },
];

export const purchaseOrderRepository = {
  async findPaginated(filter, page, limit) {
    const [orders, total] = await Promise.all([
      PurchaseOrder.find(filter)
        .populate(populateFields)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      PurchaseOrder.countDocuments(filter),
    ]);
    return { orders, total };
  },

  findById: (id) => PurchaseOrder.findById(id).populate(populateFields),
  create: (data) => PurchaseOrder.create(data),

  update: (id, data) =>
    PurchaseOrder.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate(populateFields),

  // changes the status ONLY if the order is currently in the "from" status
  changeStatus: (id, from, to, extra = {}) =>
    PurchaseOrder.findOneAndUpdate(
      { _id: id, status: from },
      { status: to, ...extra },
      { new: true },
    ).populate(populateFields),

  delete: (id) => PurchaseOrder.findByIdAndDelete(id),
};
