import Sale from "../models/Sale.js";

const populateFields = [{ path: "createdBy", select: "name" }];

export const saleRepository = {
  async findPaginated(filter, page, limit) {
    const [sales, total] = await Promise.all([
      Sale.find(filter)
        .populate(populateFields)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Sale.countDocuments(filter),
    ]);
    return { sales, total };
  },

  findById: (id) => Sale.findById(id).populate(populateFields),
  create: (data) => Sale.create(data),

  // changes the status only if the sale is currently in the "from" status
  changeStatus: (id, from, to) =>
    Sale.findOneAndUpdate(
      { _id: id, status: from },
      { status: to },
      { new: true },
    ).populate(populateFields),
};
