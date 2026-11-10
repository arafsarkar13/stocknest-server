import { authService } from "../services/authService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

// returns the logged-in user (used by the frontend to restore the session on reload)
export const me = asyncHandler(async (req, res) => {
  res.json({ user: authService.cleanUser(req.user) });
});
