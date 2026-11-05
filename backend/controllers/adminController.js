import User from "../models/User.js";

// POST /api/admin/staff — THE admin creates a staff account and hands the
// credentials over personally (there is no staff signup anywhere). The role is
// hardcoded here — a request body can never elevate anyone to staff/admin.
export const createStaff = async (req, res) => {
  try {
    const { name, email, password, position } = req.body;

    if (!name || !email || !password || !position?.trim()) {
      return res.status(400).json({
        message: "Name, email, password and position are all required.",
      });
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
    });

    res.status(201).json({
      message: "Staff account created — share these credentials with them.",
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        position: staff.position,
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
    .select("name email position createdAt")
    .sort("-createdAt")
    .lean();
  res.json({ staff });
};
