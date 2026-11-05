import jwt from "jsonwebtoken";
import User from "../models/User.js";
import BlockedToken from "../models/BlockedToken.js";

// Create a signed token containing the user's id (valid for 7 days)
const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// The one user shape sent to the frontend — everything the Profile tab shows.
// Never includes the password hash (select: false already guards this).
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  dept: user.dept,
  studentId: user.studentId,
  phone: user.phone,
  prefs: user.prefs,
});

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, confirm } = req.body;

    // server-side validation — never trust the frontend alone
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }
    if (confirm !== undefined && password !== confirm) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    // the pre("save") hook in the User model hashes the password automatically.
    // only these fields are picked up — a client cannot sign up as staff/admin
    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: "Account created successfully.",
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    console.error("signup error:", err); // shows the real cause in the terminal
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter your email and password." });
    }

    // password has select: false in the schema → request it explicitly here
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    // same generic message for "no such user" and "wrong password",
    // so attackers can't discover which emails are registered
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({
      message: "Logged in successfully.",
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// GET /api/auth/me — protected route that returns the logged-in user.
// Frontend can call this on page load to restore a session from the token.
export const me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

// PATCH /api/auth/profile — update the editable Profile fields. email and role
// are identity/permission and are refused here (and ignored at signup), so the
// only way either changes is the admin CLI — never the HTTP surface.
export const updateProfile = async (req, res) => {
  try {
    const { name, dept, studentId, phone, prefs } = req.body;

    const user = await User.findById(req.user._id);
    if (name !== undefined) user.name = String(name).trim();
    if (dept !== undefined) user.dept = dept;
    if (studentId !== undefined) user.studentId = studentId;
    if (phone !== undefined) user.phone = phone;
    // prefs arrives partially ({ inApp: false }) — merge over the current values
    if (prefs !== undefined && typeof prefs === "object" && prefs !== null) {
      user.prefs = {
        email: user.prefs?.email ?? true,
        inApp: user.prefs?.inApp ?? true,
        weekly: user.prefs?.weekly ?? false,
        ...prefs,
      };
    }

    await user.save(); // runs schema validation on everything
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// POST /api/auth/logout (protected) — block this exact token until the moment
// it would have expired anyway. After this, even a copied token is rejected.
export const logout = async (req, res) => {
  try {
    const { exp } = jwt.decode(req.token); // expiry timestamp from the token
    await BlockedToken.create({
      token: req.token,
      expiresAt: new Date(exp * 1000),
    });
    res.json({ message: "Logged out." });
  } catch (err) {
    console.error("logout error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};
