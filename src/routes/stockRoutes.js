import { Router } from "express";
import { getMovements } from "../controllers/stockController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", protect, authorize("admin", "manager"), getMovements);

export default router;
