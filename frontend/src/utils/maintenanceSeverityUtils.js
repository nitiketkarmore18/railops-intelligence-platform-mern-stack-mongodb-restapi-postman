export const calculateMaintenanceSeverity = (wagon) => {
  const history = wagon.maintenanceHistory || [];

  const totalCost = history.reduce(
    (sum, record) => sum + Number(record.cost || 0),
    0
  );

  const totalRepairs = history.length;

  const lastMaintenanceDate = wagon.lastMaintenanceDate
    ? new Date(wagon.lastMaintenanceDate)
    : null;

  const today = new Date();
  let daysSinceMaintenance = 0;

  if (lastMaintenanceDate) {
    const diffTime = today - lastMaintenanceDate;
    daysSinceMaintenance = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  let severityScore = 0;

  if (totalCost >= 100000) severityScore += 35;
  else if (totalCost >= 50000) severityScore += 25;
  else if (totalCost >= 20000) severityScore += 15;

  if (totalRepairs >= 5) severityScore += 30;
  else if (totalRepairs >= 3) severityScore += 20;
  else if (totalRepairs >= 1) severityScore += 10;

  if (daysSinceMaintenance >= 180) severityScore += 25;
  else if (daysSinceMaintenance >= 90) severityScore += 15;
  else if (daysSinceMaintenance >= 30) severityScore += 10;

  if (wagon.status === "Maintenance") severityScore += 20;
  if (wagon.status === "Inactive") severityScore += 15;

  if (severityScore >= 80) return "Critical";
  if (severityScore >= 55) return "High";
  if (severityScore >= 30) return "Medium";
  return "Low";
};

export const getSeverityStyle = (severity) => {
  if (severity === "Critical") return "bg-red-100 text-red-700";
  if (severity === "High") return "bg-orange-100 text-orange-700";
  if (severity === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};