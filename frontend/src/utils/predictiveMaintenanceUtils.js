export const calculatePredictiveMaintenance = (wagon) => {
  const repairCount = wagon.maintenanceHistory?.length || 0;
  const downtimeDays = wagon.downtimeDays || 0;

  const totalCost = (wagon.maintenanceHistory || []).reduce(
    (sum, record) => sum + Number(record.cost || 0),
    0
  );

  let score = 0;

  if (repairCount >= 5) score += 30;
  else if (repairCount >= 3) score += 20;
  else if (repairCount >= 1) score += 10;

  if (downtimeDays >= 15) score += 30;
  else if (downtimeDays >= 7) score += 20;
  else if (downtimeDays >= 3) score += 10;

  if (totalCost >= 50000) score += 25;
  else if (totalCost >= 20000) score += 15;
  else if (totalCost >= 10000) score += 10;

  if (wagon.status === "Under Maintenance") score += 15;

  let riskLevel = "Low Risk";

  if (score >= 70) riskLevel = "Critical Risk";
  else if (score >= 45) riskLevel = "High Risk";
  else if (score >= 25) riskLevel = "Medium Risk";

  return {
    score,
    riskLevel,
    repairCount,
    downtimeDays,
    totalCost,
  };
};

export const getPredictiveRiskStyle = (riskLevel) => {
  if (riskLevel === "Critical Risk") return "bg-red-100 text-red-700";
  if (riskLevel === "High Risk") return "bg-orange-100 text-orange-700";
  if (riskLevel === "Medium Risk") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};