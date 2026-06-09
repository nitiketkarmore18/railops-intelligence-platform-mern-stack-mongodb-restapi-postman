export const calculateFailureProbability = (wagon) => {
  const repairs = (wagon.maintenanceHistory || []).length;

  const totalCost = (wagon.maintenanceHistory || []).reduce(
    (sum, record) => sum + Number(record.cost || 0),
    0
  );

  const downtime = Number(wagon.downtimeDays || 0);

  let score = 0;

  score += repairs * 10;
  score += Math.min(totalCost / 10000, 30);
  score += downtime * 2;

  if (wagon.status === "Inactive") {
    score += 20;
  }

  if (wagon.status === "Maintenance") {
    score += 15;
  }

  score = Math.min(Math.round(score), 100);

  let level = "Low";

  if (score >= 75) {
    level = "Critical";
  } else if (score >= 50) {
    level = "High";
  } else if (score >= 25) {
    level = "Medium";
  }

  return {
    probability: score,
    level,
  };
};