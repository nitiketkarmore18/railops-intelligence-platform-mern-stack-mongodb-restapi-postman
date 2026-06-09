export const calculateDowntimeDays = (wagon) => {
  if (
    wagon.status !== "Maintenance" ||
    !wagon.lastMaintenanceDate
  ) {
    return 0;
  }

  const startDate = new Date(wagon.lastMaintenanceDate);
  const today = new Date();

  const diffTime = today - startDate;

  return Math.max(
    Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
    0
  );
};

export const getDowntimeLevel = (days) => {
  if (days >= 30) return "Critical";
  if (days >= 15) return "High";
  if (days >= 7) return "Medium";
  return "Low";
};

export const getDowntimeStyle = (level) => {
  if (level === "Critical")
    return "bg-red-100 text-red-700";

  if (level === "High")
    return "bg-orange-100 text-orange-700";

  if (level === "Medium")
    return "bg-yellow-100 text-yellow-700";

  return "bg-green-100 text-green-700";
};