import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, uploadImage } from "../Api";
import rightarrow from "../assets/right-arrow.png";
import artificialIntelligence from "../assets/artificial-intelligence.png";

const CATEGORIES = [
  "IT",
  "Maintenance",
  "Cleanliness",
  "Security",
  "Electrical",
  "Other",
];
const PRIORITIES = ["Low", "Medium", "High"];

const EXAMPLE =
  "yo the projector in lab 3 is busted, wont show anything, tried restarting like 5 times";

// offline/demo filler — used when Gemini can't be reached (no key, free quota
// used up, network). AI is an optional helper: submitting never depends on it.
const organizeWithAI = () => ({
  title: "Projector not working in Lab 3",
  category: "IT",
  priority: "High",
  location: "Computer Lab 3",
  polished:
    "The projector in Computer Lab 3 is not displaying any output. Restarting it multiple times did not help — the power light turns on but the screen stays blank. Classes in this lab are being affected and a technician visit is needed.",
});

export default function ReportIssue() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: "",
    priority: "Medium",
    location: "",
    desc: "",
  });
  const [aiText, setAiText] = useState("");
  const [aiDone, setAiDone] = useState(false);
  const [organizing, setOrganizing] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [photos, setPhotos] = useState([]); // { file, url } previews
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // dropzone selection: PNG/JPG/WebP/GIF, max 3 files, 3 MB each — the same
  // caps the server enforces
  const pickPhotos = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-picking the same file
    const ok = [];
    for (const file of picked) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 3 * 1024 * 1024) {
        setError(`${file.name} is larger than 3 MB.`);
        continue;
      }
      ok.push({ file, url: URL.createObjectURL(file) });
    }
    setPhotos((prev) => [...prev, ...ok].slice(0, 3));
  };

  const removePhoto = (index) =>
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });

  // fills only the fields the AI actually produced, so the student's own
  // entries are never wiped by an empty answer
  const applyResult = (r) =>
    setForm((f) => ({
      ...f,
      title: r.title || f.title,
      category: r.category || f.category,
      priority: r.priority || f.priority,
      location: r.location || f.location,
      desc: r.polished || f.desc,
    }));

  const runAI = async () => {
    if (!aiText.trim() || organizing) return;
    setOrganizing(true);
    setAiNote("");
    try {
      // the backend turns the student's words into structured fields via Gemini
      const result = await api("/ai/organize", {
        method: "POST",
        body: { text: aiText },
      });
      applyResult(result);
      setAiNote("");
    } catch (err) {
      // AI is optional — fall back to the demo filler so the flow never blocks
      applyResult(organizeWithAI());
      setAiNote(`AI couldn't help right now (${err.message}) — filled a demo example instead.`);
    } finally {
      setOrganizing(false);
      setAiDone(true);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // photos upload first (one call each), then the issue references their ids
      const photoIds = [];
      for (const p of photos) photoIds.push(await uploadImage(p.file));
      const json = await api("/issues", {
        method: "POST",
        body: { ...form, photos: photoIds },
      });
      navigate(`/dashboard/my-issues/${json.issue._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="dash-twoCol">
      {/* ---------- form ---------- */}
      <form className="dash-maincol" onSubmit={submit}>
        <section className="dash-card">
          <div className="dash-cardhead">
            <h2>Report a New Issue</h2>
          </div>

          <label className="dash-field">
            <span>Title</span>
            <input
              type="text"
              value={form.title}
              onChange={set("title")}
              placeholder="Briefly describe the problem"
              required
            />
          </label>

          <div className="dash-field">
            <span>Category</span>
            <div className="dash-chips">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={form.category === c ? "dash-chip on" : "dash-chip"}
                  onClick={() => setForm({ ...form, category: c })}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="dash-field">
            <span>Priority</span>
            <div className="dash-chips">
              {PRIORITIES.map((p) => (
                <button
                  type="button"
                  key={p}
                  className={
                    form.priority === p
                      ? `dash-chip on prio-${p.toLowerCase()}`
                      : "dash-chip"
                  }
                  onClick={() => setForm({ ...form, priority: p })}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <label className="dash-field">
            <span>Location</span>
            <input
              type="text"
              value={form.location}
              onChange={set("location")}
              placeholder="e.g. Computer Lab 3, Block A"
              required
            />
          </label>

          <label className="dash-field">
            <span>Description</span>
            <textarea
              rows={5}
              value={form.desc}
              onChange={set("desc")}
              placeholder="Describe the issue — what's wrong, where, and since when?"
              required
            />
          </label>

          <div className="dash-field">
            <span>Photos (optional, up to 3)</span>
            <label className="dash-dropzone" title="Choose photos">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                hidden
                onChange={pickPhotos}
              />
              <b>+</b>
              <span>
                {photos.length
                  ? `${photos.length} photo${photos.length === 1 ? "" : "s"} selected — click to add more`
                  : "Click to upload photos (max 3 MB each)"}
              </span>
            </label>
            {photos.length > 0 && (
              <div className="detail-photos">
                {photos.map((p, i) => (
                  <span className="pick" key={p.url}>
                    <img src={p.url} alt="" />
                    <button
                      type="button"
                      aria-label={`Remove photo ${i + 1}`}
                      onClick={() => removePhoto(i)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className="detail-nophotos">{error}</p>}

          <button className="dash-btn dash-submit" type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Report"} <img src={rightarrow} alt="" />
          </button>
        </section>
      </form>

      {/* ---------- AI assistant — rewrites the student's own words ---------- */}
      <aside className="dash-rail">
        <section className="dash-aicard">
          <h3>
            <img src={artificialIntelligence} alt="" /> AI Issue Assistant
          </h3>
          <p>
            Not sure how to explain it? Write it your way — the AI will organize
            it and fill the form for you.
          </p>
          <textarea
            rows={4}
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder="e.g. The projector in lab 3 is not working..."
          />
          <button
            className="dash-btn"
            type="button"
            onClick={runAI}
            disabled={!aiText.trim() || organizing}
          >
            {organizing ? "Organizing…" : "Organize with AI"}
          </button>
          {aiDone ? (
            <div className="dash-airesult">
              <b>✓ Form filled — review and submit</b>
              {form.category && (
                <small>
                  Category: {form.category} · Priority: {form.priority}
                  {form.location ? ` · Location: ${form.location}` : ""}
                </small>
              )}
              {aiNote && <small>{aiNote}</small>}
            </div>
          ) : (
            <button
              className="dash-aitry"
              type="button"
              onClick={() => setAiText(EXAMPLE)}
            >
              💡 Try an example
            </button>
          )}
        </section>
      </aside>
    </div>
  );
}
