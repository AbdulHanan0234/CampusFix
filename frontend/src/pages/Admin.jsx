import { useEffect, useState } from "react";
import { api, ago } from "../Api";

// readable password for hand-written staff credentials
const generatePassword = () => {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
};

// common campus staff roles offered as suggestions — admin can type anything
const POSITION_IDEAS = [
  "IT Technician",
  "Electrician",
  "Plumber",
  "Maintenance Worker",
  "Cleanliness Staff",
  "Security Officer",
];

// MINIMAL staff-management page — create the finite set of staff accounts
// (with what they work on) and hand them their credentials personally.
export default function Admin() {
  const [staff, setStaff] = useState(null); // null = still loading
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null); // credentials shown once

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
        body: { name, email, position, password },
      });
      setCreated({ ...j.staff, password });
      setStaff((prev) => [j.staff, ...(prev || [])]);
      setName("");
      setEmail("");
      setPosition("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-pagehead">
        <h1>Staff Management</h1>
        <p>Create staff accounts, note what each one works on, and share their login credentials.</p>
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
                <small className="detail-nophotos">
                  Shown in the staff list so everyone&apos;s job is known at a glance.
                </small>
              </label>
              <small className="detail-nophotos">
                A password is generated for you — shown once after creating.
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
                  Email: <b>{created.email}</b> · Password: <b>{created.password}</b>
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
                      <em className="flat"> · joined {ago(s.createdAt)}</em>
                    </b>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty">
                <p>No staff yet.</p>
                <span>Create the first staff account above.</span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
