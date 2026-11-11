import { categoryService } from "../services/categoryService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getCategories = asyncHandler(async (req, res) => {
  res.json(await categoryService.getAll());
});

export const createCategory = asyncHandler(async (req, res) => {
  res.status(201).json(await categoryService.create(req.body));
});

export const updateCategory = asyncHandler(async (req, res) => {
  res.json(await categoryService.update(req.params.id, req.body));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.remove(req.params.id);
  res.json({ message: "Category deleted" });
});
