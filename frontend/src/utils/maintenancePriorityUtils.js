import { calculateRiskScore } from "./riskScore";
import { calculateDowntimeDays } from "./downtimeUtils";

export const getMaintenancePriorityRanking = (wagons) => {
  return wagons
    .filter((wagon) => wagon.status === "Maintenance")
    .map((wagon) => {
      const riskScore = calculateRiskScore(wagon);
      const downtimeDays = calculateDowntimeDays(wagon);

      const history = wagon.maintenanceHistory || [];

      const totalRepairs = history.length;

      const totalCost = history.reduce(
        (sum, record) => sum + Number(record.cost || 0),
        0
      );

      let priorityScore = riskScore;

      if (downtimeDays >= 30) priorityScore += 30;
      else if (downtimeDays >= 15) priorityScore += 20;
      else if (downtimeDays >= 7) priorityScore += 10;

      if (totalCost >= 100000) priorityScore += 25;
      else if (totalCost >= 50000) priorityScore += 15;

      if (totalRepairs >= 5) priorityScore += 20;
      else if (totalRepairs >= 3) priorityScore += 10;

      let priorityLevel = "Low";

      if (priorityScore >= 130) priorityLevel = "Critical";
      else if (priorityScore >= 100) priorityLevel = "High";
      else if (priorityScore >= 70) priorityLevel = "Medium";

      return {
        ...wagon,
        riskScore,
        downtimeDays,
        totalRepairs,
        totalCost,
        priorityScore,
        priorityLevel,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
};

export const getPriorityStyle = (level) => {
  if (level === "Critical") return "bg-red-100 text-red-700";
  if (level === "High") return "bg-orange-100 text-orange-700";
  if (level === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};