import { calculateRiskScore, getRiskLevel } from "./riskScore";
import { calculateDowntimeDays, getDowntimeLevel } from "./downtimeUtils";
import { calculateRepairDurationDays, getMTTRLevel } from "./mttrUtils";

export const getDashboardMetrics = (wagons = []) => {
  const total = wagons.length;

  const active = wagons.filter((w) => w.status === "Active").length;
  const available = wagons.filter((w) => w.status === "Available").length;
  const maintenance = wagons.filter((w) => w.status === "Maintenance").length;
  const inactive = wagons.filter((w) => w.status === "Inactive").length;

  const maintenanceWagons = wagons.filter(
    (wagon) => wagon.status === "Maintenance"
  );

  const fixedWagons = wagons.filter(
    (wagon) =>
      wagon.status !== "Maintenance" &&
      (wagon.maintenanceHistory || []).length > 0
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueWagons = maintenanceWagons.filter((wagon) => {
    if (!wagon.nextMaintenanceDate) return false;

    const nextDate = new Date(wagon.nextMaintenanceDate);
    nextDate.setHours(0, 0, 0, 0);

    return nextDate < today;
  });

  const dueToday = maintenanceWagons.filter((wagon) => {
    if (!wagon.nextMaintenanceDate) return false;

    const nextDate = new Date(wagon.nextMaintenanceDate);
    nextDate.setHours(0, 0, 0, 0);

    return nextDate.getTime() === today.getTime();
  });

  const dueSoon = maintenanceWagons.filter((wagon) => {
    if (!wagon.nextMaintenanceDate) return false;

    const nextDate = new Date(wagon.nextMaintenanceDate);
    nextDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (nextDate - today) / (1000 * 60 * 60 * 24)
    );

    return diffDays > 0 && diffDays <= 3;
  });

  const scheduledMaintenance = maintenanceWagons.filter((wagon) => {
    if (!wagon.nextMaintenanceDate) return false;

    const nextDate = new Date(wagon.nextMaintenanceDate);
    nextDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (nextDate - today) / (1000 * 60 * 60 * 24)
    );

    return diffDays > 3;
  });

  const allMaintenanceRecords = wagons.flatMap((wagon) =>
    (wagon.maintenanceHistory || []).map((record) => ({
      ...record,
      wagonNumber: wagon.wagonNumber,
      wagonType: wagon.type,
    }))
  );

  const totalMaintenanceCost = allMaintenanceRecords.reduce(
    (sum, record) => sum + Number(record.cost || 0),
    0
  );

  const totalMaintenanceRecords = allMaintenanceRecords.length;

  const averageRepairCost =
    totalMaintenanceRecords > 0
      ? Math.round(totalMaintenanceCost / totalMaintenanceRecords)
      : 0;

  const highestCostRecord =
    allMaintenanceRecords.length > 0
      ? allMaintenanceRecords.reduce((max, record) =>
        Number(record.cost || 0) > Number(max.cost || 0) ? record : max
      )
      : null;

  const riskData = wagons.map((wagon) => {
    const score = calculateRiskScore(wagon);
    const level = getRiskLevel(score);

    return {
      ...wagon,
      riskScore: score,
      riskLevel: level,
    };
  });

  const lowRisk = riskData.filter((w) => w.riskLevel === "Low").length;
  const mediumRisk = riskData.filter((w) => w.riskLevel === "Medium").length;
  const highRisk = riskData.filter((w) => w.riskLevel === "High").length;
  const criticalRisk = riskData.filter(
    (w) => w.riskLevel === "Critical"
  ).length;

  const downtimeData = maintenanceWagons.map((wagon) => {
    const days = calculateDowntimeDays(wagon);
    const level = getDowntimeLevel(days);

    return {
      ...wagon,
      downtimeDays: days,
      downtimeLevel: level,
    };
  });

  const totalDowntimeDays = downtimeData.reduce(
    (sum, wagon) => sum + wagon.downtimeDays,
    0
  );

  const averageDowntimeDays =
    downtimeData.length > 0
      ? Math.round(totalDowntimeDays / downtimeData.length)
      : 0;

  const longestDowntimeWagon =
    downtimeData.length > 0
      ? downtimeData.reduce((max, wagon) =>
        wagon.downtimeDays > max.downtimeDays ? wagon : max
      )
      : null;

  const mttrData = fixedWagons.map((wagon) => {
    const repairDays = calculateRepairDurationDays(wagon);
    const mttrLevel = getMTTRLevel(repairDays);

    return {
      ...wagon,
      repairDays,
      mttrLevel,
    };
  });

  const totalRepairDays = mttrData.reduce(
    (sum, wagon) => sum + wagon.repairDays,
    0
  );

  const averageMTTR =
    mttrData.length > 0 ? Math.round(totalRepairDays / mttrData.length) : 0;

  const fastestRepairWagon =
    mttrData.length > 0
      ? mttrData.reduce((min, wagon) =>
        wagon.repairDays < min.repairDays ? wagon : min
      )
      : null;

  const slowestRepairWagon =
    mttrData.length > 0
      ? mttrData.reduce((max, wagon) =>
        wagon.repairDays > max.repairDays ? wagon : max
      )
      : null;

  const lowMTTR = mttrData.filter((w) => w.mttrLevel === "Low").length;
  const mediumMTTR = mttrData.filter((w) => w.mttrLevel === "Medium").length;
  const highMTTR = mttrData.filter((w) => w.mttrLevel === "High").length;
  const criticalMTTR = mttrData.filter(
    (w) => w.mttrLevel === "Critical"
  ).length;

  const totalMaintenanceCases =
    fixedWagons.length + maintenanceWagons.length;

  const maintenanceRecoveryRate =
    totalMaintenanceCases > 0
      ? (
        (fixedWagons.length /
          totalMaintenanceCases) *
        100
      ).toFixed(1)
      : 0;

  return {
    total,
    active,
    available,
    maintenance,
    inactive,

    maintenanceWagons,
    fixedWagons,

    overdueWagons,
    dueToday,
    dueSoon,
    scheduledMaintenance,

    allMaintenanceRecords,
    totalMaintenanceCost,
    totalMaintenanceRecords,
    averageRepairCost,
    highestCostRecord,
    maintenanceRecoveryRate,

    riskData,
    lowRisk,
    mediumRisk,
    highRisk,
    criticalRisk,

    downtimeData,
    totalDowntimeDays,
    averageDowntimeDays,
    longestDowntimeWagon,

    mttrData,
    totalRepairDays,
    averageMTTR,
    fastestRepairWagon,
    slowestRepairWagon,

    lowMTTR,
    mediumMTTR,
    highMTTR,
    criticalMTTR,
  };
};