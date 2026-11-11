import { supplierRepository } from "../repositories/supplierRepository.js";
import { productRepository } from "../repositories/productRepository.js";
import ApiError from "../utils/ApiError.js";

export const supplierService = {
  getAll: () => supplierRepository.findAll(),

  create(data) {
    if (!data.name || !data.name.trim())
      throw new ApiError(400, "Supplier name is required");
    return supplierRepository.create(data);
  },

  async update(id, data) {
    if (!data.name || !data.name.trim())
      throw new ApiError(400, "Supplier name is required");
    const supplier = await supplierRepository.update(id, data);
    if (!supplier) throw new ApiError(404, "Supplier not found");
    return supplier;
  },

  async remove(id) {
    const used = await productRepository.countBySupplier(id);
    if (used > 0)
      throw new ApiError(
        400,
        `Cannot delete: ${used} product(s) use this supplier`,
      );

    const supplier = await supplierRepository.delete(id);
    if (!supplier) throw new ApiError(404, "Supplier not found");
    return supplier;
  },
};
