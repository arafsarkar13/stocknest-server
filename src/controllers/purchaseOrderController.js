import { purchaseOrderService } from "../services/purchaseOrderService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getOrders = asyncHandler(async (req, res) => {
  res.json(await purchaseOrderService.list(req.query));
});

export const getOrder = asyncHandler(async (req, res) => {
  res.json(await purchaseOrderService.getOne(req.params.id));
});

export const createOrder = asyncHandler(async (req, res) => {
  res
    .status(201)
    .json(await purchaseOrderService.create(req.body, req.user._id));
});

export const updateOrder = asyncHandler(async (req, res) => {
  res.json(await purchaseOrderService.update(req.params.id, req.body));
});

export const receiveOrder = asyncHandler(async (req, res) => {
  res.json(await purchaseOrderService.receive(req.params.id, req.user._id));
});

export const cancelOrder = asyncHandler(async (req, res) => {
  res.json(await purchaseOrderService.cancel(req.params.id));
});

export const deleteOrder = asyncHandler(async (req, res) => {
  await purchaseOrderService.remove(req.params.id);
  res.json({ message: "Purchase order deleted" });
});
