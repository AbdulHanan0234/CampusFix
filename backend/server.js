import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// --- global middleware ---
app.use(cors()); // allow requests coming from the React dev server (different port)
app.use(express.json()); // parse JSON request bodies so we can read req.body

// --- routes ---
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

// only start accepting requests once the database is connected
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
  );
});
