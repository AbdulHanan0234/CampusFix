import { useEffect, useState } from "react";
import { api, storedUser } from "../Api";
import { computeIssueStats } from "../lib/IssueStats";

// editable profile fields (email/role are identity — the server refuses those)
const EDITABLE = [
  { key: "name", label: "Full Name" },
  { key: "studentId", label: "Student ID" },
  { key: "dept", label: "Department" },
  { key: "phone", label: "Phone" },
];

const PREFS = [
  { key: "inApp", label: "In-app alerts", desc: "Messages, status changes and replies" },
  { key: "email", label: "Email notifications", desc: "Stored for now — no mailer yet" },
  { key: "weekly", label: "Weekly summary", desc: "Stored for now — no digest job yet" },
];

export default function Profile() {
  const [user, setUser] = useState(null); // null = still loading
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api("/auth/me")
      .then((j) => alive && setUser(j.user))
      .catch(() => alive && setUser(storedUser()));
    api("/issues")
      .then((j) => alive && setStats(computeIssueStats(j.issues)))
      .catch(() => alive && setStats({ total: 0, resolved: 0, pending: 0 }));
    return () => {
      alive = false;
    };
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = Object.fromEntries(new FormData(e.currentTarget));
      const j = await api("/auth/profile", { method: "PATCH", body });
      setUser(j.user);
      localStorage.setItem("user", JSON.stringify(j.user)); // shell shows name/role
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePref = (key) => {
    const next = { ...user.prefs, [key]: !user.prefs?.[key] };
    setUser({ ...user, prefs: next }); // optimistic
    api("/auth/profile", { method: "PATCH", body: { prefs: next } }).catch(
      () => setUser(user) // revert on failure
    );
  };

  if (!user) {
    return (
      <div className="dash-page">
        <p className="detail-nophotos">Loading…</p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-pagehead">
        <h1>Profile</h1>
        <p>Manage your account and how you get notified.</p>
      </div>

      <div className="dash-twoCol">
        <div className="dash-maincol">
          <section className="dash-card profile-head">
            <span className="dash-avatar xl">{(user.name || "?").charAt(0)}</span>
            <div>
              <h2>{user.name}</h2>
              <small>
                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Student"}
                {user.dept ? ` · ${user.dept}` : ""}
              </small>
            </div>
            <button
              className="dash-ghostbtn"
              type="button"
              onClick={() => setEditing(!editing)}
            >
              {editing ? "✕ Cancel" : "✎ Edit"}
            </button>
          </section>

          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Account Details</h2>
            </div>
            {editing ? (
              <form className="profile-fields" onSubmit={save}>
                {EDITABLE.map(({ key, label }) => (
                  <label className="dash-field" key={key}>
                    <span>{label}</span>
                    <input type="text" name={key} defaultValue={user[key] || ""} />
                  </label>
                ))}
                <label className="dash-field">
                  <span>Email (cannot be changed)</span>
                  <input type="email" value={user.email} disabled />
                </label>
                {error && <p className="detail-nophotos">{error}</p>}
                <button className="dash-btn" type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </form>
            ) : (
              <div className="profile-fields">
                {[...EDITABLE, { key: "email", label: "Email" }].map(({ key, label }) => (
                  <div className="profile-field" key={key}>
                    <small>{label}</small>
                    <b>{user[key] || "—"}</b>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="dash-rail">
          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Your Activity</h2>
            </div>
            <div className="profile-activity">
              <div>
                <b>{stats ? stats.total : "—"}</b>
                <small>Reported</small>
              </div>
              <div>
                <b>{stats ? stats.resolved : "—"}</b>
                <small>Resolved</small>
              </div>
              <div>
                <b>{stats ? stats.pending : "—"}</b>
                <small>Pending</small>
              </div>
            </div>
          </section>

          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Notification Preferences</h2>
            </div>
            <div className="profile-prefs">
              {PREFS.map((p) => {
                const on = !!user.prefs?.[p.key];
                return (
                  <button
                    type="button"
                    className="profile-pref"
                    key={p.key}
                    onClick={() => togglePref(p.key)}
                  >
                    <span className="dash-notifinfo">
                      <b>{p.label}</b>
                      <small>{p.desc}</small>
                    </span>
                    <i className={on ? "dash-toggle on" : "dash-toggle"} />
                  </button>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
