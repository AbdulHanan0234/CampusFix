import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./dashboard.css";

const API_URL = "http://localhost:5000/api/auth";

// sidebar items — pages for these don't exist yet, so they don't navigate anywhere
const MENU = [
  "Dashboard",
  "Report Issue",
  "My Issues",
  "Notifications",
  "Profile",
];

const STATS = [
  ["0", "Total Issues"],
  ["0", "Pending"],
  ["0", "Resolved"],
];

// neutral placeholder for the missing menu icons — swap in an <img> when you add them
const DashIc = () => <span className="dash-ic" aria-hidden="true" />;

export default function Dashboard() {
  const navigate = useNavigate();

  // not logged in? the dashboard is pointless — go log in first
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    const token = localStorage.getItem("token");
    // forget the session locally right away…
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    // …and tell the server to expire the token so it can't be reused
    if (token) {
      fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {}); // offline? the local logout already happened
    }
  };

  // redirecting to /login — render nothing meanwhile
  if (!user) return null;

  return (
    <div className="dash-shell">
      {/* ---------- sidebar ---------- */}
      <aside className="dash-sidebar">
        <Link className="dash-brandrow" to="/">
          <img src={logo} alt="CampusFix" />
        </Link>

        <nav className="dash-menu">
          {MENU.map((item, i) => (
            <span
              key={item}
              className={i === 0 ? "dash-menuitem on" : "dash-menuitem"}
            >
              <DashIc />
              {item}
            </span>
          ))}
        </nav>

        <button className="dash-logout" type="button" onClick={logout}>
          Logout
        </button>
      </aside>

      {/* ---------- main ---------- */}
      <main className="dash-content">
        <h1 className="dash-welcome">
          Welcome back, <span>{user.name}</span> 👋
        </h1>
        <p className="dash-sub">Here&apos;s what&apos;s happening on your campus.</p>

        <div className="dash-statgrid">
          {STATS.map(([value, label]) => (
            <div className="dash-statcard" key={label}>
              <b>{value}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <h2 className="dash-sectiontitle">Recent Issues</h2>
        <div className="dash-empty">
          <p>No issues reported yet.</p>
          <span>Issues you report will appear here with their live status.</span>
        </div>
      </main>
    </div>
  );
}
