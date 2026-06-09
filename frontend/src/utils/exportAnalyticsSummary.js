import { saveAs } from "file-saver";

export const exportAnalyticsSummary = (metrics) => {
  const rows = [
    ["Metric", "Value"],

    ["Total Wagons", metrics.total],
    ["Active Wagons", metrics.active],
    ["Available Wagons", metrics.available],
    ["Maintenance Wagons", metrics.maintenance],
    ["Inactive Wagons", metrics.inactive],

    ["Fixed Wagons", metrics.fixedWagons.length],

    ["Total Maintenance Cost", metrics.totalMaintenanceCost],
    ["Average Repair Cost", metrics.averageRepairCost],
    ["Maintenance Records", metrics.totalMaintenanceRecords],

    ["Low Risk Wagons", metrics.lowRisk],
    ["Medium Risk Wagons", metrics.mediumRisk],
    ["High Risk Wagons", metrics.highRisk],
    ["Critical Risk Wagons", metrics.criticalRisk],

    ["Total Downtime Days", metrics.totalDowntimeDays],
    ["Average Downtime Days", metrics.averageDowntimeDays],

    ["Average MTTR", metrics.averageMTTR],

    ["Maintenance Recovery Rate", metrics.maintenanceRecoveryRate || 0],
  ];

  const csvContent = rows
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  saveAs(blob, "analytics_summary.csv");
};