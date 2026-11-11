import { Router } from "express";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = Router();
const canEdit = authorize("admin", "manager");

router.use(protect);
router.get("/", getSuppliers);
router.post("/", canEdit, createSupplier);
router.put("/:id", canEdit, updateSupplier);
router.delete("/:id", canEdit, deleteSupplier);

export default router;
