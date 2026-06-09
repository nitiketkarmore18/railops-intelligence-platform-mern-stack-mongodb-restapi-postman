import {
  calculateRiskScore,
  getRiskLevel,
} from "./riskScore";

export const getMaintenanceRecommendations = (wagons) => {
  return wagons
    .map((wagon) => {
      const riskScore = calculateRiskScore(wagon);
      const riskLevel = getRiskLevel(riskScore);

      const history = wagon.maintenanceHistory || [];

      const totalRepairs = history.length;

      const totalCost = history.reduce(
        (sum, record) => sum + Number(record.cost || 0),
        0
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let overdueDays = 0;

      if (wagon.nextMaintenanceDate) {
        const nextDate = new Date(wagon.nextMaintenanceDate);
        nextDate.setHours(0, 0, 0, 0);

        if (nextDate < today) {
          overdueDays = Math.ceil(
            (today - nextDate) / (1000 * 60 * 60 * 24)
          );
        }
      }

      let recommendationScore = 0;

      recommendationScore += riskScore;

      if (overdueDays > 0) recommendationScore += 25;
      if (totalRepairs >= 5) recommendationScore += 20;
      if (totalCost >= 100000) recommendationScore += 20;
      if (wagon.status === "Maintenance") recommendationScore += 15;
      if (wagon.status === "Inactive") recommendationScore += 10;

      let priority = "Low";

      if (recommendationScore >= 120) {
        priority = "Critical";
      } else if (recommendationScore >= 90) {
        priority = "High";
      } else if (recommendationScore >= 60) {
        priority = "Medium";
      }

      let reason = "Routine monitoring recommended.";

      if (priority === "Critical") {
        reason =
          "Immediate maintenance inspection recommended due to high risk, overdue schedule, or heavy repair history.";
      } else if (priority === "High") {
        reason =
          "Preventive maintenance should be scheduled soon to reduce failure probability.";
      } else if (priority === "Medium") {
        reason =
          "Monitor this wagon closely and plan maintenance if risk continues to increase.";
      }

      return {
        ...wagon,
        riskScore,
        riskLevel,
        totalRepairs,
        totalCost,
        overdueDays,
        recommendationScore,
        priority,
        reason,
      };
    })
    .filter((wagon) => wagon.priority !== "Low")
    .sort(
      (a, b) =>
        b.recommendationScore - a.recommendationScore
    );
};

export const getRecommendationStyle = (priority) => {
  if (priority === "Critical") {
    return "bg-red-100 text-red-700";
  }

  if (priority === "High") {
    return "bg-orange-100 text-orange-700";
  }

  if (priority === "Medium") {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-green-100 text-green-700";
};