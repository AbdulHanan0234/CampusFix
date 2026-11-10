import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import reportblue from "../assets/reportblue.png";
import clockblue from "../assets/clockblue.png";
import tickblue from "../assets/tickblue.png";
import hubblue from "../assets/hubblue.png";
import rightarrow from "../assets/right-arrow.png";
import ctabanner from "../assets/ctabanner.png";
import reportService from "../assets/reportaproblem-service.png";
import { api, ago, storedUser, notifsChanged, displayName } from "../Api";
import { computeIssueStats } from "../lib/IssueStats";
import IssueList from "./IssueList";

const STAT_ICONS = {
  report: reportblue,
  clock: clockblue,
  tick: tickblue,
  hub: hubblue,
};

// the 4 greeting cards — values computed live from the student's own issues
const CARDS = (s) => [
  { icon: "report", label: "Total Issues", value: s.total, caption: `${s.open} still open` },
  { icon: "clock", label: "Pending", value: s.pending, caption: "awaiting first action" },
  {
    icon: "tick",
    label: "Resolved",
    value: s.resolved,
    caption: `${s.total ? Math.round((s.resolved / s.total) * 100) : 0}% of all reports`,
  },
  { icon: "hub", label: "In Progress", value: s.inProgress, caption: "being worked on" },
];

export default function StudentDashboard() {
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
  const name = displayName(user?.name, "Student");

  const stats = computeIssueStats(issues || []);

  return (
    <div className="dash-twoCol">
      <div className="dash-maincol">
        <section className="dash-hero">
          <div className="dash-herocopy">
            <h1>
              {greeting()}, {name}
            </h1>
            <p>Here&apos;s what&apos;s happening with your campus today.</p>
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

        <section className="dash-card">
          <div className="dash-cardhead">
            <h2>Recent Issues</h2>
            <Link className="dash-viewall" to="/dashboard/my-issues">
              View All <img src={rightarrow} alt="" />
            </Link>
          </div>
          {issues === null ? (
            <p className="detail-nophotos">Loading…</p>
          ) : issues.length ? (
            <IssueList issues={issues.slice(0, 5)} />
          ) : (
            <div className="dash-empty">
              <p>No issues yet.</p>
              <span>Report your first campus problem to see it here.</span>
            </div>
          )}
        </section>
      </div>

      <aside className="dash-rail">
        <section className="dash-promo">
          <h3>Report an Issue</h3>
          <p>Found a problem? Let us know and help make your campus better.</p>
          <Link className="dash-btn" to="/dashboard/report">
            Report Issue <img src={rightarrow} alt="" />
          </Link>
          <img className="dash-promoart" src={reportService} alt="" />
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
              <span>Updates about your issues will appear here.</span>
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
