import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// 1) Checks the token and attaches the user to req.user
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authorized, token missing");
  }

  const token = header.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await userRepository.findById(decoded.id);

  // Check whether the user exists and is active
  if (!user || !user.isActive) {
    throw new ApiError(401, "User no longer exists or is disabled");
  }

  // Check whether the token was issued before the last password change
  if (
    user.passwordChangedAt &&
    decoded.iat &&
    Math.floor(user.passwordChangedAt.getTime() / 1000) > decoded.iat
  ) {
    throw new ApiError(401, "Your password was changed. Please log in again.");
  }

  req.user = user;

  next();
});

// 2) Allows only the listed roles
// Example: authorize("admin", "manager")
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to do this"));
    }

    next();
  };
};
