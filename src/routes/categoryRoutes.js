import { Router } from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = Router();
const canEdit = authorize("admin", "manager");

router.use(protect);
router.get("/", getCategories);
router.post("/", canEdit, createCategory);
router.put("/:id", canEdit, updateCategory);
router.delete("/:id", canEdit, deleteCategory);

export default router;

