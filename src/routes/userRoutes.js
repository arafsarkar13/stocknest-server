import { Router } from "express";
import {
  getUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = Router();

// every route below needs a logged-in admin
router.use(protect, authorize("admin"));

router.get("/", getUsers);
router.patch("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;
