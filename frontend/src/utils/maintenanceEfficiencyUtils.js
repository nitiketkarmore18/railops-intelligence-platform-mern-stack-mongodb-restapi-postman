export const calculateMaintenanceEfficiency = (wagon) => {
  const repairs = (wagon.maintenanceHistory || []).length;

  const totalCost = (wagon.maintenanceHistory || []).reduce(
    (sum, record) => sum + Number(record.cost || 0),
    0
  );

  const downtime = Number(wagon.downtimeDays || 0);

  let score = 100;

  score -= repairs * 5;
  score -= Math.min(totalCost / 10000, 25);
  score -= downtime * 2;

  if (wagon.status === "Inactive") {
    score -= 15;
  }

  if (wagon.status === "Maintenance") {
    score -= 10;
  }

  score = Math.max(Math.round(score), 0);

  let level = "Excellent";

  if (score < 80) level = "Good";
  if (score < 60) level = "Moderate";
  if (score < 40) level = "Poor";
  if (score < 20) level = "Critical";

  return {
    efficiencyScore: score,
    efficiencyLevel: level,
  };
};