import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/userRepository.js";
import { profileRequestRepository } from "../repositories/profileRequestRepository.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";

const FIELDS = ["name", "email", "phone", "address"];
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const STATUSES = ["pending", "approved", "rejected", "cancelled"];

const snapshot = (user) =>
  Object.fromEntries(FIELDS.map((field) => [field, user[field] ?? ""]));

export const profileService = {
  // the user's profile + their pending request + the latest decision
  async getProfile(user) {
    const [pending, latest] = await Promise.all([
      profileRequestRepository.findPendingByUser(user._id),
      profileRequestRepository.findLatestByUser(user._id),
    ]);
    return {
      user: { id: user._id, role: user.role, ...snapshot(user) },
      pending,
      latest,
    };
  },

  // creates a pending change request. The profile itself is NOT touched here.
  async submitChange(user, body) {
    const changes = {};
    for (const field of FIELDS) {
      if (body[field] === undefined) continue;
      let value = String(body[field]).trim();
      if (field === "email") value = value.toLowerCase();
      if (value !== (user[field] ?? "")) changes[field] = value;
    }

    if (Object.keys(changes).length === 0)
      throw new ApiError(400, "You have not changed anything");
    if (changes.name !== undefined && !changes.name)
      throw new ApiError(400, "Name cannot be empty");

    if (changes.email !== undefined) {
      if (!EMAIL_PATTERN.test(changes.email))
        throw new ApiError(400, "Please enter a valid email address");
      if (await userRepository.existsByEmail(changes.email, user._id)) {
        throw new ApiError(
          409,
          "This email is already used by another account",
        );
      }
    }

    if (await profileRequestRepository.findPendingByUser(user._id)) {
      throw new ApiError(
        400,
        "You already have a request waiting for approval. Withdraw it first to send a new one.",
      );
    }

    return profileRequestRepository.create({
      user: user._id,
      changes,
      previous: snapshot(user),
    });
  },

  async cancelChange(user) {
    const request = await profileRequestRepository.cancelPending(user._id);
    if (!request) throw new ApiError(404, "You have no pending request");
    return request;
  },

  // password changes apply immediately, but only with the current password
  async changePassword(user, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword)
      throw new ApiError(400, "Current and new password are required");
    if (newPassword.length < 8)
      throw new ApiError(400, "New password must be at least 8 characters");
    if (newPassword === currentPassword)
      throw new ApiError(400, "New password must be different");

    const full = await userRepository.findByIdWithPassword(user._id);
    const isMatch = await bcrypt.compare(currentPassword, full.password);
    if (!isMatch) throw new ApiError(401, "Current password is incorrect");

    const updated = await userRepository.updatePassword(
      user._id,
      await bcrypt.hash(newPassword, 10),
    );
    // a fresh token for this session, every older token stops working
    return { token: generateToken(updated) };
  },

  // ----- admin side -----

  async listRequests(query) {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(parseInt(query.limit) || 20, 50);
    const filter = {};
    if (STATUSES.includes(query.status)) filter.status = query.status;

    const { requests, total } = await profileRequestRepository.findPaginated(
      filter,
      page,
      limit,
    );
    return { requests, total, page, pages: Math.ceil(total / limit) || 1 };
  },

  async approve(id, admin, note) {
    const request = await profileRequestRepository.findById(id);
    if (!request) throw new ApiError(404, "Request not found");
    if (request.status !== "pending")
      throw new ApiError(400, `This request is already ${request.status}`);

    // an admin cannot approve their own request while another admin exists
    const isOwn = request.user._id.toString() === admin._id.toString();
    if (isOwn && (await userRepository.countAdmins()) > 1) {
      throw new ApiError(
        403,
        "You cannot approve your own request. Another admin must review it.",
      );
    }

    if (
      request.changes.email &&
      (await userRepository.existsByEmail(
        request.changes.email,
        request.user._id,
      ))
    ) {
      throw new ApiError(
        409,
        "That email now belongs to another account. Please reject this request.",
      );
    }

    // claim the request first (only one admin can win), then apply the changes
    const claimed = await profileRequestRepository.review(
      id,
      "approved",
      admin._id,
      note,
    );
    if (!claimed) throw new ApiError(400, "This request was already reviewed");

    await userRepository.updateProfile(request.user._id, request.changes);
    return claimed;
  },

  async reject(id, admin, note) {
    const request = await profileRequestRepository.review(
      id,
      "rejected",
      admin._id,
      note,
    );
    if (!request)
      throw new ApiError(
        400,
        "This request does not exist or was already reviewed",
      );
    return request;
  },
};
