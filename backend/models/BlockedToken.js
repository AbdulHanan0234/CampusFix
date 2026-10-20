import mongoose from "mongoose";

// JWTs can't be deleted once issued — so on logout we remember the token
// here until the moment it would have expired anyway. The protect middleware
// refuses any token found in this list.
const blockedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

// TTL index — MongoDB automatically deletes each entry at expiresAt,
// so the list stays small without any cleanup job
blockedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("BlockedToken", blockedTokenSchema);
