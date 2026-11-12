import StockMovement from "../models/StockMovement.js";

export const stockMovementRepository = {
  createMany: (list) => StockMovement.insertMany(list),

  async findPaginated(filter, page, limit) {
    const [movements, total] = await Promise.all([
      StockMovement.find(filter)
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      StockMovement.countDocuments(filter),
    ]);
    return { movements, total };
  },
};
