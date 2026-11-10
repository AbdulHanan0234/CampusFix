import crypto from "crypto";
import User from "../models/User.js";
import Issue from "../models/Issue.js";
import Item from "../models/Item.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";

const DEPARTMENTS = ["IT", "Maintenance", "Cleanliness", "Security", "Electrical", "Other"];

// POST /api/admin/staff — THE admin creates a staff account and hands the
// credentials over personally (there is no staff signup anywhere). The role is
// hardcoded here — a request body can never elevate anyone to staff/admin.
export const createStaff = async (req, res) => {
  try {
    const { name, email, password, position, department } = req.body;

    if (!name || !email || !password || !position?.trim()) {
      return res.status(400).json({
        message: "Name, email, password and position are all required.",
      });
    }
    if (!DEPARTMENTS.includes(department)) {
      return res
        .status(400)
        .json({ message: "Pick the department this staff member works in." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const staff = await User.create({
      name,
      email,
      password,
      role: "staff",
      position,
      department,
    });

    // retro-routing: existing issues of this department now also belong to the
    // new staff member's queue
    await Issue.updateMany(
      { category: department, routedTo: { $ne: staff._id } },
      { $addToSet: { routedTo: staff._id } }
    );

    res.status(201).json({
      message: "Staff account created — share these credentials with them.",
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        position: staff.position,
        department: staff.department,
        // shown once in the admin panel so the admin can pass it on
        password,
      },
    });
  } catch (err) {
    console.error("createStaff error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// GET /api/admin/staff — list staff accounts (admin oversight).
export const listStaff = async (req, res) => {
  const staff = await User.find({ role: "staff" })
    .select("name email position department createdAt")
    .sort("-createdAt")
    .lean();
  res.json({ staff });
};

// POST /api/admin/staff/:id/password — generate a NEW password and show it
// once. The old password is never exposed (bcrypt hashes are one-way — that's
// what makes the database safe to leak), so resetting is the only way back
// into a forgotten staff account. Admin-only, no extra key needed: only the
// admin can reach this route, and nothing secret is revealed — replaced.
export const resetStaffPassword = async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: "staff" });
    if (!staff) {
      return res.status(404).json({ message: "Staff account not found." });
    }

    // same readable alphabet as the frontend generator — no 0/O/1/l lookalikes
    const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
    const password = Array.from(
      crypto.randomBytes(10),
      (b) => alphabet[b % alphabet.length]
    ).join("");

    staff.password = password; // the pre-save hook hashes it
    await staff.save();

    res.json({
      message: `Password reset for ${staff.name} — hand it over personally; it won't be shown again.`,
      password,
    });
  } catch (err) {
    console.error("resetStaffPassword error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// DELETE /api/admin/staff/:id — remove a staff account and every trace of it:
// chats they took part in (with their messages), notifications, lost & found
// posts, issues they reported, their entries on live routing queues, and the
// account itself. Timeline entries they authored become "system" (by: null)
// so other users' issue timelines still render.
export const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: "staff" });
    if (!staff) {
      return res.status(404).json({ message: "Staff account not found." });
    }

    const threads = await Conversation.find({ participants: staff._id })
      .select("_id")
      .lean();

    await Promise.all([
      Message.deleteMany({ conversation: { $in: threads.map((c) => c._id) } }),
      Conversation.deleteMany({ participants: staff._id }),
      Notification.deleteMany({ user: staff._id }),
      Item.deleteMany({ owner: staff._id }),
      Issue.deleteMany({ owner: staff._id }),
      Issue.updateMany(
        { routedTo: staff._id },
        { $pull: { routedTo: staff._id } }
      ),
      Issue.updateMany(
        { "statusHistory.by": staff._id },
        { $set: { "statusHistory.$[h].by": null } },
        { arrayFilters: [{ "h.by": staff._id }] }
      ),
    ]);

    await staff.deleteOne();

    res.json({
      message: `${staff.name}'s account and all their data were deleted.`,
    });
  } catch (err) {
    console.error("deleteStaff error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};
