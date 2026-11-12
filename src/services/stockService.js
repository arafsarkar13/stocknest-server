import { stockMovementRepository } from "../repositories/stockMovementRepository.js";

export const stockService = {
  async listMovements(query) {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(parseInt(query.limit) || 15, 50);

    const filter = {};
    if (["in", "out"].includes(query.type)) filter.type = query.type;

    const { movements, total } = await stockMovementRepository.findPaginated(
      filter,
      page,
      limit,
    );
    return { movements, total, page, pages: Math.ceil(total / limit) || 1 };
  },
};
