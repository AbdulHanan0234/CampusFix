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
