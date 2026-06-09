import {
  calculatePredictiveMaintenance,
  getPredictiveRiskStyle,
} from "../utils/predictiveMaintenanceUtils";
import {
  calculateMaintenanceSeverity,
  getSeverityStyle,
} from "../utils/maintenanceSeverityUtils";
import {
  calculateRepairDurationDays,
  getMTTRLevel,
  getMTTRStyle,
} from "../utils/mttrUtils";
import {
  calculateDowntimeDays,
  getDowntimeLevel,
  getDowntimeStyle,
} from "../utils/downtimeUtils";
import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket";
import MaintenanceHistoryModal from "../components/MaintenanceHistoryModal";
import { getDashboardMetrics } from "../utils/dashboardMetrics";
import WagonDetailsModal from "../components/WagonDetailsModal";
import toast from "react-hot-toast";
function Maintenance() {
  const [wagons, setWagons] = useState([]);
  const [selectedHistoryWagon, setSelectedHistoryWagon] = useState(null);
  const [selectedDetailsWagon, setSelectedDetailsWagon] = useState(null);

  useEffect(() => {
    const fetchWagons = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/wagons"
        );

        setWagons(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWagons();

    socket.on("wagonDataUpdated", fetchWagons);

    return () => {
      socket.off("wagonDataUpdated", fetchWagons);
    };
  }, []);

  const metrics = getDashboardMetrics(wagons);

  const maintenanceWagons = metrics.maintenanceWagons;
  const fixedWagons = metrics.fixedWagons;

  const handleMarkFixed = async (wagonId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/wagons/${wagonId}/mark-fixed`
      );

      const res = await axios.get(
        "http://localhost:5000/api/wagons"
      );

      setWagons(res.data);

      toast.success("Wagon marked as fixed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark wagon as fixed");
    }
  };

  const getMaintenanceLabel = (date) => {
    if (!date) return "No Date";

    const today = new Date();
    const nextDate = new Date(date);

    today.setHours(0, 0, 0, 0);
    nextDate.setHours(0, 0, 0, 0);

    if (nextDate < today) return "Overdue";

    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Due Today";

    if (diffDays <= 7) return `Due in ${diffDays} day(s)`;

    return "Scheduled";
  };

  const getLabelStyle = (label) => {
    if (label === "Overdue") {
      return "bg-red-100 text-red-700";
    }

    if (label === "Due Today") {
      return "bg-green-100 text-green-700";
    }

    if (label.includes("Due in")) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (label === "No Date") {
      return "bg-gray-100 text-gray-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  const exportFixedWagonsCSV = () => {
    if (fixedWagons.length === 0) {
      toast.error("No fixed wagon data available to export");
      return;
    }

    const headers = [
      "Wagon Number",
      "Type",
      "Current Location",
      "Last Maintenance Date",
      "Total Cost",
      "Total Repairs",
      "MTTR Days",
      "MTTR Level",
      "Current Status",
    ];

    const rows = fixedWagons.map((wagon) => {
      const history = wagon.maintenanceHistory || [];

      const totalCost = history.reduce(
        (sum, record) => sum + Number(record.cost || 0),
        0
      );

      const totalRepairs = history.length;
      const mttrDays = calculateRepairDurationDays(wagon);
      const mttrLevel = getMTTRLevel(mttrDays);

      return [
        wagon.wagonNumber,
        wagon.type,
        wagon.currentLocation,
        wagon.lastMaintenanceDate
          ? new Date(wagon.lastMaintenanceDate).toLocaleDateString()
          : "N/A",
        totalCost,
        totalRepairs,
        mttrDays,
        mttrLevel,
        wagon.status,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "fixed-maintenance-wagons.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Fixed wagon CSV downloaded");
  };

  const exportUnderMaintenanceCSV = () => {
    if (maintenanceWagons.length === 0) {
      toast.error("No under maintenance wagon data available to export");
      return;
    }

    const headers = [
      "Wagon Number",
      "Type",
      "Current Location",
      "Last Maintenance Date",
      "Next Maintenance Date",
      "Maintenance Alert",
      "Downtime Days",
      "Downtime Level",
      "Total Cost",
      "Total Repairs",
      "Status",
    ];

    const rows = maintenanceWagons.map((wagon) => {
      const history = wagon.maintenanceHistory || [];

      const totalCost = history.reduce(
        (sum, record) => sum + Number(record.cost || 0),
        0
      );

      const totalRepairs = history.length;
      const downtimeDays = calculateDowntimeDays(wagon);
      const downtimeLevel = getDowntimeLevel(downtimeDays);
      const maintenanceAlert = getMaintenanceLabel(wagon.nextMaintenanceDate);

      return [
        wagon.wagonNumber,
        wagon.type,
        wagon.currentLocation,
        wagon.lastMaintenanceDate
          ? new Date(wagon.lastMaintenanceDate).toLocaleDateString()
          : "N/A",
        wagon.nextMaintenanceDate
          ? new Date(wagon.nextMaintenanceDate).toLocaleDateString()
          : "N/A",
        maintenanceAlert,
        downtimeDays,
        downtimeLevel,
        totalCost,
        totalRepairs,
        wagon.status,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "under-maintenance-wagons.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Under maintenance CSV downloaded");
  };

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold">🛠 Maintenance Management</h1>
      <p className="text-gray-500 text-sm mt-1">
        Track active maintenance, completed repairs, downtime, costs, and MTTR performance.
      </p>

      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl font-medium">
        Total wagons under maintenance: {maintenanceWagons.length}
      </div>

      {/* Under Maintenance Table */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold"> UNDER MAINTENANCE WAGONS
          </h2>

          <button
            onClick={exportUnderMaintenanceCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition"
          >
            Export CSV
          </button>
        </div>

        <div className="max-h-[600px] overflow-y-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm table-auto">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white sticky top-0 z-10">
              <tr>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Wagon No.</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Type</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Location</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Last Maintenance</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Next Maintenance</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Maintenance Alert</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Downtime Days & Level</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Total Cost & Repairs</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Severity</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Predictive Risk</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Action</th>
              </tr>
            </thead>

            <tbody>
              {maintenanceWagons.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-6 text-center text-gray-500">
                    No wagons currently under maintenance
                  </td>
                </tr>
              ) : (
                maintenanceWagons.map((wagon) => {
                  const label = getMaintenanceLabel(wagon.nextMaintenanceDate);
                  const downtimeDays = calculateDowntimeDays(wagon);
                  const downtimeLevel = getDowntimeLevel(downtimeDays);
                  const downtimeStyle = getDowntimeStyle(downtimeLevel);
                  const totalCost = (wagon.maintenanceHistory || []).reduce(
                    (sum, record) => sum + Number(record.cost || 0),
                    0
                  );
                  const totalRepairs = (wagon.maintenanceHistory || []).length;
                  const severity =
                    calculateMaintenanceSeverity(wagon);

                  const severityStyle =
                    getSeverityStyle(severity);

                  const predictive = calculatePredictiveMaintenance(wagon);
                  const predictiveStyle = getPredictiveRiskStyle(predictive.riskLevel);

                  return (
                    <tr
                      key={wagon._id}
                      className="text-center border-t hover:bg-gray-50 transition"
                    >                    <td className="p-3 font-semibold">
                        {wagon.wagonNumber}
                      </td>

                      <td className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">{wagon.type}</td>

                      <td className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">{wagon.currentLocation}</td>

                      <td className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">
                        {wagon.lastMaintenanceDate
                          ? new Date(
                            wagon.lastMaintenanceDate
                          ).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">
                        {wagon.nextMaintenanceDate
                          ? new Date(
                            wagon.nextMaintenanceDate
                          ).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">
                        <span
                          className={`px-2 py-1 rounded ${getLabelStyle(label)}`}
                        >
                          {label}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold">
                            {downtimeDays} day(s)
                          </span>

                          <span className={`px-2 py-1 rounded text-xs ${downtimeStyle}`}>
                            {downtimeLevel}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold text-green-700">
                            ₹{totalCost}
                          </span>

                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {totalRepairs} Repairs
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${severityStyle}`}
                        >
                          {severity}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className=" text-xs font-bold text-gray-500">
                            {predictive.score}/100
                          </span>

                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${predictiveStyle}`}>
                            {predictive.riskLevel}
                          </span>
                        </div>
                      </td>

                      <td className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">
                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() => setSelectedHistoryWagon(wagon)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold text-xs transition"
                          >
                            Add Record
                          </button>

                          <button
                            onClick={() => setSelectedDetailsWagon(wagon)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-semibold text-xs transition"
                          >
                            Details
                          </button>

                          <button
                            onClick={() => handleMarkFixed(wagon._id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold text-xs transition"                        >
                            Mark Fixed
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fixed Wagons Table */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            ✅ FIXED MAINTENANCE WAGONS
          </h2>

          <button
            onClick={exportFixedWagonsCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition"
          >
            Export CSV
          </button>
        </div>

        <div className="max-h-[600px] overflow-y-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm table-auto">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white sticky top-0 z-10">
              <tr>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Wagon No.</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Type</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Location</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Last Maintenance</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Total Cost</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Total Repairs</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">MTTR</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">MTTR Level</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Current Status</th>
                <th className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">Action</th>
              </tr>
            </thead>

            <tbody>
              {fixedWagons.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-6 text-center text-gray-500">
                    No fixed maintenance records available
                  </td>
                </tr>
              ) : (
                fixedWagons.map((wagon) => {
                  const totalRepairs =
                    (wagon.maintenanceHistory || []).length;

                  const totalCost = (wagon.maintenanceHistory || []).reduce(
                    (sum, record) => sum + Number(record.cost || 0),
                    0
                  );
                  const mttrDays = calculateRepairDurationDays(wagon);

                  const mttrLevel = getMTTRLevel(mttrDays);

                  const mttrStyle = getMTTRStyle(mttrLevel);

                  return (
                    <tr
                      key={wagon._id}
                      className="text-center border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-3 font-semibold">
                        {wagon.wagonNumber}
                      </td>

                      <td className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">{wagon.type}</td>

                      <td className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">{wagon.currentLocation}</td>

                      <td className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">
                        {wagon.lastMaintenanceDate
                          ? new Date(
                            wagon.lastMaintenanceDate
                          ).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td className="p-3 font-semibold">
                        ₹{totalCost}
                      </td>

                      <td className="p-3 font-semibold">
                        {totalRepairs}
                      </td>

                      <td className="p-3 font-semibold">
                        {mttrDays} day(s)
                      </td>

                      <td className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">
                        <span className={`px-2 py-1 rounded ${mttrStyle}`}>
                          {mttrLevel}
                        </span>
                      </td>

                      <td className="px-2 py-3 font-semibold tracking-wide text-xs uppercase">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          {wagon.status}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">

                          <button
                            onClick={() => setSelectedHistoryWagon(wagon)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                          >
                            View History
                          </button>

                          <button
                            onClick={() => setSelectedDetailsWagon(wagon)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                          >
                            Details
                          </button>

                        </div>

                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MaintenanceHistoryModal
        selectedWagon={selectedHistoryWagon}
        setSelectedWagon={setSelectedHistoryWagon}

      />

      <WagonDetailsModal
        selectedDetailsWagon={selectedDetailsWagon}
        setSelectedDetailsWagon={setSelectedDetailsWagon}
      />

      <footer className="pt-8 pb-4 text-center border-t border-gray-200 mt-10">
        <p className="text-sm text-gray-600 font-medium">
          RailOps Intelligence Platform © 2026
        </p>

        <p className="text-xs text-gray-500 mt-1">
          Enterprise Rail Wagon Management, Maintenance & Predictive Analytics System
        </p>
      </footer>
    </div>
  );
}

export default Maintenance;