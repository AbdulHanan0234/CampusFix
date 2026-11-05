import mongoose from "mongoose";

// Uploaded photos stored as BinData inside MongoDB (typical photos are far
// below the 16 MB document limit — GridFS would be overkill here). A separate
// collection means list queries never pull image bytes by accident.
const imageSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    data: { type: Buffer, required: true },
    mimetype: {
      type: String,
      enum: ["image/png", "image/jpeg", "image/webp", "image/gif"],
      required: true,
    },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Image", imageSchema);
