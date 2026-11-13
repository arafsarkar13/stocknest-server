import { reportService } from "../services/reportService.js";
import { exportService } from "../services/exportService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDashboard = asyncHandler(async (req, res) => {
  res.json(await reportService.dashboard());
});

export const exportProducts = asyncHandler(async (req, res) => {
  await exportService.products(res);
});

export const exportSales = asyncHandler(async (req, res) => {
  await exportService.sales(res);
});
