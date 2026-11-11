import { productService } from "../services/productService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getProducts = asyncHandler(async (req, res) => {
  res.json(await productService.list(req.query));
});

export const getProduct = asyncHandler(async (req, res) => {
  res.json(await productService.getOne(req.params.id));
});

export const createProduct = asyncHandler(async (req, res) => {
  res.status(201).json(await productService.create(req.body));
});

export const updateProduct = asyncHandler(async (req, res) => {
  res.json(await productService.update(req.params.id, req.body));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.remove(req.params.id);
  res.json({ message: "Product deleted" });
});

export const importProducts = asyncHandler(async (req, res) => {
  res.json(await productService.importFromDummy(req.body.products));
});
