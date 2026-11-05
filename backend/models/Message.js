import mongoose from "mongoose";

// A single chat message. Access is ALWAYS checked against the parent
// conversation's participants (conversationController.canAccess) — never
// trust the frontend to hide threads.
const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    // who has seen this message — powers future "seen" indicators
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// chronological fetch + the ?after= cursor used by chat polling
messageSchema.index({ conversation: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
