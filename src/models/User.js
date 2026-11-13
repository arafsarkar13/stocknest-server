import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true, // also creates an index on email
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["admin", "manager", "staff"],
      default: "staff",
    },
    isActive: { type: Boolean, default: true },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
