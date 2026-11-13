import { Router } from "express";
import {
  getSales,
  getSale,
  createSale,
  cancelSale,
  downloadInvoice,
} from "../controllers/saleController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/", getSales);
router.post("/", createSale);
router.get("/:id", getSale);
router.get("/:id/invoice", downloadInvoice);
router.patch("/:id/cancel", authorize("admin", "manager"), cancelSale);

export default router;
