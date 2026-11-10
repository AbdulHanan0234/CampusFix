import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ago, storedUser, notifsChanged } from "../Api";
import AuthImg from "../components/AuthImg";
import Chat from "./Chat";

const STATUSES = ["Open", "Assigned", "In Progress", "Resolved"];

export default function IssueDetail() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null); // null = loading, false = not found
  const [savingStatus, setSavingStatus] = useState(false);
  const me = storedUser();
  const role = me?.role || "student";
  // only the department the issue was routed to (or admin) may progress it
  const canModerate =
    role === "admin" ||
    (role === "staff" &&
      (issue?.routedTo || []).some((rid) => String(rid) === String(me?.id)));

  useEffect(() => {
    let alive = true;
    api(`/issues/${id}`)
      .then((j) => alive && setIssue(j.issue))
      .catch(() => alive && setIssue(false));
    return () => {
      alive = false;
    };
  }, [id]);

  // viewing the issue clears every notification about it — status changes,
  // chat replies, all of them (they deep-link here). Notifications arriving
  // after this moment stay unread until the issue is opened again.
  useEffect(() => {
    api(`/notifications/read-issue/${id}`, { method: "POST" })
      .then(() => notifsChanged())
      .catch(() => {});
  }, [id]);

  // staff/admin move the issue through its lifecycle from this page
  const changeStatus = async (status) => {
    setSavingStatus(true);
    try {
      const j = await api(`/issues/${id}/status`, { method: "PATCH", body: { status } });
      setIssue(j.issue);
    } catch {
      // keep the old status on failure
    } finally {
      setSavingStatus(false);
    }
  };

  // unknown id (or stale bookmark) — offer the way back
  if (issue === false) {
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
  if (!issue) {
    return (
      <div className="dash-page">
        <p className="detail-nophotos">Loading…</p>
      </div>
    );
  }

  const timeline = (issue.statusHistory || []).map((step, i, arr) => ({
    state: i === arr.length - 1 ? "current" : "done",
    title: step.status,
    text:
      i === 0
        ? "Issue was reported and categorized."
        : "Management updated the status.",
    ago: ago(step.at),
  }));

  return (
    <div className="dash-page">
      <div className="dash-crumbs">
        <Link to="/dashboard/my-issues">← My Issues</Link>
        <i>›</i>
        <span>Issue Details</span>
      </div>

      <div className="dash-twoCol detail">
        <div className="dash-maincol">
          <section className="dash-card detail-head">
            <span className="dash-thumb big t-indigo">{issue.category?.charAt(0)}</span>
            <div className="detail-headinfo">
              <h1>{issue.title}</h1>
              <div className="detail-badges">
                <span className={`dash-pill p-${issue.priority?.toLowerCase()}`}>
                  {issue.priority} Priority
                </span>
                <span
                  className={`dash-status s-${issue.status?.toLowerCase().replace(" ", "")}`}
                >
                  {issue.status}
                </span>
                <span className="dash-idtag">
                  #{issue._id?.slice(-6).toUpperCase()}
                </span>
              </div>
              <div className="detail-meta">
                <span>🏛 {issue.category}</span>
                <span>📍 {issue.location}</span>
                <span>🗓 Reported {ago(issue.createdAt)}</span>
              </div>
              {canModerate && (
                <label className="detail-statuspick">
                  <small>Status</small>
                  <select
                    className="dash-select"
                    value={issue.status}
                    disabled={savingStatus}
                    onChange={(e) => changeStatus(e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </section>

          <div className="detail-tiles">
            <div className="detail-tile">
              <small>Category</small>
              <b>{issue.category}</b>
            </div>
            <div className="detail-tile">
              <small>Location</small>
              <b>{issue.location}</b>
            </div>
            <div className="detail-tile">
              <small>Priority</small>
              <b className={`prio-text-${issue.priority?.toLowerCase()}`}>
                {issue.priority}
              </b>
            </div>
            <div className="detail-tile">
              <small>Status</small>
              <b className="prio-text-brand">{issue.status}</b>
            </div>
          </div>

          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Description</h2>
            </div>
            <p className="detail-desc">{issue.desc}</p>
          </section>

          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Timeline</h2>
            </div>
            <ul className="dash-timeline">
              {timeline.map((step) => (
                <li key={step.title + step.ago} className={step.state}>
                  <span className="tl-dot">{step.state === "done" ? "✓" : ""}</span>
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

        <aside className="dash-rail">
          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Photos ({issue.photos?.length || 0})</h2>
            </div>
            <div className="detail-photos">
              {(issue.photos || []).map((pid) => (
                <AuthImg key={pid} id={pid} />
              ))}
              {!issue.photos?.length && (
                <small className="detail-nophotos">No photos attached.</small>
              )}
            </div>
          </section>

          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Messages</h2>
              <span className="dash-viewall">Private chat</span>
            </div>
            <Chat refType="issue" refId={id} />
          </section>
        </aside>
      </div>
    </div>
  );
}
