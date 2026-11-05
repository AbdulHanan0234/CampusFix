import { useEffect, useState } from "react";
import { api, storedUser } from "../Api";
import IssueList from "./IssueList";

const FILTERS = ["All", "Open", "In Progress", "Assigned", "Resolved"];

export default function MyIssues() {
  const [issues, setIssues] = useState(null); // null = still loading
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const role = storedUser()?.role || "student";
  const staffView = role !== "student";

  useEffect(() => {
    let alive = true;
    api("/issues")
      .then((j) => alive && setIssues(j.issues))
      .catch(() => alive && setIssues([]));
    return () => {
      alive = false;
    };
  }, []);

  const shown = (issues || []).filter(
    (i) =>
      (filter === "All" || i.status === filter) &&
      (i.title + " " + i.location).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="dash-page">
      <div className="dash-pagehead">
        <h1>{staffView ? "All Issues" : "My Issues"}</h1>
        <p>
          {staffView
            ? "Everything students have reported, newest first."
            : "Track every issue you've reported, from report to resolution."}
        </p>
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
              placeholder={staffView ? "Search all issues..." : "Search my issues..."}
            />
          </label>
        </div>

        {issues === null ? (
          <p className="detail-nophotos">Loading…</p>
        ) : shown.length ? (
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
