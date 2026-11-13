import ProfileChangeRequest from "../models/ProfileChangeRequest.js";

export const profileRequestRepository = {
  create: (data) => ProfileChangeRequest.create(data),

  findById: (id) =>
    ProfileChangeRequest.findById(id)
      .populate("user", "name email role")
      .lean(),

  findPendingByUser: (userId) =>
    ProfileChangeRequest.findOne({ user: userId, status: "pending" }).lean(),

  findLatestByUser: (userId) =>
    ProfileChangeRequest.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .populate("reviewedBy", "name")
      .lean(),

  async findPaginated(filter, page, limit) {
    const [requests, total] = await Promise.all([
      ProfileChangeRequest.find(filter)
        .populate("user", "name email role")
        .populate("reviewedBy", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ProfileChangeRequest.countDocuments(filter),
    ]);
    return { requests, total };
  },

  // moves a PENDING request to a new status; returns null if it was not pending (prevents double review)
  review: (id, status, adminId, note = "") =>
    ProfileChangeRequest.findOneAndUpdate(
      { _id: id, status: "pending" },
      { status, reviewedBy: adminId, reviewedAt: new Date(), reviewNote: note },
      { new: true },
    ).lean(),

  cancelPending: (userId) =>
    ProfileChangeRequest.findOneAndUpdate(
      { user: userId, status: "pending" },
      { status: "cancelled", reviewedAt: new Date() },
      { new: true },
    ).lean(),
};
