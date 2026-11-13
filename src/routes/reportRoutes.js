import { Router } from "express";
import {
  getDashboard,
  exportProducts,
  exportSales,
} from "../controllers/reportController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect, authorize("admin", "manager"));

router.get("/dashboard", getDashboard);
router.get("/export/products", exportProducts);
router.get("/export/sales", exportSales);

export default router;
