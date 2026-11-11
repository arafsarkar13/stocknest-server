import { Router } from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
} from "../controllers/productController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = Router();
const canEdit = authorize("admin", "manager");

router.use(protect);
router.get("/", getProducts);
router.post("/import", canEdit, importProducts); // must stay above "/:id"
router.get("/:id", getProduct);
router.post("/", canEdit, createProduct);
router.put("/:id", canEdit, updateProduct);
router.delete("/:id", canEdit, deleteProduct);

export default router;
