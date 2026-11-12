import Supplier from "../models/Supplier.js";

export const supplierRepository = {
  findAll: () => Supplier.find().sort({ name: 1 }),
  findById: (id) => Supplier.findById(id),
  create: (data) => Supplier.create(data),
  update: (id, data) =>
    Supplier.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  delete: (id) => Supplier.findByIdAndDelete(id),
};
