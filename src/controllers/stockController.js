import { stockService } from "../services/stockService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getMovements = asyncHandler(async (req, res) => {
  res.json(await stockService.listMovements(req.query));
});
