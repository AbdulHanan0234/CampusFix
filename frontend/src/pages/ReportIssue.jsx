import { useState } from "react";
import { useNavigate } from "react-router-dom";
import rightarrow from "../assets/rightarrow.png";
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

// mock of the real AI endpoint — parses the student's words into structured fields
const organizeWithAI = (text) => ({
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

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const runAI = () => {
    const result = organizeWithAI(aiText);
    setForm((f) => ({
      ...f,
      title: result.title,
      category: result.category,
      priority: result.priority,
      location: result.location,
      desc: result.polished,
    }));
    setAiDone(true);
  };

  const submit = (e) => {
    e.preventDefault();
    // real submit hits the API — for now land on the new issue's detail page
    navigate("/dashboard/my-issues/1042");
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
            <span>Photos (optional)</span>
            <div className="dash-dropzone">
              <b>+</b>
              <span>Click to upload or drag photos here</span>
            </div>
          </div>

          <button className="dash-btn dash-submit" type="submit">
            Submit Report <img src={rightarrow} alt="" />
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
          <button className="dash-btn" type="button" onClick={runAI}>
            Organize with AI
          </button>
          {aiDone ? (
            <div className="dash-airesult">
              <b>✓ Form filled — review and submit</b>
              <small>Category: IT / Hardware · Priority: High · Location: Computer Lab 3</small>
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
