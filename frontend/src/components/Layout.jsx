import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket";
import { getDashboardMetrics } from "../utils/dashboardMetrics";

function Layout({ children }) {
  const [wagons, setWagons] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminInfo, setShowAdminInfo] = useState(false);

  useEffect(() => {
    const fetchWagons = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/wagons");
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date) => {
    if (!date) return false;

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return targetDate.getTime() === today.getTime();
  };

  const fleetUtilizationRate =
    metrics.total > 0
      ? Number(((metrics.active / metrics.total) * 100).toFixed(1))
      : 0;

  const criticalRiskNotifications = metrics.riskData
    .filter((wagon) => wagon.riskLevel === "Critical")
    .map((wagon) => ({
      id: `critical-${wagon._id}`,
      icon: "🚨",
      title: "Critical Risk Wagon",
      message: `Wagon ${wagon.wagonNumber} entered Critical Risk category.`,
      color: "bg-red-50 border-red-200 text-red-700",
    }));

  const slaBreachNotifications = metrics.downtimeData
    .filter(
      (wagon) =>
        wagon.downtimeDays >= 7 ||
        wagon.downtimeLevel === "High" ||
        wagon.downtimeLevel === "Critical"
    )
    .map((wagon) => ({
      id: `sla-${wagon._id}`,
      icon: "⚠",
      title: "SLA Breach Alert",
      message: `Wagon ${wagon.wagonNumber} has ${wagon.downtimeDays} downtime day(s).`,
      color: "bg-orange-50 border-orange-200 text-orange-700",
    }));

  const dueTodayNotifications = metrics.dueToday.map((wagon) => ({
    id: `due-${wagon._id}`,
    icon: "🛠",
    title: "Maintenance Due Today",
    message: `Wagon ${wagon.wagonNumber} is scheduled for maintenance today.`,
    color: "bg-yellow-50 border-yellow-200 text-yellow-700",
  }));

  const completedMaintenanceNotifications = metrics.fixedWagons
    .filter((wagon) => isToday(wagon.maintenanceEndDate))
    .map((wagon) => ({
      id: `completed-${wagon._id}`,
      icon: "✅",
      title: "Maintenance Completed",
      message: `Wagon ${wagon.wagonNumber} maintenance was completed today.`,
      color: "bg-green-50 border-green-200 text-green-700",
    }));

  const highCostNotifications = metrics.allMaintenanceRecords
    .filter((record) => Number(record.cost || 0) >= 50000)
    .map((record, index) => ({
      id: `cost-${record.wagonNumber}-${index}`,
      icon: "💰",
      title: "High Maintenance Cost",
      message: `Wagon ${record.wagonNumber} repair cost reached ₹${Number(
        record.cost || 0
      ).toLocaleString("en-IN")}.`,
      color: "bg-purple-50 border-purple-200 text-purple-700",
    }));

  const fleetUtilizationNotifications =
    metrics.total > 0 && fleetUtilizationRate < 70
      ? [
          {
            id: "fleet-utilization-warning",
            icon: "📉",
            title: "Fleet Utilization Warning",
            message: `Fleet utilization is ${fleetUtilizationRate}%, below the 70% operational threshold.`,
            color: "bg-blue-50 border-blue-200 text-blue-700",
          },
        ]
      : [];

  const notifications = [
    ...criticalRiskNotifications,
    ...slaBreachNotifications,
    ...dueTodayNotifications,
    ...completedMaintenanceNotifications,
    ...highCostNotifications,
    ...fleetUtilizationNotifications,
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-56 bg-gray-900 text-white p-5 flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold">🚆 RailOps</h2>

            <p className="text-sm text-gray-400">
              Intelligence Platform
            </p>
          </div>

          <nav className="space-y-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "block p-3 rounded-lg bg-blue-600 font-semibold shadow-lg text-[15px]"
                  : "block p-3 rounded-lg hover:bg-gray-800 hover:translate-x-1 transition duration-300 text-[15px]"
              }
            >
              📊 Overview
            </NavLink>

            <NavLink
              to="/wagon-records"
              className={({ isActive }) =>
                isActive
                  ? "block p-3 rounded-lg bg-blue-600 font-semibold shadow-lg text-[15px]"
                  : "block p-3 rounded-lg hover:bg-gray-800 hover:translate-x-1 transition duration-300 text-[15px]"
              }
            >
              🚆 Wagons
            </NavLink>

            <NavLink
              to="/maintenance"
              className={({ isActive }) =>
                isActive
                  ? "block p-3 rounded-lg bg-blue-600 font-semibold shadow-lg text-[15px]"
                  : "block p-3 rounded-lg hover:bg-gray-800 hover:translate-x-1 transition duration-300 text-[15px]"
              }
            >
              🛠 Maintenance
            </NavLink>

            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                isActive
                  ? "block p-3 rounded-lg bg-blue-600 font-semibold shadow-lg text-[15px]"
                  : "block p-3 rounded-lg hover:bg-gray-800 hover:translate-x-1 transition duration-300 text-[15px]"
              }
            >
              📈 Analytics
            </NavLink>

            <NavLink
              to="/recent-activities"
              className={({ isActive }) =>
                isActive
                  ? "block p-3 rounded-lg bg-blue-600 font-semibold shadow-lg text-[15px]"
                  : "block p-3 rounded-lg hover:bg-gray-800 hover:translate-x-1 transition duration-300 text-[15px]"
              }
            >
              📝 Activities
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive
                  ? "block p-3 rounded-lg bg-blue-600 font-semibold shadow-lg text-[15px]"
                  : "block p-3 rounded-lg hover:bg-gray-800 hover:translate-x-1 transition duration-300 text-[15px]"
              }
            >
              ⚙ Settings
            </NavLink>
          </nav>
        </div>

        <div>
          <div className="bg-gray-800 p-4 rounded-xl mb-4">
            <p className="font-semibold">👤 Admin</p>
            <p className="text-sm text-gray-400">
              System Administrator
            </p>
          </div>

          <button
            className="w-full bg-red-500 px-3 py-3 rounded-lg hover:bg-red-600 hover:scale-[1.02] transition duration-300 font-semibold shadow-md hover:shadow-xl"
            onClick={() => {
              sessionStorage.removeItem("isLoggedIn");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Version 1.0
          </p>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <div className="bg-white p-4 shadow-md mb-6 flex justify-between items-center rounded-xl border border-gray-100">
          <h1 className="font-bold text-xl">
            🚆 RailOps Intelligence Platform
          </h1>

          <div className="flex items-center gap-4 relative">
            <button
              onClick={() =>
                setShowNotifications(!showNotifications)
              }
              className="relative bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 hover:scale-105 transition duration-300 shadow-sm hover:shadow-md"
            >
              🔔

              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs min-w-5 h-5 px-1 flex items-center justify-center rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-20 top-12 w-[420px] bg-white shadow-2xl rounded-2xl border border-gray-100 z-50 p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-[15px] text-gray-800">
                      Executive Notifications
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Critical operational alerts and maintenance warnings
                    </p>
                  </div>

                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {notifications.length} Alerts
                  </span>
                </div>

                {notifications.length === 0 ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm">
                    ✅ No critical operational alerts right now.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`border p-4 rounded-xl text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-300 ${notification.color}`}
                      >
                        <div className="flex gap-3 items-start">
                          <div className="text-xl">
                            {notification.icon}
                          </div>

                          <div>
                            <h4 className="font-bold">
                              {notification.title}
                            </h4>

                            <p className="text-sm mt-1 leading-relaxed">
                              {notification.message}
                            </p>

                            <p className="text-xs opacity-70 mt-2">
                              Live operational alert
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <div
                onClick={() =>
                  setShowAdminInfo(!showAdminInfo)
                }
                className="flex items-center gap-3 cursor-pointer bg-gray-100 px-3 py-2 rounded-xl hover:bg-gray-200 hover:scale-[1.02] transition duration-300 shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 border flex items-center justify-center text-xl">
                  👤
                </div>

                <span className="font-medium">Admin</span>
              </div>

              {showAdminInfo && (
                <div className="absolute right-0 top-14 w-72 bg-white border shadow-2xl rounded-2xl p-5 z-50">
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl mb-2">
                      👤
                    </div>

                    <h3 className="text-[15px] font-bold">
                      System Administrator
                    </h3>

                    <p className="text-sm text-gray-500">
                      RailOps Intelligence Platform
                    </p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold">Role:</span>
                      <span>Admin</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">Access:</span>
                      <span>Full Access</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">Status:</span>
                      <span className="text-green-600 font-semibold">
                        Active
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">
                        Total Wagons:
                      </span>
                      <span>{metrics.total}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">
                        Active Wagons:
                      </span>
                      <span>{metrics.active}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">
                        Maintenance:
                      </span>
                      <span>{metrics.maintenance}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">
                        Available:
                      </span>
                      <span>{metrics.available}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">
                        Inactive:
                      </span>
                      <span>{metrics.inactive}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}

export default Layout;
