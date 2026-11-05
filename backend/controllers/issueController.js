import Issue, {
  ISSUE_CATEGORIES,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
} from "../models/Issue.js";
import Image from "../models/Image.js";
import User from "../models/User.js";
import notify from "../utils/notify.js";

// Students see their own reports; staff/admin see every issue (the work queue).
export const listIssues = async (req, res) => {
  const filter = req.user.role === "student" ? { owner: req.user._id } : {};
  const issues = await Issue.find(filter).sort("-createdAt").lean();
  res.json({ issues });
};

export const createIssue = async (req, res) => {
  const { title, category, priority, location, desc, photos } = req.body;

  if (!title?.trim() || !location?.trim() || !desc?.trim()) {
    return res
      .status(400)
      .json({ message: "Title, location and description are required." });
  }

  // photos arrive as Image ids uploaded first via POST /api/images —
  // accept only images that actually belong to the requester
  let photoIds = [];
  if (Array.isArray(photos) && photos.length) {
    const owned = await Image.find({
      _id: { $in: photos },
      owner: req.user._id,
    }).select("_id");
    photoIds = owned.map((img) => img._id);
  }

  const issue = await Issue.create({
    owner: req.user._id,
    title,
    category: ISSUE_CATEGORIES.includes(category) ? category : "Other",
    priority: ISSUE_PRIORITIES.includes(priority) ? priority : "Medium",
    location,
    desc,
    photos: photoIds,
    statusHistory: [{ status: "Open", by: req.user._id }],
  });

  // confirmation to the poster, heads-up to management
  await notify(req.user._id, {
    title: "Your issue has been reported",
    tone: "green",
    glyph: "✓",
    link: `/dashboard/my-issues/${issue._id}`,
  });
  const staffIds = await User.find({ role: { $in: ["staff", "admin"] } })
    .distinct("_id");
  await notify(staffIds, {
    title: `New issue: ${issue.title}`,
    tone: "amber",
    glyph: "!",
    link: `/dashboard/my-issues/${issue._id}`,
  });

  res.status(201).json({ issue });
};

// owner or staff/admin — anyone else gets a 404, exactly as if it didn't exist
export const getIssue = async (req, res) => {
  const issue = await Issue.findById(req.params.id).lean();
  if (!issue) {
    return res.status(404).json({ message: "Issue not found." });
  }
  const isOwner = String(issue.owner) === String(req.user._id);
  if (!isOwner && !["staff", "admin"].includes(req.user.role)) {
    return res.status(404).json({ message: "Issue not found." });
  }
  res.json({ issue });
};

// staff/admin move an issue through its lifecycle; every change lands in the
// timeline the student sees and pings the owner
export const updateIssueStatus = async (req, res) => {
  const { status } = req.body;
  if (!ISSUE_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Unknown status." });
  }

  const issue = await Issue.findById(req.params.id);
  if (!issue) {
    return res.status(404).json({ message: "Issue not found." });
  }

  issue.status = status;
  issue.statusHistory.push({ status, by: req.user._id });
  await issue.save();

  await notify(issue.owner, {
    title: `Status updated: ${issue.title}`,
    tone: "blue",
    glyph: "i",
    link: `/dashboard/my-issues/${issue._id}`,
  });

  res.json({ issue });
};
