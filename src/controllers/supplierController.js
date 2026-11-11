import { supplierService } from "../services/supplierService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getSuppliers = asyncHandler(async (req, res) => {
  res.json(await supplierService.getAll());
});

export const createSupplier = asyncHandler(async (req, res) => {
  res.status(201).json(await supplierService.create(req.body));
});

export const updateSupplier = asyncHandler(async (req, res) => {
  res.json(await supplierService.update(req.params.id, req.body));
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  await supplierService.remove(req.params.id);
  res.json({ message: "Supplier deleted" });
});
