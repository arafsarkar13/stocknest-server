import { uploadService } from "../services/uploadService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Please choose an image");
  const url = await uploadService.uploadImage(req.file.buffer);
  res.json({ url });
});
