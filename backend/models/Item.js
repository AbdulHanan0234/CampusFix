import mongoose from "mongoose";

export const ITEM_KINDS = ["Lost", "Found"];
export const ITEM_CATEGORIES = ["Personal", "Academic", "Electronics", "Other"];
export const ITEM_STATUSES = ["Open", "Matched", "Returned"];

// A Lost & Found post. contactPhone/contactName are PRIVATE: every read strips
// them, and they are only revealed through the gated /contact endpoint once a
// private chat exists between the poster and the other person (or for admin).
const itemSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    kind: { type: String, enum: ITEM_KINDS, required: true },
    // derived from the description when the poster doesn't give one
    title: { type: String, trim: true },
    desc: { type: String, required: true, trim: true },
    category: { type: String, enum: ITEM_CATEGORIES, default: "Other" },
    location: { type: String, trim: true },
    status: { type: String, enum: ITEM_STATUSES, default: "Open" },
    image: { type: mongoose.Schema.Types.ObjectId, ref: "Image", default: null },
    contactPhone: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true },
  },
  { timestamps: true }
);

itemSchema.index({ kind: 1, status: 1, createdAt: -1 });
itemSchema.index({ category: 1 });

export default mongoose.model("Item", itemSchema);
