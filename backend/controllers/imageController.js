import Image from "../models/Image.js";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB — mirrors the client-side cap

// POST /api/images — store one photo as BinData. The frontend sends
// { data: "data:image/png;base64,…" } (one call per photo) and gets the Image
// id back to reference from its issue/item.
export const uploadImage = async (req, res) => {
  try {
    const { data } = req.body;
    if (typeof data !== "string" || !data.startsWith("data:image/")) {
      return res.status(400).json({ message: "No image data received." });
    }

    // parse AND whitelist the mimetype in one step — never trust the client's
    // claimed type alone
    const match = data.match(
      /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/
    );
    if (!match) {
      return res
        .status(400)
        .json({ message: "Only PNG, JPEG, WebP or GIF images are allowed." });
    }
    const [, mimetype, base64] = match;
    const buffer = Buffer.from(base64, "base64");

    // the client checks size too, but the server re-checks decoded bytes
    if (buffer.length > MAX_BYTES) {
      return res
        .status(400)
        .json({ message: "Image is too large (max 3 MB)." });
    }

    const image = await Image.create({
      owner: req.user._id,
      data: buffer,
      mimetype,
      size: buffer.length,
    });
    res.status(201).json({ image: image._id });
  } catch (err) {
    console.error("uploadImage error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// GET /api/images/:id — raw bytes. The frontend fetches these with its auth
// header (AuthImg component → blob URL), so there is no open image URL.
export const getImage = async (req, res) => {
  const image = await Image.findById(req.params.id).lean();
  if (!image) {
    return res.status(404).json({ message: "Image not found." });
  }
  // lean() hands back a BSON Binary, not a Node Buffer — wrap it or Express
  // will JSON-stringify the bytes instead of sending them raw
  res.type(image.mimetype);
  // ids are immutable so aggressive caching is safe; private = browser-only
  res.set("Cache-Control", "private, max-age=31536000, immutable");
  res.send(Buffer.from(image.data.buffer ?? image.data));
};
