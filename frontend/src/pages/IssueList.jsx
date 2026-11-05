import { Link } from "react-router-dom";
import rightarrow from "../assets/right-arrow.png";
import { ago } from "../Api";

// thumb color per category — matches the t-* avatar tones already in dashboard.css
const TONES = {
  IT: "indigo",
  Maintenance: "orange",
  Cleanliness: "pink",
  Security: "violet",
  Electrical: "green",
  Other: "blue",
};

// issue row list shared by the Dashboard tab and My Issues — one component
export default function IssueList({ issues }) {
  return (
    <div className="dash-issuelist">
      {issues.map((issue) => (
        <Link
          className="dash-issuerow"
          to={`/dashboard/my-issues/${issue._id}`}
          key={issue._id}
        >
          <span className={`dash-thumb t-${TONES[issue.category] || "blue"}`}>
            {issue.category?.charAt(0)}
          </span>
          <span className="dash-issueinfo">
            <b>{issue.title}</b>
            <small>
              {issue.location} <i>•</i> {issue.category}
            </small>
          </span>
          <span className="dash-issueago">{ago(issue.createdAt)}</span>
          <span className={`dash-pill p-${issue.priority?.toLowerCase()}`}>
            {issue.priority}
          </span>
          <span className={`dash-status s-${issue.status?.toLowerCase().replace(" ", "")}`}>
            {issue.status}
          </span>
          <img className="dash-rowarrow" src={rightarrow} alt="" />
        </Link>
      ))}
    </div>
  );
}
