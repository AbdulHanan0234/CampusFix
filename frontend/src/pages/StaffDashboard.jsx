import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import reportblue from "../assets/reportblue.png";
import clockblue from "../assets/clockblue.png";
import tickblue from "../assets/tickblue.png";
import hubblue from "../assets/hubblue.png";
import rightarrow from "../assets/right-arrow.png";
import ctabanner from "../assets/ctabanner.png";
import { api, ago, storedUser } from "../api";
import { computeIssueStats } from "../lib/IssueStats";
import IssueList from "./IssueList";

const STAT_ICONS = {
  report: reportblue,
  clock: clockblue,
  tick: tickblue,
  hub: hubblue,
};

// the work overview for staff/admin — everything reported on campus at a
// glance: issue stats, the latest issues and the lost & found desk
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
  const [items, setItems] = useState(null);
  const [notifs, setNotifs] = useState(null);

  useEffect(() => {
    let alive = true;
    api("/issues")
      .then((j) => alive && setIssues(j.issues))
      .catch(() => alive && setIssues([]));
    api("/items")
      .then((j) => alive && setItems(j.items))
      .catch(() => alive && setItems([]));
    api("/notifications")
      .then((j) => alive && setNotifs(j.notifications))
      .catch(() => alive && setNotifs([]));
    return () => {
      alive = false;
    };
  }, []);

  const user = storedUser();
  const firstName = (user?.name || "Staff").split(" ")[0];
  const stats = computeIssueStats(issues || []);
  const lfStats = [
    { value: (items || []).filter((i) => i.kind === "Lost").length, label: "Lost", tone: "red" },
    { value: (items || []).filter((i) => i.kind === "Found").length, label: "Found", tone: "green" },
    { value: (items || []).filter((i) => i.status === "Matched").length, label: "In Chat", tone: "indigo" },
    { value: (items || []).filter((i) => i.status === "Returned").length, label: "Returned", tone: "blue" },
  ];

  return (
    <div className="dash-twoCol">
      <div className="dash-maincol">
        <section className="dash-hero">
          <div className="dash-herocopy">
            <h1>
              {greeting()}, {firstName} <span>🛠</span>
            </h1>
            <p>Here&apos;s what needs attention on campus today.</p>
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

        {/* latest reports — the work queue */}
        <section className="dash-card">
          <div className="dash-cardhead">
            <h2>Latest Issues</h2>
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
              <p>No issues reported yet.</p>
              <span>Student reports will appear here as they come in.</span>
            </div>
          )}
        </section>
      </div>

      <aside className="dash-rail">
        {/* lost & found desk summary */}
        <section className="dash-card">
          <div className="dash-cardhead">
            <h2>Lost &amp; Found</h2>
            <Link className="dash-viewall" to="/dashboard/lost-found">
              View All <img src={rightarrow} alt="" />
            </Link>
          </div>
          <div className="lf-stats">
            {lfStats.map((s) => (
              <div className={`lf-stat t-${s.tone}`} key={s.label}>
                <b>{s.value}</b>
                <small>{s.label}</small>
              </div>
            ))}
          </div>
          {items !== null && items.slice(0, 3).map((item) => (
            <Link className="dash-issuerow" to={`/dashboard/lost-found/${item._id}`} key={item._id}>
              <span className="dash-thumb t-blue">{item.title?.charAt(0)}</span>
              <span className="dash-issueinfo">
                <b>{item.title}</b>
                <small>
                  {item.kind} <i>•</i> {item.location || "—"}
                </small>
              </span>
              <span className={`dash-status s-${item.status?.toLowerCase()}`}>
                {item.status}
              </span>
              <img className="dash-rowarrow" src={rightarrow} alt="" />
            </Link>
          ))}
          {items !== null && !items.length && (
            <p className="detail-nophotos">No items posted yet.</p>
          )}
        </section>

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
                <Link className="dash-notifrow" to={n.link || "/dashboard/notifications"} key={n._id}>
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
