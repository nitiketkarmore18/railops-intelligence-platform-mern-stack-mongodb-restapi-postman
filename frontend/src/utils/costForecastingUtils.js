export const calculateCostForecast = (wagon) => {
  const history = wagon.maintenanceHistory || [];

  const totalCost = history.reduce(
    (sum, record) => sum + Number(record.cost || 0),
    0
  );

  const repairCount = history.length;
  const averageRepairCost = repairCount > 0 ? totalCost / repairCount : 0;

  let forecastMultiplier = 1;

  if (repairCount >= 5) forecastMultiplier += 0.4;
  else if (repairCount >= 3) forecastMultiplier += 0.25;
  else if (repairCount >= 1) forecastMultiplier += 0.1;

  if (wagon.status === "Under Maintenance" || wagon.status === "Maintenance") {
    forecastMultiplier += 0.15;
  }

  const forecastedCost = Math.round(averageRepairCost * forecastMultiplier);

  let costRisk = "Low Cost Risk";

  if (forecastedCost >= 50000) costRisk = "High Cost Risk";
  else if (forecastedCost >= 20000) costRisk = "Medium Cost Risk";

  return {
    totalCost,
    repairCount,
    averageRepairCost: Math.round(averageRepairCost),
    forecastedCost,
    costRisk,
  };
};

export const getCostForecastStyle = (costRisk) => {
  if (costRisk === "High Cost Risk") return "bg-red-100 text-red-700";
  if (costRisk === "Medium Cost Risk") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};