import Notification from "../models/Notification.js";

// GET /api/notifications (?unread=1) — the caller's own notifications, newest first
export const listNotifications = async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.unread === "1") filter.read = false;
  const notifications = await Notification.find(filter)
    .sort("-createdAt")
    .lean();
  res.json({ notifications });
};

// GET /api/notifications/unread-count — powers the bell/sidebar badge
export const unreadCount = async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    read: false,
  });
  res.json({ count });
};

export const markRead = async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, user: req.user._id },
    { read: true }
  );
  res.json({ ok: true });
};

export const markAllRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );
  res.json({ ok: true });
};
