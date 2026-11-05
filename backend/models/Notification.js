import mongoose from "mongoose";

// In-app notification. tone/glyph map to the existing dash-notific CSS classes
// (t-green / t-blue / t-violet / t-amber). `link` is the in-app route the
// Notifications page navigates to when the row is clicked.
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    tone: {
      type: String,
      enum: ["green", "blue", "violet", "amber"],
      default: "blue",
    },
    glyph: { type: String, default: "i" },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

export default mongoose.model("Notification", notificationSchema);
