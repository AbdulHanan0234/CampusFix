import {
  ISSUE_CATEGORIES,
  ISSUE_PRIORITIES,
} from "../models/Issue.js";

// Gemini free tier — the key lives ONLY in backend/.env (GEMINI_API_KEY) and
// never reaches the frontend; students hit this endpoint, which is auth-
// protected so strangers can't burn the free quota.
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MAX_TEXT = 2000;

const PROMPT = `You are the AI assistant inside a campus issue-reporting app called CampusFix.
A student describes a problem in their own casual words. Organize it into a proper complaint.
Return JSON with exactly these fields:
- "title": short summary, max 60 characters
- "category": exactly one of ${JSON.stringify(ISSUE_CATEGORIES)}
- "priority": exactly one of ${JSON.stringify(ISSUE_PRIORITIES)} (High = safety risk or many people affected)
- "location": the place if the student mentioned one, otherwise ""
- "polished": a clear, formal 2-4 sentence complaint description, strictly based on what the student said — never invent facts`;

// call Gemini and shape the reply into our form fields; throws Error with a
// friendly message on any failure
const organizeWithGemini = async (text) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const err = new Error("AI key not configured — add GEMINI_API_KEY to backend/.env.");
    err.status = 503;
    throw err;
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${PROMPT}\n\nStudent wrote: "${text}"` }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
      signal: AbortSignal.timeout(25_000),
    }
  );

  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json())?.error?.message || "";
    } catch {
      // body wasn't JSON — fall through with the status alone
    }
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      throw new Error("Gemini rejected the API key — check GEMINI_API_KEY in backend/.env.");
    }
    if (res.status === 404) {
      throw new Error(
        `Model "${MODEL}" isn't available on your key — set GEMINI_MODEL in backend/.env.`
      );
    }
    if (res.status === 429) {
      throw new Error("Gemini free quota is used up right now — try again in a minute.");
    }
    throw new Error(detail || "Gemini request failed.");
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Gemini returned an empty answer.");

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Gemini's answer wasn't valid JSON.");
  }

  // coerce everything — the frontend must only ever receive safe, known values
  return {
    title: String(parsed.title || "").trim().slice(0, 80),
    category: ISSUE_CATEGORIES.includes(parsed.category) ? parsed.category : "Other",
    priority: ISSUE_PRIORITIES.includes(parsed.priority) ? parsed.priority : "Medium",
    location: String(parsed.location || "").trim().slice(0, 120),
    polished: String(parsed.polished || "").trim() || text,
  };
};

// POST /api/ai/organize — { text } in, organized complaint fields out
export const organize = async (req, res) => {
  try {
    const text = req.body.text?.trim();
    if (!text) {
      return res.status(400).json({ message: "Write your problem first." });
    }
    if (text.length > MAX_TEXT) {
      return res
        .status(400)
        .json({ message: `Keep it under ${MAX_TEXT} characters.` });
    }

    const result = await organizeWithGemini(text);
    res.json(result);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return res.status(504).json({ message: "Gemini took too long to answer." });
    }
    console.error("ai organize error:", err.message);
    res.status(502).json({ message: err.message || "AI request failed." });
  }
};
