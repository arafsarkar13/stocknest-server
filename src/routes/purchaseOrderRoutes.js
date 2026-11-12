import { Router } from "express";
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  receiveOrder,
  cancelOrder,
  deleteOrder,
} from "../controllers/purchaseOrderController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect, authorize("admin", "manager"));

router.get("/", getOrders);
router.post("/", createOrder);
router.get("/:id", getOrder);
router.put("/:id", updateOrder);
router.patch("/:id/receive", receiveOrder);
router.patch("/:id/cancel", cancelOrder);
router.delete("/:id", deleteOrder);

export default router;
