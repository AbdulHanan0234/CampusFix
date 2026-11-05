import jwt from "jsonwebtoken";
import User from "../models/User.js";
import BlockedToken from "../models/BlockedToken.js";

// "protect" middleware — guards routes that require a logged-in user.
// Reads the "Authorization: Bearer <token>" header, verifies the token,
// and attaches the user document to req.user for the next handler.
const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // a logged-out token is blocked even though it hasn't expired yet
    const blocked = await BlockedToken.findOne({ token });
    if (blocked) {
      return res
        .status(401)
        .json({ message: "Session ended, please log in again" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    req.user = user;
    req.token = token; // logout needs the raw token to blacklist it
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "Not authorized, token invalid or expired" });
  }
};

export default protect;
