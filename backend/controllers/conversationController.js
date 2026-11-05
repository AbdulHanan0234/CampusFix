import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Issue from "../models/Issue.js";
import Item from "../models/Item.js";
import User from "../models/User.js";
import notify from "../utils/notify.js";

// ---- access rules (privacy core) ------------------------------------------
// issue threads: the student who owns it + any staff/admin (management is a team)
// item threads:  ONLY the two participants — plus admin, who can open any
//                thread as evidence when two people are in conflict
export const canAccess = (convo, user) => {
  if (user.role === "admin") return true;
  if (convo.participants.some((p) => String(p) === String(user._id))) return true;
  return convo.refType === "issue" && user.role === "staff";
};

// who should be pinged when `sender` writes in this thread
const recipientsFor = async (convo, senderId, senderRole) => {
  if (convo.refType === "item") {
    // strictly the other participant — a third person is in a different thread
    return convo.participants.filter((p) => String(p) !== String(senderId));
  }
  // issue thread: student writes → management; staff writes → the student
  if (senderRole === "student") {
    return User.find({ role: { $in: ["staff", "admin"] } }).distinct("_id");
  }
  return convo.participants.filter((p) => String(p) !== String(senderId));
};

const linkFor = (convo) =>
  convo.refType === "issue"
    ? `/dashboard/my-issues/${convo.refId}`
    : `/dashboard/lost-found/${convo.refId}`;

// POST /api/conversations — find-or-create the thread and optionally post the
// first message in the same call. body: { refType, refId, text? }
export const openConversation = async (req, res) => {
  const { refType, refId, text } = req.body;
  if (!["issue", "item"].includes(refType)) {
    return res.status(400).json({ message: "Unknown conversation type." });
  }
  if (!mongoose.isValidObjectId(refId)) {
    return res.status(400).json({ message: "Invalid reference id." });
  }

  let participants;
  if (refType === "issue") {
    const issue = await Issue.findById(refId).select("owner").lean();
    if (!issue) return res.status(404).json({ message: "Issue not found." });
    // students may only open the thread of their OWN issue
    if (
      req.user.role === "student" &&
      String(issue.owner) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "This is not your issue." });
    }
    participants = [issue.owner]; // staff join by role, not by being listed
  } else {
    const item = await Item.findById(refId).select("owner status").lean();
    if (!item) return res.status(404).json({ message: "Item not found." });
    if (String(item.owner) === String(req.user._id)) {
      return res
        .status(400)
        .json({ message: "That's your own post — no chat needed." });
    }
    // owner first, always — keeps the find-or-create filter deterministic
    participants = [item.owner, req.user._id];
  }

  // find-or-create keyed on the deterministic pairKey; its unique index
  // settles creation races — on a duplicate key we read the thread the other
  // request just made
  const pairKey =
    refType === "issue"
      ? `issue:${refId}`
      : `item:${refId}:${participants.map(String).sort().join("_")}`;

  let convo;
  try {
    convo = await Conversation.findOneAndUpdate(
      { pairKey },
      {
        $setOnInsert: {
          refType,
          refId,
          pairKey,
          participants,
          createdBy: req.user._id,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    if (err.code !== 11000) throw err;
    convo = await Conversation.findOne({ pairKey });
  }

  // a Lost/Found item that has been contacted counts as Matched
  if (refType === "item") {
    await Item.updateOne({ _id: refId, status: "Open" }, { status: "Matched" });
  }

  let message = null;
  if (text?.trim()) {
    message = await addMessage(convo, req.user, text.trim());
  }

  res.status(201).json({ conversation: convo, message });
};

// shared by openConversation and sendMessage
const addMessage = async (convo, user, text) => {
  const message = await Message.create({
    conversation: convo._id,
    sender: user._id,
    text,
  });

  await Conversation.findByIdAndUpdate(convo._id, {
    lastMessage: { text, sender: user._id, at: message.createdAt },
  });

  const recipients = await recipientsFor(convo, user._id, user.role);
  await notify(recipients, {
    title: `New message from ${user.name}`,
    tone: "violet",
    glyph: "✦",
    link: linkFor(convo),
  });

  return message;
};

// GET /api/conversations — threads for the chat inbox.
// students: only threads they're in · staff/admin: theirs + every issue thread
export const listConversations = async (req, res) => {
  const filter =
    req.user.role === "student"
      ? { participants: req.user._id }
      : { $or: [{ participants: req.user._id }, { refType: "issue" }] };

  const convos = await Conversation.find(filter)
    .sort({ "lastMessage.at": -1, createdAt: -1 })
    .lean();

  // batch-load the human context each row shows: ref title/kind + counterpart
  const issueIds = convos.filter((c) => c.refType === "issue").map((c) => c.refId);
  const itemIds = convos.filter((c) => c.refType === "item").map((c) => c.refId);
  const [issues, items, people] = await Promise.all([
    issueIds.length ? Issue.find({ _id: { $in: issueIds } }).select("title").lean() : [],
    itemIds.length ? Item.find({ _id: { $in: itemIds } }).select("title kind").lean() : [],
    User.find({
      _id: { $in: convos.flatMap((c) => c.participants) },
    })
      .select("name role")
      .lean(),
  ]);

  const issueById = new Map(issues.map((i) => [String(i._id), i]));
  const itemById = new Map(items.map((i) => [String(i._id), i]));
  const personById = new Map(people.map((p) => [String(p._id), p]));

  const enriched = convos.map((c) => {
    const ref =
      c.refType === "issue" ? issueById.get(String(c.refId)) : itemById.get(String(c.refId));
    // issue threads: the owner (participants[0]) sees "Management" on the other
    // side; staff/admin see the student. item threads: the other participant.
    const isOwner = String(c.participants[0]) === String(req.user._id);
    let counterpartName = "Management";
    let counterpartRole = "staff";
    if (c.refType === "item") {
      const other =
        personById.get(
          String(c.participants.find((p) => String(p) !== String(req.user._id)) || "")
        ) || personById.get(String(c.participants[0]));
      counterpartName = other?.name || "CampusFix";
      counterpartRole = other?.role || null;
    } else if (!isOwner) {
      const owner = personById.get(String(c.participants[0]));
      counterpartName = owner?.name || "Student";
      counterpartRole = owner?.role || "student";
    }
    return {
      ...c,
      refTitle: ref?.title || "(deleted)",
      refKind: ref?.kind || null,
      counterpartName,
      counterpartRole,
    };
  });

  res.json({ conversations: enriched });
};

// GET /api/conversations/:id — thread meta for the chat header
export const getConversation = async (req, res) => {
  const convo = await Conversation.findById(req.params.id).lean();
  if (!convo) return res.status(404).json({ message: "Conversation not found." });
  if (!canAccess(convo, req.user)) {
    return res.status(403).json({ message: "This chat is private." });
  }
  res.json({ conversation: convo });
};

// GET /api/conversations/:id/messages?after=<ISO> — chronological; ?after= is
// the polling cursor so each tick only ships what's new
export const listMessages = async (req, res) => {
  const convo = await Conversation.findById(req.params.id).lean();
  if (!convo) return res.status(404).json({ message: "Conversation not found." });
  if (!canAccess(convo, req.user)) {
    return res.status(403).json({ message: "This chat is private." });
  }

  const filter = { conversation: convo._id };
  if (req.query.after && !isNaN(Date.parse(req.query.after))) {
    filter.createdAt = { $gt: new Date(req.query.after) };
  }
  const messages = await Message.find(filter)
    .sort("createdAt")
    .limit(200)
    .populate("sender", "name role")
    .lean();
  res.json({ messages });
};

// POST /api/conversations/:id/messages
export const sendMessage = async (req, res) => {
  const convo = await Conversation.findById(req.params.id);
  if (!convo) return res.status(404).json({ message: "Conversation not found." });
  if (!canAccess(convo, req.user)) {
    return res.status(403).json({ message: "This chat is private." });
  }
  const text = req.body.text?.trim();
  if (!text) return res.status(400).json({ message: "Message is empty." });

  const message = await addMessage(convo, req.user, text);
  res.status(201).json({ message });
};

// POST /api/conversations/:id/read — mark the other side's messages as seen
export const markConversationRead = async (req, res) => {
  const convo = await Conversation.findById(req.params.id).lean();
  if (!convo) return res.status(404).json({ message: "Conversation not found." });
  if (!canAccess(convo, req.user)) {
    return res.status(403).json({ message: "This chat is private." });
  }
  await Message.updateMany(
    {
      conversation: convo._id,
      sender: { $ne: req.user._id },
      readBy: { $ne: req.user._id },
    },
    { $addToSet: { readBy: req.user._id } }
  );
  res.json({ ok: true });
};
