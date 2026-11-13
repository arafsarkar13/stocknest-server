import { Router } from "express";
import {
  getProfile,
  submitChange,
  cancelChange,
  changePassword,
} from "../controllers/profileController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", getProfile);
router.post("/change-request", submitChange);
router.delete("/change-request", cancelChange);
router.patch("/password", changePassword);

export default router;
