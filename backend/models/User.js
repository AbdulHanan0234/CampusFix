import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true, // no two users can share an email
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    // select: false → the password hash is NEVER returned in queries
    // unless explicitly requested (see login controller)
    password: { type: String, required: true, minlength: 6, select: false },
    // students see their own reports; staff see all issues and answer chats;
    // admin additionally manages staff accounts (exactly one, via scripts/createAdmin.js)
    role: {
      type: String,
      enum: ["student", "staff", "admin"],
      default: "student",
      index: true,
    },
    // what this person works on — set by the admin when creating a staff
    // account ("IT Technician", "Electrician", …) so everyone's job is known
    position: { type: String, trim: true },
    // which issues land on this staff member's desk — matches the issue
    // categories; "Other" catches problems no department matches
    department: {
      type: String,
      enum: ["IT", "Maintenance", "Cleanliness", "Security", "Electrical", "Other"],
      trim: true,
    },
    // profile extras edited on the Profile tab. phone is private — it is only
    // ever returned to the account owner, never to other users
    dept: { type: String, trim: true },
    studentId: { type: String, trim: true },
    phone: { type: String, trim: true },
    // notification preferences toggled on the Profile tab. email/weekly are
    // stored for a future mailer — inApp is enforced today (utils/notify.js)
    prefs: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      weekly: { type: Boolean, default: false },
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

// Before saving, hash the password — but only if it was created/changed.
// The plain password is never stored in the database.
// (Mongoose 9 middleware is async — no next() callback needed)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare a plain-text login attempt with the stored hash (used at login)
userSchema.methods.matchPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
