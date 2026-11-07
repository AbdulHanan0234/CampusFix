import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { api, storedUser } from "../Api";
import logo from "../assets/logo.png";
import bell from "../assets/bell.png";
import bellgrey from "../assets/bellgrey.png";
import lostfoundgrey from "../assets/lostfoundgrey.png";
import lostfoundblue from "../assets/lostfoundblue.png";
import homegrey from "../assets/homegrey.png";
import homeblue from "../assets/homeblue.png";
import moregrey from "../assets/moregrey.png";
import moreblue from "../assets/moreblue.png";
import menugrey from "../assets/menugrey.png";
import menublue from "../assets/menublue.png";
import persongrey from "../assets/persongrey.png";
import personblue from "../assets/personblue.png";
import users from "../assets/users.png";
import "./Dashboard.css";

// sidebar menu — role decides the labels and entries. staff fix problems, so
// they get neither Report Issue nor Lost & Found; the admin keeps Lost & Found
// as oversight. each icon swaps to its blue twin while the tab is active.
const menuFor = (role) => [
  {
    label: "Dashboard",
    to: "",
    end: true,
    icon: homegrey,
    iconActive: homeblue,
  },
  ...(role === "student"
    ? [
        {
          label: "Report Issue",
          to: "/report",
          icon: moregrey,
          iconActive: moreblue,
        },
      ]
    : []),
  {
    label:
      role === "student"
        ? "My Issues"
        : role === "staff"
          ? "My Department"
          : "All Issues",
    to: "/my-issues",
    icon: menugrey,
    iconActive: menublue,
  },
  ...(role !== "staff"
    ? [
        {
          label: "Lost & Found",
          to: "/lost-found",
          icon: lostfoundgrey,
          iconActive: lostfoundblue,
        },
      ]
    : []),
  {
    label: "Notifications",
    to: "/notifications",
    icon: bellgrey,
    iconActive: bell,
  },
  ...(role === "admin"
    ? [{ label: "Staff Management", to: "/admin", icon: users }]
    : []),
  {
    label: "Profile",
    to: "/profile",
    icon: persongrey,
    iconActive: personblue,
  },
];

// neutral placeholder for menu icons still missing — swap in an <img> when added
const DashIc = () => <span className="dash-ic" aria-hidden="true" />;

// pure-CSS magnifier so the search fields don't need an icon asset
const SearchIc = () => <span className="dash-searchic" aria-hidden="true" />;

export default function DashboardLayout() {
  const navigate = useNavigate();
  const user = storedUser() || { name: "Student" };
  const role = user.role || "student";
  const [unread, setUnread] = useState(0);

  // not logged in? the dashboard is pointless — go log in first
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // live unread badge — polled lightly, so new messages/status updates show up
  // in the shell no matter which tab you're on
  useEffect(() => {
    let alive = true;
    const load = () =>
      api("/notifications/unread-count")
        .then((j) => alive && setUnread(j.count))
        .catch(() => {}); // polling errors stay silent
    load();
    const timer = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const logout = () => {
    const token = localStorage.getItem("token");
    // forget the session locally right away…
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    // …and tell the server to expire the token so it can't be reused
    if (token) {
      api("/auth/logout", { method: "POST" }).catch(
        () => {}, // offline? the local logout already happened
      );
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
          <button
            className="dash-bell"
            type="button"
            aria-label="Notifications"
            onClick={() => navigate("/dashboard/notifications")}
          >
            <img src={bell} alt="" />
            {unread > 0 && <span className="dash-bellbadge">{unread}</span>}
          </button>
          <div className="dash-account">
            <span className="dash-avatar">{(user.name || "S").charAt(0)}</span>
            <span className="dash-accountname">
              <b>{user.name}</b>
              <small>{role.charAt(0).toUpperCase() + role.slice(1)}</small>
            </span>
          </div>
        </div>
      </header>

      {/* ---------- sidebar ---------- */}
      <aside className="dash-sidebar">
        <nav className="dash-menu">
          {menuFor(role).map(({ label, to, end, icon, iconActive }) => (
            <NavLink
              key={label}
              to={`/dashboard${to}`}
              end={end}
              className={({ isActive }) =>
                isActive ? "dash-menuitem on" : "dash-menuitem"
              }
            >
              {({ isActive }) => (
                <>
                  {icon ? (
                    <img
                      src={isActive && iconActive ? iconActive : icon}
                      alt=""
                    />
                  ) : (
                    <DashIc />
                  )}
                  {label}
                  {label === "Notifications" && unread > 0 && (
                    <span className="dash-menubadge">{unread}</span>
                  )}
                </>
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
