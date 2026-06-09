export const calculateRiskScore = (wagon) => {
  let score = 0;

  const history = wagon.maintenanceHistory || [];

  const totalCost = history.reduce(
    (sum, record) => sum + Number(record.cost || 0),
    0
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (wagon.nextMaintenanceDate) {
    const nextDate = new Date(wagon.nextMaintenanceDate);
    nextDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (nextDate - today) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) score += 40;
    else if (diffDays === 0) score += 25;
    else if (diffDays <= 3) score += 15;
    else score += 5;
  }

  if (history.length >= 4) score += 25;
  else if (history.length >= 2) score += 15;
  else if (history.length >= 1) score += 5;

  if (totalCost > 50000) score += 25;
  else if (totalCost > 10000) score += 15;
  else if (totalCost > 0) score += 5;

  if (wagon.status === "Maintenance") score += 20;
  else if (wagon.status === "Inactive") score += 15;
  else if (wagon.status === "Available") score += 5;

  return Math.min(score, 100);
};

export const getRiskLevel = (score) => {
  if (score >= 81) return "Critical";
  if (score >= 61) return "High";
  if (score >= 31) return "Medium";
  return "Low";
};

export const getRiskStyle = (level) => {
  if (level === "Critical")
    return "bg-red-100 text-red-700";

  if (level === "High")
    return "bg-orange-100 text-orange-700";

  if (level === "Medium")
    return "bg-yellow-100 text-yellow-700";

  return "bg-green-100 text-green-700";
};