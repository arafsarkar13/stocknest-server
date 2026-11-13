import mongoose from "mongoose";

// the editable profile fields (all optional, only changed ones are stored)
const fieldsShape = {
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
};

const profileChangeRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    changes: {
      type: new mongoose.Schema(fieldsShape, { _id: false }),
      required: true,
    }, // what the user wants
    previous: { type: new mongoose.Schema(fieldsShape, { _id: false }) }, // values at request time
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNote: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

// a user can have only ONE pending request at a time
profileChangeRequestSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } },
);
profileChangeRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model(
  "ProfileChangeRequest",
  profileChangeRequestSchema,
);
