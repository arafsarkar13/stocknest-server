import mongoose from "mongoose";

// detail rows are embedded inside the order (master-detail)
const itemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true }, // saved copy, so old orders stay readable
    sku: { type: String, default: "" },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    unitCost: {
      type: Number,
      required: true,
      min: [0, "Cost cannot be negative"],
    },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    items: {
      type: [itemSchema],
      validate: [(list) => list.length > 0, "Add at least one product"],
    },
    totalAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "received", "cancelled"],
      default: "pending",
    },
    note: { type: String, default: "", trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receivedAt: { type: Date },
  },
  { timestamps: true },
);

purchaseOrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);
