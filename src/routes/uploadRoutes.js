import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../controllers/uploadController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import ApiError from "../utils/ApiError.js";

const router = Router();

// keep the file in memory (Vercel has no writable disk), max 2MB, images only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new ApiError(400, "Only image files are allowed"));
    cb(null, true);
  },
});

router.post(
  "/image",
  protect,
  authorize("admin", "manager"),
  upload.single("image"),
  uploadImage,
);

export default router;
