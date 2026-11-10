import { userRepository } from "../repositories/userRepository.js";
import ApiError from "../utils/ApiError.js";

const ROLES = ["admin", "manager", "staff"];

export const userService = {
  getAllUsers() {
    return userRepository.findAll();
  },

  async changeRole(id, role, currentUserId) {
    if (!ROLES.includes(role)) {
      throw new ApiError(400, "Role must be admin, manager or staff");
    }
    if (id === currentUserId) {
      throw new ApiError(400, "You cannot change your own role");
    }
    const user = await userRepository.updateRole(id, role);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  },

  async removeUser(id, currentUserId) {
    if (id === currentUserId) {
      throw new ApiError(400, "You cannot delete your own account");
    }
    const user = await userRepository.deleteById(id);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  },
};
