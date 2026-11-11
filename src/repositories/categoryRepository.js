import Category from "../models/Category.js";
import escapeRegex from "../utils/escapeRegex.js";

export const categoryRepository = {
  findAll: () => Category.find().sort({ name: 1 }),
  findByName: (name) =>
    Category.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, "i") }),
  create: (data) => Category.create(data),
  update: (id, data) =>
    Category.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  delete: (id) => Category.findByIdAndDelete(id),

  async findOrCreate(name) {
    const found = await this.findByName(name);
    return found || Category.create({ name });
  },
};
