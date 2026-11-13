import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import rightarrow from "../assets/right-arrow.png";
import lostfoundservice from "../assets/lostfoundservice.png";
import { api, storedUser } from "../Api";
import AuthImg from "../components/AuthImg";

const KINDS = ["All", "Lost", "Found", "Matched"];
const CATEGORIES = ["Personal", "Academic", "Electronics", "Other"];

// static copy — moved out of the deleted mock data file
const LOST_STEPS = [
  "Post your lost or found item with details and photos (optional).",
  "Chat privately with the other person to verify it's a match.",
  "Once you're sure, share contact details inside the chat.",
  "Arrange a safe handover and mark the item as returned!",
];

export default function LostFound() {
  const [items, setItems] = useState(null); // null = still loading
  // ?kind=lost|found deep link (from the posting form's "View All") prefilters
  const [params] = useSearchParams();
  const [kind, setKind] = useState(
    params.get("kind") === "lost" ? "Lost" : params.get("kind") === "found" ? "Found" : "All"
  );
  const [cat, setCat] = useState("");
  const [query, setQuery] = useState("");
  // admin oversight: browse the library read-only — posting is student-only
  const isAdmin = storedUser()?.role === "admin";

  useEffect(() => {
    let alive = true;
    api("/items")
      .then((j) => alive && setItems(j.items))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  const shown = (items || []).filter(
    (item) =>
      (kind === "All" ||
        (kind === "Matched" ? item.status === "Matched" : item.kind === kind)) &&
      (!cat || item.category === cat) &&
      (item.title + " " + item.desc)
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  // quick stats come straight from the fetched list
  const stats = [
    { value: (items || []).filter((i) => i.kind === "Lost").length, label: "Lost Items", tone: "red" },
    { value: (items || []).filter((i) => i.kind === "Found").length, label: "Found Items", tone: "green" },
    { value: (items || []).filter((i) => i.status === "Matched").length, label: "In Chat", tone: "indigo" },
    { value: (items || []).filter((i) => i.status === "Returned").length, label: "Returned", tone: "blue" },
  ];

  return (
    <div className="dash-twoCol">
      <div className="dash-maincol">
        {/* banner */}
        <section className="lf-banner">
          <span className="lf-ic">
            <span className="dash-searchic big" aria-hidden="true" />
          </span>
          <div className="lf-copy">
            <h1>Lost &amp; Found</h1>
            <p>
              Lost something? Found something? Help your fellow students and
              get items back where they belong.
            </p>
            {!isAdmin && (
              <div className="lf-actions">
                <Link className="dash-cta lost" to="/dashboard/lost-found/new?kind=lost">
                  <i className="lf-dot lost" /> I Lost Something{" "}
                  <img src={rightarrow} alt="" />
                </Link>
                <Link className="dash-cta found" to="/dashboard/lost-found/new?kind=found">
                  <i className="lf-dot found" /> I Found Something{" "}
                  <img src={rightarrow} alt="" />
                </Link>
              </div>
            )}
          </div>
          <img className="lf-art" src={lostfoundservice} alt="" />
        </section>

        {/* search + filters */}
        <section className="dash-card">
          <div className="dash-filterbar">
            <label className="dash-search small grow">
              <span className="dash-searchic" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for items (e.g. wallet, phone, laptop...)"
              />
            </label>
            <div className="dash-chips">
              {KINDS.map((k) => (
                <button
                  type="button"
                  key={k}
                  className={kind === k ? "dash-chip on" : "dash-chip"}
                  onClick={() => setKind(k)}
                >
                  {k}
                </button>
              ))}
            </div>
            <select
              className="dash-select"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
            >
              <option value="">Category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* item grid */}
        <div className="lf-grid">
          {items === null ? (
            <p className="detail-nophotos">Loading…</p>
          ) : (
            <>
              {shown.map((item) => (
                <Link className="dash-card lf-item" to={`/dashboard/lost-found/${item._id}`} key={item._id}>
                  <AuthImg id={item.image} alt={item.title} />
                  <div className="lf-iteminfo">
                    <div className="lf-itemtitle">
                      <h3>{item.title}</h3>
                      <span
                        className={
                          item.kind === "Lost" ? "dash-pill p-high" : "dash-pill p-low"
                        }
                      >
                        {item.kind === "Lost" ? "Lost" : "Found"}
                      </span>
                    </div>
                    <p>{item.desc}</p>
                    <div className="lf-itemmeta">
                      <span>📍 {item.location || "—"}</span>
                      <span>🗓 {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <small className={item.status === "Open" ? "lf-nomatch" : "lf-match"}>
                      {item.status === "Returned"
                        ? "✓ Returned home"
                        : item.status === "Matched"
                          ? "✦ Chat in progress"
                          : "✦ Waiting for contact"}
                    </small>
                  </div>
                  <img className="dash-rowarrow" src={rightarrow} alt="" />
                </Link>
              ))}
              {items.length === 0 && (
                <div className="dash-empty wide">
                  <p>Nothing posted yet.</p>
                  <span>
                    {isAdmin
                      ? "Items will appear here as students post them."
                      : "Be the first — use the buttons above to post an item."}
                  </span>
                </div>
              )}
              {items.length > 0 && shown.length === 0 && (
                <div className="dash-empty wide">
                  <p>No items match.</p>
                  <span>Try another filter or search term.</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ---------- right rail ---------- */}
      <aside className="dash-rail">
        <section className="dash-card">
          <div className="dash-cardhead">
            <h2>Quick Stats</h2>
          </div>
          <div className="lf-stats">
            {stats.map((s) => (
              <div className={`lf-stat t-${s.tone}`} key={s.label}>
                <b>{s.value}</b>
                <small>{s.label}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="dash-card">
          <div className="dash-cardhead">
            <h2>How It Works?</h2>
          </div>
          <ol className="lf-steps">
            {LOST_STEPS.map((step, i) => (
              <li key={i}>
                <span className="lf-stepnum">{i + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="lf-safe">
          <span className="lf-safeic">✓</span>
          <div>
            <b>Keep our campus safe &amp; connected</b>
            <small>Small actions make a big difference!</small>
          </div>
          <span className="lf-heart">♥</span>
        </section>
      </aside>
    </div>
  );
}
