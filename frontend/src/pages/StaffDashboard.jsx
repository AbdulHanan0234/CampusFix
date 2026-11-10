import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import reportblue from "../assets/reportblue.png";
import clockblue from "../assets/clockblue.png";
import tickblue from "../assets/tickblue.png";
import hubblue from "../assets/hubblue.png";
import rightarrow from "../assets/right-arrow.png";
import ctabanner from "../assets/ctabanner.png";
import { api, ago, storedUser, notifsChanged, displayName } from "../Api";
import { computeIssueStats } from "../lib/IssueStats";
import IssueList from "./IssueList";

const STAT_ICONS = {
  report: reportblue,
  clock: clockblue,
  tick: tickblue,
  hub: hubblue,
};

// the work overview for staff/admin. staff see their department's queue (the
// server routes issues by category); admin sees the whole campus. no Lost &
// Found here — admin reaches it from the menu when oversight is needed.
const CARDS = (s) => [
  { icon: "report", label: "Total Issues", value: s.total, caption: `${s.open} still open` },
  { icon: "clock", label: "Pending", value: s.pending, caption: "awaiting first action" },
  {
    icon: "hub",
    label: "In Progress",
    value: s.inProgress,
    caption: "being worked on",
  },
  {
    icon: "tick",
    label: "Resolved",
    value: s.resolved,
    caption: `${s.total ? Math.round((s.resolved / s.total) * 100) : 0}% of all reports`,
  },
];

export default function StaffDashboard() {
  const [issues, setIssues] = useState(null); // null = still loading
  const [notifs, setNotifs] = useState(null);

  useEffect(() => {
    let alive = true;
    api("/issues")
      .then((j) => alive && setIssues(j.issues))
      .catch(() => alive && setIssues([]));
    api("/notifications")
      .then((j) => alive && setNotifs(j.notifications))
      .catch(() => alive && setNotifs([]));
    return () => {
      alive = false;
    };
  }, []);

  const user = storedUser();
  const name = displayName(user?.name, "Staff");
  const isStaff = user?.role === "staff";
  const stats = computeIssueStats(issues || []);

  return (
    <div className="dash-twoCol">
      <div className="dash-maincol">
        <section className="dash-hero">
          <div className="dash-herocopy">
            <h1>
              {greeting()}, {name}
            </h1>
            <p>
              {isStaff && user?.department
                ? `${user.department} desk — here's what needs your department today.`
                : "Here's what needs attention on campus today."}
            </p>
          </div>
          <div className="dash-herodate">
            <b>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</b>
            <small>{new Date().toLocaleDateString("en-GB", { weekday: "long" })}</small>
          </div>
          <img className="dash-heroart" src={ctabanner} alt="" />
        </section>

        <div className="dash-statgrid">
          {CARDS(stats).map(({ icon, label, value, caption }) => (
            <div className="dash-statcard" key={label}>
              <span className="dash-staticon">
                <img src={STAT_ICONS[icon]} alt="" />
              </span>
              <span className="dash-statmeta">
                <small>{label}</small>
                <b>{value}</b>
                <em className="flat">{caption}</em>
              </span>
            </div>
          ))}
        </div>

        {/* the work queue — staff: their department, admin: everything */}
        <section className="dash-card">
          <div className="dash-cardhead">
            <h2>{isStaff ? "Department Issues" : "Latest Issues"}</h2>
            <Link className="dash-viewall" to="/dashboard/my-issues">
              View All <img src={rightarrow} alt="" />
            </Link>
          </div>
          {issues === null ? (
            <p className="detail-nophotos">Loading…</p>
          ) : issues.length ? (
            <IssueList issues={issues.slice(0, 6)} />
          ) : (
            <div className="dash-empty">
              <p>{isStaff ? "No issues in your department." : "No issues reported yet."}</p>
              <span>
                {isStaff
                  ? "Issues matching your department will appear here as students report them."
                  : "Student reports will appear here as they come in."}
              </span>
            </div>
          )}
        </section>
      </div>

      <aside className="dash-rail">
        <section className="dash-card">
          <div className="dash-cardhead">
            <h2>Recent Notifications</h2>
            <Link className="dash-viewall" to="/dashboard/notifications">
              View All <img src={rightarrow} alt="" />
            </Link>
          </div>
          {notifs === null ? (
            <p className="detail-nophotos">Loading…</p>
          ) : notifs.length ? (
            <div className="dash-notiflist">
              {notifs.slice(0, 4).map((n) => (
                <Link
                  className="dash-notifrow"
                  to={n.link || "/dashboard/notifications"}
                  key={n._id}
                  onClick={() => {
                    // opening from the rail counts as reading it — keep the
                    // page list, bell and sidebar badges in sync
                    if (!n.read) {
                      api(`/notifications/${n._id}/read`, { method: "POST" }).catch(() => {});
                      notifsChanged();
                    }
                  }}
                >
                  <span className={`dash-notific t-${n.tone}`}>{n.glyph}</span>
                  <span className="dash-notifinfo">
                    <b>{n.title}</b>
                    <small>{ago(n.createdAt)}</small>
                  </span>
                  {!n.read && <i className="dash-unreaddot" />}
                </Link>
              ))}
            </div>
          ) : (
            <div className="dash-empty">
              <p>You&apos;re all caught up.</p>
              <span>New reports and messages will show up here.</span>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}

// morning / afternoon / evening by the hour
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
