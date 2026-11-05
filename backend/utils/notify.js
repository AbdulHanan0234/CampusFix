import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Create in-app notification(s), honouring each recipient's Profile
// preferences (prefs.inApp = false silences them). Accepts one user id or an
// array. Failures are logged, never thrown — a lost notification should not
// fail the request that caused it.
const notify = async (users, { title, tone = "blue", glyph = "i", link = "" }) => {
  const ids = Array.isArray(users) ? users : [users];
  if (!ids.length) return;
  try {
    const recipients = await User.find({
      _id: { $in: ids },
      "prefs.inApp": true,
    })
      .select("_id")
      .lean();
    if (!recipients.length) return;
    await Notification.insertMany(
      recipients.map((u) => ({ user: u._id, title, tone, glyph, link }))
    );
  } catch (err) {
    console.error("notify error:", err.message);
  }
};

export default notify;
