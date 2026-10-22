import { useState } from "react";
import rightarrow from "../assets/rightarrow.png";
import lostfoundservice from "../assets/lostfoundservice.png";
import { LOST_ITEMS, LOST_STATS, LOST_STEPS } from "../data/mock";

const KINDS = ["All", "Lost", "Found", "Matched"];
const CATEGORIES = ["Personal", "Academic", "Electronics"];

export default function LostFound() {
  const [kind, setKind] = useState("All");
  const [cat, setCat] = useState("");
  const [query, setQuery] = useState("");

  const shown = LOST_ITEMS.filter(
    (item) =>
      (kind === "All" ||
        (kind === "Matched" ? item.match : item.kind === kind)) &&
      (!cat || item.cat === cat) &&
      (item.title + " " + item.desc)
        .toLowerCase()
        .includes(query.toLowerCase())
  );

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
            <div className="lf-actions">
              <button className="dash-cta lost" type="button">
                🔴 I Lost Something <img src={rightarrow} alt="" />
              </button>
              <button className="dash-cta found" type="button">
                🟢 I Found Something <img src={rightarrow} alt="" />
              </button>
            </div>
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
          {shown.map((item) => (
            <article className="dash-card lf-item" key={item.title}>
              <span className="dash-photo" aria-hidden="true" />
              <div className="lf-iteminfo">
                <div className="lf-itemtitle">
                  <h3>{item.title}</h3>
                  <span
                    className={item.kind === "Lost" ? "dash-pill p-high" : "dash-pill p-low"}
                  >
                    {item.kind === "Lost" ? "+ Lost" : "✓ Found"}
                  </span>
                </div>
                <p>{item.desc}</p>
                <div className="lf-itemmeta">
                  <span>📍 {item.location}</span>
                  <span>🗓 {item.date}</span>
                </div>
                {item.match ? (
                  <small className="lf-match">
                    ✦ {/^(High|Medium|Low)$/.test(item.match)
                      ? `Match confidence: ${item.match}`
                      : item.match}
                  </small>
                ) : (
                  <small className="lf-nomatch">✦ No matches yet</small>
                )}
              </div>
              <img className="dash-rowarrow" src={rightarrow} alt="" />
            </article>
          ))}
          {!shown.length && (
            <div className="dash-empty wide">
              <p>No items found.</p>
              <span>Try another filter or search term.</span>
            </div>
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
            {LOST_STATS.map((s) => (
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
