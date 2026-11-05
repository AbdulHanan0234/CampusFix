import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";

// DESTRUCTIVE — wipes every collection on the connected database (users,
// issues, items, chats, everything). Used to start fresh on demand:
//
//   npm run reset-db
//
await connectDB();

const collections = await mongoose.connection.db.listCollections().toArray();
if (!collections.length) {
  console.log("Database is already empty.");
} else {
  for (const { name } of collections) {
    await mongoose.connection.dropCollection(name);
    console.log(`🗑  dropped ${name}`);
  }
  console.log("✅ Database wiped — fresh start.");
}

await mongoose.disconnect();
