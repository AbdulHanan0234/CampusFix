import { Link } from "react-router-dom";
import rightarrow from "../assets/rightarrow.png";

// issue row list shared by the Dashboard tab and My Issues — same frontend, one file
export default function IssueList({ issues }) {
  return (
    <div className="dash-issuelist">
      {issues.map((issue) => (
        <Link
          className="dash-issuerow"
          to={`/dashboard/my-issues/${issue.id}`}
          key={issue.id}
        >
          <span className={`dash-thumb t-${issue.thumbTone}`}>
            {issue.category.charAt(0)}
          </span>
          <span className="dash-issueinfo">
            <b>{issue.title}</b>
            <small>
              {issue.location} <i>•</i> {issue.dept}
            </small>
          </span>
          <span className="dash-issueago">{issue.ago}</span>
          <span className={`dash-pill p-${issue.priority.toLowerCase()}`}>
            {issue.priority}
          </span>
          <span className={`dash-status s-${issue.status.toLowerCase().replace(" ", "")}`}>
            {issue.status}
          </span>
          <img className="dash-rowarrow" src={rightarrow} alt="" />
        </Link>
      ))}
    </div>
  );
}
