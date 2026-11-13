import mongoose from "mongoose";

// detail rows are embedded in the sale (master-detail)
const itemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    sku: { type: String, default: "" },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0 }, // saved so profit can be reported later
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customerName: { type: String, default: "Walk-in Customer", trim: true },
    customerPhone: { type: String, default: "", trim: true },
    items: {
      type: [itemSchema],
      validate: [(list) => list.length > 0, "Add at least one product"],
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "mobile"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["completed", "cancelled"],
      default: "completed",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// indexes used by the sales list and the dashboard aggregations
saleSchema.index({ createdAt: -1 });
saleSchema.index({ status: 1, createdAt: -1 });
saleSchema.index({ "items.product": 1 });

export default mongoose.model("Sale", saleSchema);
