import { useState } from "react";
import IssueList from "./IssueList";
import { ISSUES } from "../data/mock";

const FILTERS = ["All", "Open", "In Progress", "Assigned", "Resolved"];

export default function MyIssues() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const shown = ISSUES.filter(
    (i) =>
      (filter === "All" || i.status === filter) &&
      i.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="dash-page">
      <div className="dash-pagehead">
        <h1>My Issues</h1>
        <p>Track every issue you&apos;ve reported, from report to resolution.</p>
      </div>

      <section className="dash-card">
        <div className="dash-filterbar">
          <div className="dash-chips">
            {FILTERS.map((f) => (
              <button
                type="button"
                key={f}
                className={filter === f ? "dash-chip on" : "dash-chip"}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="dash-search small">
            <span className="dash-searchic" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search my issues..."
            />
          </label>
        </div>

        {shown.length ? (
          <IssueList issues={shown} />
        ) : (
          <div className="dash-empty">
            <p>No issues match.</p>
            <span>Try a different filter or search term.</span>
          </div>
        )}
      </section>
    </div>
  );
}
