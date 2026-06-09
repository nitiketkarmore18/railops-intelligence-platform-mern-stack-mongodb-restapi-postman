export const detectFailurePatterns = (wagons) => {
  const issueCount = {};
  const typeIssueCount = {};
  const wagonIssueCount = {};

  wagons.forEach((wagon) => {
    const history = wagon.maintenanceHistory || [];

    history.forEach((record) => {
      const issue = record.issue || "Unknown Issue";
      const type = wagon.type || "Unknown Type";
      const wagonNumber = wagon.wagonNumber || "Unknown Wagon";

      issueCount[issue] = (issueCount[issue] || 0) + 1;

      const typeIssueKey = `${type} - ${issue}`;
      typeIssueCount[typeIssueKey] = (typeIssueCount[typeIssueKey] || 0) + 1;

      const wagonIssueKey = `${wagonNumber} - ${issue}`;
      wagonIssueCount[wagonIssueKey] = (wagonIssueCount[wagonIssueKey] || 0) + 1;
    });
  });

  const patterns = [];

  Object.entries(issueCount).forEach(([issue, count]) => {
    if (count >= 3) {
      patterns.push(`⚠️ ${issue} occurred ${count} times across the fleet.`);
    }
  });

  Object.entries(typeIssueCount).forEach(([key, count]) => {
    if (count >= 2) {
      patterns.push(`🔍 Pattern detected: ${key} repeated ${count} times.`);
    }
  });

  Object.entries(wagonIssueCount).forEach(([key, count]) => {
    if (count >= 2) {
      patterns.push(`🚨 Repeated wagon issue: ${key} occurred ${count} times.`);
    }
  });

  if (patterns.length === 0) {
    patterns.push("✅ No repeated failure patterns detected currently.");
  }

  return patterns.slice(0, 6);
};