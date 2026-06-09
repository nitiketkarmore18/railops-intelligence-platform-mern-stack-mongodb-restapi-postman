export const calculateSLAStatus = (wagon) => {
  const downtime =
  wagon.lastMaintenanceDate && wagon.nextMaintenanceDate
    ? Math.ceil(
        (new Date(wagon.nextMaintenanceDate) -
          new Date(wagon.lastMaintenanceDate)) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  if (wagon.status === "Maintenance") {
    if (downtime > 15) {
      return {
        status: "SLA Breached",
        color: "bg-red-100 text-red-700",
      };
    }

    return {
      status: "Within SLA",
      color: "bg-green-100 text-green-700",
    };
  }

  if (wagon.status === "Inactive") {
    return {
      status: "Operational Risk",
      color: "bg-orange-100 text-orange-700",
    };
  }

  return {
    status: "Stable",
    color: "bg-blue-100 text-blue-700",
  };
};