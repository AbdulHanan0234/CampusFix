import { useEffect, useState } from "react";
import { api, ago } from "../Api";

// readable password for hand-written staff credentials
const generatePassword = () => {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
};

const POSITION_IDEAS = [
  "IT Technician",
  "Electrician",
  "Plumber",
  "Maintenance Worker",
  "Cleanliness Staff",
  "Security Officer",
];

// the department decides which issues land on this staff member's desk
const DEPARTMENTS = [
  "IT",
  "Maintenance",
  "Cleanliness",
  "Security",
  "Electrical",
  "Other",
];

// MINIMAL staff-management page — create the finite set of staff accounts
// (with what they work on) and hand them their credentials personally.
export default function Admin() {
  const [staff, setStaff] = useState(null); // null = still loading
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null); // credentials shown once
  const [reset, setReset] = useState(null); // new password shown once
  const [busyId, setBusyId] = useState(null); // row mid-action

  useEffect(() => {
    let alive = true;
    api("/admin/staff")
      .then((j) => alive && setStaff(j.staff))
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, []);

  const createStaff = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    const password = generatePassword();
    try {
      const j = await api("/admin/staff", {
        method: "POST",
        body: { name, email, position, department, password },
      });
      setCreated({ ...j.staff, password });
      setStaff((prev) => [j.staff, ...(prev || [])]);
      setName("");
      setEmail("");
      setPosition("");
      setDepartment("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // the old password can't be shown (bcrypt is one-way) — a reset generates a
  // fresh one and shows it once, exactly like account creation does
  const resetPassword = async (s) => {
    if (
      !window.confirm(
        `Reset ${s.name}'s password? They will need the new one to log in.`,
      )
    )
      return;
    setBusyId(s._id);
    setError("");
    try {
      const j = await api(`/admin/staff/${s._id}/password`, { method: "POST" });
      setReset({ name: s.name, email: s.email, password: j.password });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const removeStaff = async (s) => {
    if (
      !window.confirm(
        `Delete ${s.name}'s account? All their data — chats, notifications, items — is removed permanently. This cannot be undone.`,
      )
    )
      return;
    setBusyId(s._id);
    setError("");
    try {
      await api(`/admin/staff/${s._id}`, { method: "DELETE" });
      setStaff((prev) => prev.filter((x) => x._id !== s._id));
      setReset(null); // credentials for a deleted account mean nothing now
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-pagehead">
        <h1>Staff Management</h1>
        <p>
          Create staff accounts, note what each one works on, and share their
          login credentials.
        </p>
      </div>

      <div className="dash-twoCol">
        <div className="dash-maincol">
          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>New Staff Account</h2>
            </div>
            <form onSubmit={createStaff} id="admin-staff-form">
              <label className="dash-field">
                <span>Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samiullah IT"
                  required
                />
              </label>
              <label className="dash-field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@campusfix.edu"
                  required
                />
              </label>
              <label className="dash-field">
                <span>Position / what they work on</span>
                <input
                  type="text"
                  list="position-ideas"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. IT Technician — what do they fix?"
                  required
                />
                <datalist id="position-ideas">
                  {POSITION_IDEAS.map((p) => (
                    <option value={p} key={p} />
                  ))}
                </datalist>
              </label>
              <label className="dash-field">
                <span>Department (decides which issues they get)</span>
                <select
                  className="dash-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d) => (
                    <option value={d} key={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <small className="detail-nophotos">
                  Issues of this category are routed to them — &quot;Other&quot;
                  catches problems no department matches.
                </small>
              </label>
              <small className="detail-nophotos" style={{ color: "#e11d48" }}>
                A password is generated for you and shown once after creating.
              </small>
              {error && <p className="detail-nophotos">{error}</p>}
              <button className="dash-btn" type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create staff account"}
              </button>
            </form>

            {created && (
              <div className="dash-empty" style={{ marginTop: 14 }}>
                <p>Credentials for {created.name}</p>
                <span>
                  Email: <b>{created.email}</b> · Password:{" "}
                  <b>{created.password}</b>
                  <br />
                  Hand these over personally — they are not shown again.
                </span>
              </div>
            )}
          </section>

          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Staff Accounts</h2>
            </div>
            {staff === null ? (
              <p className="detail-nophotos">Loading…</p>
            ) : staff.length ? (
              <div className="profile-fields">
                {staff.map((s) => (
                  <div className="profile-field" key={s._id || s.id}>
                    <small>{s.email}</small>
                    <b>
                      {s.name}
                      {s.position ? ` — ${s.position}` : ""}
                      {s.department ? ` (${s.department})` : ""}
                      <em className="flat"> · joined {ago(s.createdAt)}</em>
                    </b>
                    <div className="dash-chips" style={{ marginTop: 8 }}>
                      <button
                        className="dash-chip"
                        type="button"
                        disabled={busyId === (s._id || s.id)}
                        onClick={() => resetPassword(s)}
                      >
                        Reset password
                      </button>
                      <button
                        className="dash-chip"
                        type="button"
                        disabled={busyId === (s._id || s.id)}
                        onClick={() => removeStaff(s)}
                        style={{ color: "#c0392b" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty">
                <p>No staff yet.</p>
                <span>Create the first staff account above.</span>
              </div>
            )}

            {reset && (
              <div className="dash-empty" style={{ marginTop: 14 }}>
                <p>New password for {reset.name}</p>
                <span>
                  Email: <b>{reset.email}</b> · Password:{" "}
                  <b>{reset.password}</b>
                  <br />
                  Hand it over personally — it is not shown again.
                </span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
