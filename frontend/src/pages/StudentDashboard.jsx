import { Link } from "react-router-dom";
import reportblue from "../assets/reportblue.png";
import clockblue from "../assets/clockblue.png";
import tickblue from "../assets/tickblue.png";
import hubblue from "../assets/hubblue.png";
import rightarrow from "../assets/rightarrow.png";
import ctabanner from "../assets/ctabanner.png";
import reportService from "../assets/reportaproblem-service.png";
import IssueList from "./IssueList";
import { ISSUES, ISSUE_STATS, NOTIFICATIONS } from "../data/mock";

const STAT_ICONS = {
  report: reportblue,
  clock: clockblue,
  tick: tickblue,
  hub: hubblue,
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const NOW = new Date();

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null") || {
    name: "Student",
  };
  const firstName = user.name.split(" ")[0];

  return (
    <div className="dash-twoCol">
      <div className="dash-maincol">
        {/* greeting banner with the campus strip fading in on the right */}
        <section className="dash-hero">
          <div className="dash-herocopy">
            <h1>
              {greeting()}, {firstName} <span>👋</span>
            </h1>
            <p>Here&apos;s what&apos;s happening with your campus today.</p>
          </div>
          <div className="dash-herodate">
            <b>
              {NOW.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </b>
            <small>{NOW.toLocaleDateString("en-GB", { weekday: "long" })}</small>
          </div>
          <img className="dash-heroart" src={ctabanner} alt="" />
        </section>

        {/* the 4 greeting stat cards */}
        <div className="dash-statgrid">
          {ISSUE_STATS.map(({ icon, label, value, delta, up }) => (
            <div className="dash-statcard" key={label}>
              <span className="dash-staticon">
                <img src={STAT_ICONS[icon]} alt="" />
              </span>
              <span className="dash-statmeta">
                <small>{label}</small>
                <b>{value}</b>
                <em className={up ? "up" : "down"}>
                  {up ? "↑" : "↓"} {delta} this week
                </em>
              </span>
            </div>
          ))}
        </div>

        {/* recent issues */}
        <section className="dash-card">
          <div className="dash-cardhead">
            <h2>Recent Issues</h2>
            <Link className="dash-viewall" to="/dashboard/my-issues">
              View All <img src={rightarrow} alt="" />
            </Link>
          </div>
          <IssueList issues={ISSUES.slice(0, 5)} />
        </section>
      </div>

      {/* ---------- right rail ---------- */}
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
          <div className="dash-notiflist">
            {NOTIFICATIONS.map((n) => (
              <Link
                className="dash-notifrow"
                to="/dashboard/notifications"
                key={n.title}
              >
                <span className={`dash-notific t-${n.tone}`}>{n.glyph}</span>
                <span className="dash-notifinfo">
                  <b>{n.title}</b>
                  <small>{n.ago}</small>
                </span>
                {n.unread && <i className="dash-unreaddot" />}
              </Link>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
