import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import bell from "../assets/bell.png";
import { NOTIFICATIONS } from "../data/mock";
import "./dashboard.css";

const API_URL = "http://localhost:5000/api/auth";

// sidebar menu — every tab renders from its own jsx file via the nested route.
// icons: drop the named PNG into src/assets and pass it here (bell already wired)
const MENU = [
  { label: "Dashboard", to: "", end: true, icon: null }, // home.png
  { label: "Report Issue", to: "/report", icon: null }, // reportissue.png
  { label: "My Issues", to: "/my-issues", icon: null }, // myissues.png
  { label: "Lost & Found", to: "/lost-found", icon: null }, // lostfound.png
  { label: "Notifications", to: "/notifications", icon: bell },
  { label: "Profile", to: "/profile", icon: null }, // profile.png
];

// neutral placeholder for menu icons still missing — swap in an <img> when added
const DashIc = () => <span className="dash-ic" aria-hidden="true" />;

// pure-CSS magnifier so the search fields don't need an icon asset
const SearchIc = () => <span className="dash-searchic" aria-hidden="true" />;

export default function DashboardLayout() {
  const navigate = useNavigate();

  // not logged in? the dashboard is pointless — go log in first
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem("user") || "null") || {
    name: "Student",
  };
  const initial = user.name.charAt(0).toUpperCase();
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;

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

  return (
    <div className="dash-shell">
      {/* ---------- topbar ---------- */}
      <header className="dash-topbar">
        <Link className="dash-topbrand" to="/">
          <img src={logo} alt="CampusFix" />
        </Link>

        <label className="dash-search">
          <SearchIc />
          <input type="text" placeholder="Search issues, locations..." />
        </label>

        <div className="dash-topactions">
          <button className="dash-bell" type="button" aria-label="Notifications">
            <img src={bell} alt="" />
            {unread > 0 && <span className="dash-bellbadge">{unread}</span>}
          </button>
          <div className="dash-account">
            <span className="dash-avatar">{initial}</span>
            <span className="dash-accountname">
              <b>{user.name}</b>
              <small>Student</small>
            </span>
          </div>
        </div>
      </header>

      {/* ---------- sidebar ---------- */}
      <aside className="dash-sidebar">
        <nav className="dash-menu">
          {MENU.map(({ label, to, end, icon }) => (
            <NavLink
              key={label}
              to={`/dashboard${to}`}
              end={end}
              className={({ isActive }) =>
                isActive ? "dash-menuitem on" : "dash-menuitem"
              }
            >
              {icon ? <img src={icon} alt="" /> : <DashIc />}
              {label}
              {label === "Notifications" && unread > 0 && (
                <span className="dash-menubadge">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <button className="dash-logout" type="button" onClick={logout}>
          Logout
        </button>
      </aside>

      {/* ---------- active tab ---------- */}
      <main className="dash-content">
        <Outlet />
      </main>
    </div>
  );
}
