import mongoose from "mongoose";

// A chat thread. Two shapes, one collection:
//  · issue threads — ONE per issue, participants [issue owner]. Students own
//    their thread; any staff/admin can join it (management is a team, not one
//    person). Access is decided by role, see conversationController.
//  · item threads — a PRIVATE 1:1 thread per (item, person). Two different
//    people contacting the same poster get two separate threads, so contact
//    details shared in one thread are never visible to anyone else.
const conversationSchema = new mongoose.Schema(
  {
    refType: { type: String, enum: ["issue", "item"], required: true },
    refId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // deterministic thread identity: "issue:<id>" or "item:<id>:<sorted pair>".
    // A plain multikey-unique index on participants can't express "one thread
    // per pair" — the same owner in two different item threads would collide.
    // The pairKey does, and its unique index makes find-or-create race-safe.
    pairKey: { type: String, required: true, unique: true },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // denormalized so the chat list doesn't need a message lookup per thread
    lastMessage: {
      text: { type: String, default: "" },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      at: { type: Date },
    },
  },
  { timestamps: true }
);

// pairKey's unique:true already enforces thread uniqueness; this one speeds
// up the chat inbox listing
conversationSchema.index({ participants: 1, "lastMessage.at": -1 });

export default mongoose.model("Conversation", conversationSchema);
