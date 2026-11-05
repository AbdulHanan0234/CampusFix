import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

// Creates (or promotes a user to) THE single admin account. Staff accounts are
// made from the admin panel; this CLI is the only way an admin ever exists.
//
//   npm run create-admin -- admin@campusfix.edu StrongPass123 "Admin Name"
//
const [email, password, name] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: npm run create-admin -- <email> <password> [name]");
  process.exit(1);
}
if (password.length < 6) {
  console.error("Password must be at least 6 characters.");
  process.exit(1);
}

await connectDB();

const existing = await User.findOne({ email: email.toLowerCase() });
if (existing) {
  existing.role = "admin";
  await existing.save();
  console.log(`✅ Promoted "${existing.email}" to admin.`);
} else {
  // enforce exactly one admin — refuse if one already exists
  const admins = await User.countDocuments({ role: "admin" });
  if (admins >= 1) {
    console.error("❌ An admin already exists — CampusFix allows only one.");
    process.exit(1);
  }
  const admin = await User.create({ name: name || "Admin", email, password, role: "admin" });
  console.log(`✅ Admin created: ${admin.email} — log in with the password you provided.`);
}

await mongoose.disconnect();
