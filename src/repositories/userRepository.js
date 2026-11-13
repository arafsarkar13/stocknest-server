import User from "../models/User.js";

export const userRepository = {
  findByEmail: (email) => User.findOne({ email }).select("+password"),
  findById: (id) => User.findById(id),
  findByIdWithPassword: (id) => User.findById(id).select("+password"),
  existsByEmail: (email, excludeId) =>
    User.exists({ email, ...(excludeId && { _id: { $ne: excludeId } }) }),
  countAdmins: () => User.countDocuments({ role: "admin" }),
  updateProfile: (id, data) =>
    User.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  updatePassword: (id, hash) =>
    User.findByIdAndUpdate(
      id,
      { password: hash, passwordChangedAt: new Date() },
      { new: true },
    ),
  create: (data) => User.create(data),
  findAll: () => User.find().sort({ createdAt: -1 }),
  updateRole: (id, role) =>
    User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }),
  deleteById: (id) => User.findByIdAndDelete(id),
};
