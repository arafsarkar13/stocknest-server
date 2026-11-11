import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: { type: String, default: "" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    costPrice: {
      type: Number,
      default: 0,
      min: [0, "Cost price cannot be negative"],
    },
    stock: { type: Number, default: 0, min: [0, "Stock cannot be negative"] },
    lowStockLimit: { type: Number, default: 10, min: 0 },
    image: { type: String, default: "" },
    brand: { type: String, default: "" },
    source: { type: String, enum: ["manual", "dummyjson"], default: "manual" },
    externalId: { type: Number, unique: true, sparse: true },
    // DummyJSON id, stops duplicate imports
  },
  { timestamps: true },
);

// indexes: faster search and filtering
productSchema.index({ name: 1 });
productSchema.index({ category: 1, price: 1 });

export default mongoose.model("Product", productSchema);
