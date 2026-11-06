import Issue, {
  ISSUE_CATEGORIES,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
} from "../models/Issue.js";
import Image from "../models/Image.js";
import User from "../models/User.js";
import notify from "../utils/notify.js";

// DEPARTMENT ROUTING — an issue lands on the desks of staff whose department
// matches the issue category ("Electrical" → Electricians, never Security).
// When no department matches, it falls to the "Other" department staff.
const routeIssue = async (category) => {
  const match = await User.find({ role: "staff", department: category })
    .select("_id")
    .lean();
  if (match.length) return match.map((s) => s._id);
  const fallback = await User.find({ role: "staff", department: "Other" })
    .select("_id")
    .lean();
  return fallback.map((s) => s._id);
};

// is this staff member on the issue's desk? (admins are always allowed)
const isRouted = (issue, user) =>
  (issue.routedTo || []).some((id) => String(id) === String(user._id));

// can this user see the issue at all?
const canView = (issue, user) =>
  user.role === "admin" ||
  String(issue.owner) === String(user._id) ||
  (user.role === "staff" && isRouted(issue, user));

// Students see their own reports; staff see ONLY the issues routed to their
// department; admin sees everything (oversight).
export const listIssues = async (req, res) => {
  let filter;
  if (req.user.role === "student") filter = { owner: req.user._id };
  else if (req.user.role === "staff") filter = { routedTo: req.user._id };
  else filter = {};
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

  const safeCategory = ISSUE_CATEGORIES.includes(category) ? category : "Other";
  const routedTo = await routeIssue(safeCategory);

  const issue = await Issue.create({
    owner: req.user._id,
    title,
    category: safeCategory,
    priority: ISSUE_PRIORITIES.includes(priority) ? priority : "Medium",
    location,
    desc,
    photos: photoIds,
    routedTo,
    statusHistory: [{ status: "Open", by: req.user._id }],
  });

  // confirmation to the poster, heads-up to exactly the routed staff + admins
  await notify(req.user._id, {
    title: "Your issue has been reported",
    tone: "green",
    glyph: "✓",
    link: `/dashboard/my-issues/${issue._id}`,
  });
  const adminIds = await User.find({ role: { $in: ["admin"] } }).distinct("_id");
  await notify([...routedTo, ...adminIds], {
    title: `New ${safeCategory} issue: ${issue.title}`,
    tone: "amber",
    glyph: "!",
    link: `/dashboard/my-issues/${issue._id}`,
  });

  res.status(201).json({ issue });
};

// owner, a routed staff member, or admin — anyone else gets a 404, exactly as
// if the issue didn't exist
export const getIssue = async (req, res) => {
  const issue = await Issue.findById(req.params.id).lean();
  if (!issue || !canView(issue, req.user)) {
    return res.status(404).json({ message: "Issue not found." });
  }
  res.json({ issue });
};

// staff move ONLY their routed issues through the lifecycle; admin any; the
// student who reported it can never change status themselves
export const updateIssueStatus = async (req, res) => {
  const { status } = req.body;
  if (!ISSUE_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Unknown status." });
  }

  const issue = await Issue.findById(req.params.id);
  if (!issue) {
    return res.status(404).json({ message: "Issue not found." });
  }
  const allowed =
    req.user.role === "admin" ||
    (req.user.role === "staff" && isRouted(issue, req.user));
  if (!allowed) {
    return res
      .status(403)
      .json({ message: "This issue is not in your department's queue." });
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
