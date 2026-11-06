import { useEffect, useState } from "react";
import { api, storedUser } from "../api";
import IssueList from "./IssueList";

const FILTERS = ["All", "Open", "In Progress", "Assigned", "Resolved"];
const DEPARTMENTS = ["IT", "Maintenance", "Cleanliness", "Security", "Electrical", "Other"];

export default function MyIssues() {
  const [issues, setIssues] = useState(null); // null = still loading
  const [filter, setFilter] = useState("All");
  const [dept, setDept] = useState("");
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

  // department chips organize the list (server already scopes staff to their
  // routed queue — these chips narrow further)
  const shown = (issues || []).filter(
    (i) =>
      (filter === "All" || i.status === filter) &&
      (!dept || i.category === dept) &&
      (i.title + " " + i.location).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="dash-page">
      <div className="dash-pagehead">
        <h1>{staffView ? (role === "staff" ? "My Department" : "All Issues") : "My Issues"}</h1>
        <p>
          {role === "staff"
            ? `Issues routed to the ${storedUser()?.department || "your"} department.`
            : staffView
              ? "Everything students have reported — organize by department."
              : "Track every issue you've reported, from report to resolution."}
        </p>
      </div>

      <section className="dash-card">
        <div className="dash-filterbar">
          <div className="dash-chips">
            {DEPARTMENTS.map((d) => (
              <button
                type="button"
                key={d}
                className={dept === d ? "dash-chip on" : "dash-chip"}
                onClick={() => setDept(dept === d ? "" : d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
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
              placeholder={staffView ? "Search issues..." : "Search my issues..."}
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
            <span>Try a different department, filter or search term.</span>
          </div>
        )}
      </section>
    </div>
  );
}
