export const getEngineerAnalytics = (wagons) => {
  const engineerStats = {};

  wagons.forEach((wagon) => {
    (wagon.maintenanceHistory || []).forEach((record) => {
      const engineer = record.engineer || "Unknown Engineer";
      const cost = Number(record.cost || 0);

      if (!engineerStats[engineer]) {
        engineerStats[engineer] = {
          repairs: 0,
          totalCost: 0,
        };
      }

      engineerStats[engineer].repairs += 1;
      engineerStats[engineer].totalCost += cost;
    });
  });

  return Object.entries(engineerStats)
    .map(([engineer, stats]) => ({
      engineer,
      repairs: stats.repairs,
      totalCost: stats.totalCost,
      averageCost: Math.round(
        stats.totalCost / stats.repairs
      ),
    }))
    .sort((a, b) => b.repairs - a.repairs);
};