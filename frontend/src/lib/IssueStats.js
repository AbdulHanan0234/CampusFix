// counters shared by the Dashboard tab and the Profile activity card
export function computeIssueStats(issues) {
  const total = issues.length;
  const pending = issues.filter((i) => ["Open", "Assigned"].includes(i.status)).length;
  const inProgress = issues.filter((i) => i.status === "In Progress").length;
  const resolved = issues.filter((i) => i.status === "Resolved").length;
  return { total, pending, inProgress, resolved, open: issues.filter((i) => i.status === "Open").length };
}
