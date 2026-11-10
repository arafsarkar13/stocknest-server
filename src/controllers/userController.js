import { userService } from "../services/userService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await userService.changeRole(
    req.params.id,
    req.body.role,
    req.user._id.toString(),
  );
  res.json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.removeUser(req.params.id, req.user._id.toString());
  res.json({ message: "User deleted" });
});
