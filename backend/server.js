import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// --- global middleware ---
app.use(cors()); // allow requests coming from the React dev server (different port)
// photos travel as base64 inside JSON bodies, so the default 100 kb limit is far
// too small — the per-image 3 MB cap is re-checked inside the image controller
app.use(express.json({ limit: "16mb" }));

// --- routes ---
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

// unknown /api path → JSON 404 (Express 5 has no app.get("*"); the frontend is
// served by Vite so no SPA fallback lives here)
app.use("/api", (req, res) => res.status(404).json({ message: "Not found." }));

// terminal error handler — Express 5 auto-forwards rejected async handlers
// here; replies stay JSON so the frontend never has to parse an HTML error page
app.use((err, req, res, _next) => {
  if (err?.name === "CastError") {
    return res.status(404).json({ message: "Not found." });
  }
  if (err?.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  console.error("server error:", err);
  res.status(500).json({ message: "Server error. Please try again." });
});

const PORT = process.env.PORT || 5000;

// only start accepting requests once the database is connected
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
  );
});
