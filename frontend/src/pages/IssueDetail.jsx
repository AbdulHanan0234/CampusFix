import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import rightarrow from "../assets/rightarrow.png";
import { COMMENTS as SEED, ISSUES, TIMELINE } from "../data/mock";

export default function IssueDetail() {
  const { id } = useParams();
  const issue = ISSUES.find((i) => i.id === id);

  const [comments, setComments] = useState(SEED);
  const [draft, setDraft] = useState("");

  // unknown id (or stale bookmark) — offer the way back
  if (!issue) {
    return (
      <div className="dash-page">
        <div className="dash-empty">
          <p>Issue not found.</p>
          <span>
            <Link to="/dashboard/my-issues">Back to My Issues</Link>
          </span>
        </div>
      </div>
    );
  }

  const addComment = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setComments([
      ...comments,
      { by: "You", text: draft.trim(), ago: "just now", tone: "indigo" },
    ]);
    setDraft("");
  };

  return (
    <div className="dash-page">
      {/* breadcrumb */}
      <div className="dash-crumbs">
        <Link to="/dashboard/my-issues">← My Issues</Link>
        <i>›</i>
        <span>Issue Details</span>
      </div>

      <div className="dash-twoCol detail">
        <div className="dash-maincol">
          {/* header card */}
          <section className="dash-card detail-head">
            <span className={`dash-thumb big t-${issue.thumbTone}`}>
              {issue.category.charAt(0)}
            </span>
            <div className="detail-headinfo">
              <h1>{issue.title}</h1>
              <div className="detail-badges">
                <span className={`dash-pill p-${issue.priority.toLowerCase()}`}>
                  {issue.priority} Priority
                </span>
                <span
                  className={`dash-status s-${issue.status
                    .toLowerCase()
                    .replace(" ", "")}`}
                >
                  {issue.status}
                </span>
                <span className="dash-idtag">#{issue.id}</span>
              </div>
              <div className="detail-meta">
                <span>🏛 {issue.dept}</span>
                <span>📍 {issue.location}</span>
                <span>🗓 Reported {issue.ago}</span>
              </div>
            </div>
          </section>

          {/* info tiles */}
          <div className="detail-tiles">
            <div className="detail-tile">
              <small>Department</small>
              <b>{issue.dept}</b>
            </div>
            <div className="detail-tile">
              <small>Location</small>
              <b>{issue.location}</b>
            </div>
            <div className="detail-tile">
              <small>Priority</small>
              <b className={`prio-text-${issue.priority.toLowerCase()}`}>
                {issue.priority}
              </b>
            </div>
            <div className="detail-tile">
              <small>Status</small>
              <b className="prio-text-brand">{issue.status}</b>
            </div>
          </div>

          {/* description */}
          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Description</h2>
              <button className="dash-ghostbtn" type="button">
                ✎ Edit
              </button>
            </div>
            <p className="detail-desc">{issue.desc}</p>
          </section>

          {/* timeline */}
          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Timeline</h2>
            </div>
            <ul className="dash-timeline">
              {TIMELINE.map((step) => (
                <li key={step.title} className={step.state}>
                  <span className="tl-dot">
                    {step.state === "done" ? "✓" : ""}
                  </span>
                  <span className="tl-info">
                    <b>{step.title}</b>
                    <small>{step.text}</small>
                  </span>
                  <span className="tl-ago">{step.ago}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ---------- right rail ---------- */}
        <aside className="dash-rail">
          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Photos ({issue.photos})</h2>
              <span className="dash-viewall">
                View All <img src={rightarrow} alt="" />
              </span>
            </div>
            <div className="detail-photos">
              {Array.from({ length: issue.photos }).map((_, i) => (
                <span className="dash-photo" key={i} aria-hidden="true" />
              ))}
              {issue.photos === 0 && (
                <small className="detail-nophotos">No photos attached.</small>
              )}
            </div>
          </section>

          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Comments</h2>
            </div>
            <div className="dash-commentlist">
              {comments.map((c, i) => (
                <div className="dash-comment" key={i}>
                  <span className={`dash-avatar small t-${c.tone}`}>
                    {c.by.charAt(0)}
                  </span>
                  <div className="dash-commentbody">
                    <b>{c.by}</b>
                    <p>{c.text}</p>
                    <small>{c.ago}</small>
                  </div>
                </div>
              ))}
            </div>
            <form className="dash-commentform" onSubmit={addComment}>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a comment..."
              />
              <button className="dash-btn small" type="submit">
                Send
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
