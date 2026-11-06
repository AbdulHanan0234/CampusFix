import {
  ISSUE_CATEGORIES,
  ISSUE_PRIORITIES,
} from "../models/Issue.js";

// Gemini free tier — the key lives ONLY in backend/.env (GEMINI_API_KEY) and
// never reaches the frontend; students hit this endpoint, which is auth-
// protected so strangers can't burn the free quota.
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MAX_TEXT = 2000;
const TIMEOUT_MS = 45_000; // free tier can be slow under load
const RETRY_DELAYS = [3000, 6000]; // wait before retrying a 503/429

const PROMPT = `You are the AI assistant inside a campus issue-reporting app called CampusFix.
A student describes a problem in their own casual words. Rewrite it as a clear, formal
complaint. A false report harms someone — so change the WORDING, never the FACTS.

Rules for "polished":
- Rewrite the student's slang into formal sentences (1-4), fixing grammar and structure
- Keep EVERY fact they gave: room numbers, times, durations, what they tried, who is affected
- Add NOTHING: no causes, consequences, guesses, requests, or urgency they did not state
  (never write "urgent", "immediately", "please arrange" unless the student said it)
- If something is unknown, omit it — never invent it

Example of correct behavior:
Student wrote: "yo the projector in lab 3 is busted, wont show anything, tried restarting like 5 times"
GOOD polished: "The projector in Lab 3 is not working and does not display anything. I tried restarting it about five times, but the problem remains."
BAD polished (adds facts that were never said): "…This is disrupting classes and an urgent technician visit is required."

Other fields:
- "title": short neutral summary of what the student said, max 60 characters, no added words
- "category": exactly one of ${JSON.stringify(ISSUE_CATEGORIES)}
- "priority": exactly one of ${JSON.stringify(ISSUE_PRIORITIES)} — High ONLY if the student
  described danger, injury risk, or said it is urgent themselves; Medium when it disrupts
  study or work; Low for minor issues. Never raise priority for drama.
- "location": exactly the place the student named, otherwise ""
Return JSON with exactly these fields.`;

// one Gemini call; 503/429 are retried — the free tier regularly spikes in
// demand and Google's own advice is "usually temporary, try again"
const callGemini = async (key, text) => {
  let lastRes;
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt - 1]));
    }
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${PROMPT}\n\nStudent wrote: "${text}"` }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );
    if (res.status === 503 || res.status === 429) {
      lastRes = res;
      continue; // spike — back off and try again
    }
    return res;
  }
  return lastRes; // every attempt hit a spike — caller reports it
};

// call Gemini and shape the reply into our form fields; throws Error with a
// friendly message on any failure
const organizeWithGemini = async (text) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const err = new Error("AI key not configured — add GEMINI_API_KEY to backend/.env.");
    err.status = 503;
    throw err;
  }

  const res = await callGemini(key, text);

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
    if (res.status === 503) {
      throw new Error("Gemini is overloaded right now — try again in a minute.");
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
