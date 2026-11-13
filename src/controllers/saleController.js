import { saleService } from "../services/saleService.js";
import { buildInvoicePdf } from "../utils/invoicePdf.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getSales = asyncHandler(async (req, res) => {
  res.json(await saleService.list(req.query, req.user));
});

export const getSale = asyncHandler(async (req, res) => {
  res.json(await saleService.getOne(req.params.id, req.user));
});

export const createSale = asyncHandler(async (req, res) => {
  res.status(201).json(await saleService.create(req.body, req.user));
});

export const cancelSale = asyncHandler(async (req, res) => {
  res.json(await saleService.cancel(req.params.id, req.user));
});

export const downloadInvoice = asyncHandler(async (req, res) => {
  const sale = await saleService.getOne(req.params.id, req.user);
  buildInvoicePdf(sale, res);
});
