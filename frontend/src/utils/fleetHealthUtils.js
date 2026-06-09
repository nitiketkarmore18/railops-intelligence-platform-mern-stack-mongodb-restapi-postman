export const calculateFleetHealthScore = (metrics) => {
  if (!metrics || metrics.total === 0) {
    return 0;
  }

  let score = 100;

  const maintenancePenalty =
    (metrics.maintenance / metrics.total) * 20;

  const inactivePenalty =
    (metrics.inactive / metrics.total) * 15;

  const overduePenalty =
    (metrics.overdueWagons.length / metrics.total) * 25;

  const criticalRiskPenalty =
    (metrics.criticalRisk / metrics.total) * 25;

  const highRiskPenalty =
    (metrics.highRisk / metrics.total) * 15;

  score =
    score -
    maintenancePenalty -
    inactivePenalty -
    overduePenalty -
    criticalRiskPenalty -
    highRiskPenalty;

  return Math.max(0, Math.round(score));
};

export const getFleetHealthLevel = (score) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Moderate";
  return "Critical";
};

export const getFleetHealthStyle = (score) => {
  if (score >= 85) {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (score >= 70) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  if (score >= 50) {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  return "bg-red-100 text-red-700 border-red-200";
};