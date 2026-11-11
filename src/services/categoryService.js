import { categoryRepository } from "../repositories/categoryRepository.js";
import { productRepository } from "../repositories/productRepository.js";
import ApiError from "../utils/ApiError.js";

export const categoryService = {
  getAll: () => categoryRepository.findAll(),

  async create({ name, description }) {
    if (!name || !name.trim())
      throw new ApiError(400, "Category name is required");

    const exists = await categoryRepository.findByName(name.trim());
    if (exists) throw new ApiError(409, "This category already exists");

    return categoryRepository.create({ name: name.trim(), description });
  },

  async update(id, { name, description }) {
    if (!name || !name.trim())
      throw new ApiError(400, "Category name is required");

    const duplicate = await categoryRepository.findByName(name.trim());
    if (duplicate && duplicate._id.toString() !== id) {
      throw new ApiError(409, "This category already exists");
    }

    const category = await categoryRepository.update(id, {
      name: name.trim(),
      description,
    });
    if (!category) throw new ApiError(404, "Category not found");
    return category;
  },

  async remove(id) {
    const used = await productRepository.countByCategory(id);
    if (used > 0)
      throw new ApiError(
        400,
        `Cannot delete: ${used} product(s) use this category`,
      );

    const category = await categoryRepository.delete(id);
    if (!category) throw new ApiError(404, "Category not found");
    return category;
  },
};
