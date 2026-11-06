import mongoose from "mongoose";

export const ISSUE_CATEGORIES = [
  "IT",
  "Maintenance",
  "Cleanliness",
  "Security",
  "Electrical",
  "Other",
];
export const ISSUE_PRIORITIES = ["Low", "Medium", "High"];
export const ISSUE_STATUSES = ["Open", "Assigned", "In Progress", "Resolved"];

// A campus problem reported by a student. Photos live in the Image collection
// (BinData) — only their ids are kept here, so listing issues never loads bytes.
const issueSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: ISSUE_CATEGORIES, default: "Other" },
    priority: { type: String, enum: ISSUE_PRIORITIES, default: "Medium" },
    status: { type: String, enum: ISSUE_STATUSES, default: "Open" },
    location: { type: String, required: true, trim: true },
    desc: { type: String, required: true, trim: true },
    photos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
    // the staff desks this issue was routed to (department match at creation,
    // falling back to department "Other" when no department matches). Staff
    // see, chat on, and progress only the issues routed to them.
    routedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // timeline rendered on the Issue Detail page — appended on every status change
    statusHistory: [
      {
        status: { type: String, enum: ISSUE_STATUSES },
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// dashboard lists sort by newest per owner; status feeds the staff work queue
issueSchema.index({ owner: 1, createdAt: -1 });
issueSchema.index({ status: 1 });

export default mongoose.model("Issue", issueSchema);
