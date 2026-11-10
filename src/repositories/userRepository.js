import User from "../models/User.js";

export const userRepository = {
  findByEmail: (email) => User.findOne({ email }).select("+password"),
  findById: (id) => User.findById(id),
  create: (data) => User.create(data),
  findAll: () => User.find().sort({ createdAt: -1 }),
  updateRole: (id, role) =>
    User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }),
  deleteById: (id) => User.findByIdAndDelete(id),
};
