import User from "../models/User.js";
import Issue from "../models/Issue.js";

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
