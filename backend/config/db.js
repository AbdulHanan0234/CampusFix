import mongoose from "mongoose";

// Connect to MongoDB using the MONGO_URI from backend/.env
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("   → Check MONGO_URI inside backend/.env");
    process.exit(1); // stop the server — nothing works without the database
  }
};

export default connectDB;
