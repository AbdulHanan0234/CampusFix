import Item, { ITEM_KINDS, ITEM_CATEGORIES } from "../models/Item.js";
import Image from "../models/Image.js";
import Conversation from "../models/Conversation.js";
import notify from "../utils/notify.js";

// contact details are PRIVATE — every list/detail read strips them; they are
// only revealed through the gated getContact endpoint
const PUBLIC_FIELDS = "-contactPhone -contactName";

const safeRegex = (text) =>
  new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

export const createItem = async (req, res) => {
  const { kind, title, desc, category, location, contactPhone, contactName, image } =
    req.body;

  if (!ITEM_KINDS.includes(kind)) {
    return res.status(400).json({ message: "Kind must be Lost or Found." });
  }
  if (!desc?.trim()) {
    return res.status(400).json({ message: "Please describe the item." });
  }
  if (!contactPhone?.trim()) {
    return res.status(400).json({ message: "Please add a contact number." });
  }

  // one optional photo — must be an Image the requester uploaded themselves
  let imageId = null;
  if (image) {
    const owned = await Image.findOne({ _id: image, owner: req.user._id }).select("_id");
    if (!owned) {
      return res.status(400).json({ message: "Invalid image." });
    }
    imageId = owned._id;
  }

  const item = await Item.create({
    owner: req.user._id,
    kind,
    title: title?.trim() || desc.trim().slice(0, 60),
    desc,
    category: ITEM_CATEGORIES.includes(category) ? category : "Other",
    location,
    contactPhone,
    contactName,
    image: imageId,
  });

  await notify(req.user._id, {
    title: kind === "Lost" ? "Your lost item has been posted" : "Your found item has been posted",
    tone: kind === "Lost" ? "amber" : "green",
    glyph: "✦",
    link: `/dashboard/lost-found/${item._id}`,
  });

  const created = await Item.findById(item._id)
    .select(PUBLIC_FIELDS)
    .populate("owner", "name")
    .lean();
  res.status(201).json({ item: created });
};

// ?kind=Lost|Found|Matched · ?category= · ?q= — all optional
export const listItems = async (req, res) => {
  const { kind, category, q } = req.query;
  const filter = {};
  if (kind === "Lost" || kind === "Found") filter.kind = kind;
  else if (kind === "Matched") filter.status = "Matched";
  if (category) filter.category = category;
  if (q) filter.$or = [{ title: safeRegex(q) }, { desc: safeRegex(q) }];

  const items = await Item.find(filter)
    .select(PUBLIC_FIELDS)
    .populate("owner", "name")
    .sort("-createdAt")
    .lean();
  res.json({ items });
};

export const getItem = async (req, res) => {
  const item = await Item.findById(req.params.id)
    .select(PUBLIC_FIELDS)
    .populate("owner", "name")
    .lean();
  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }
  res.json({ item });
};

// GET /api/items/:id/contact — the privacy gate. The phone/name unlock for the
// owner, an admin, or once a private chat exists between the poster and the
// requester. Everyone else gets 403 — "open a chat to connect".
export const getItemContact = async (req, res) => {
  const item = await Item.findById(req.params.id)
    .select("owner contactPhone contactName")
    .lean();
  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  const isOwner = String(item.owner) === String(req.user._id);
  const hasChat = await Conversation.exists({
    refType: "item",
    refId: item._id,
    participants: req.user._id,
  });
  if (!isOwner && req.user.role !== "admin" && !hasChat) {
    return res
      .status(403)
      .json({ message: "Contact is hidden — open a chat with the poster first." });
  }

  res.json({ contactPhone: item.contactPhone, contactName: item.contactName });
};

// owner (or admin) marks their item Returned once it's back home
export const updateItem = async (req, res) => {
  const { status } = req.body;
  if (status !== "Returned") {
    return res
      .status(400)
      .json({ message: "Only marking an item as Returned is allowed." });
  }

  const item = await Item.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }
  const isOwner = String(item.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ message: "You can only update your own post." });
  }

  item.status = "Returned";
  await item.save();

  const updated = await Item.findById(item._id).select(PUBLIC_FIELDS).lean();
  res.json({ item: updated });
};
