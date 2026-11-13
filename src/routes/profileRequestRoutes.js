import { Router } from "express";
import {
  listRequests,
  approveRequest,
  rejectRequest,
} from "../controllers/profileController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect, authorize("admin"));
router.get("/", listRequests);
router.patch("/:id/approve", approveRequest);
router.patch("/:id/reject", rejectRequest);

export default router;
