import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket";
import { getDashboardMetrics } from "../utils/dashboardMetrics";
import {
  calculateFleetHealthScore,
  getFleetHealthLevel,
  getFleetHealthStyle,
} from "../utils/fleetHealthUtils";

function SystemOverview() {
  const [wagons, setWagons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchWagons = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/wagons");
      setWagons(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  fetchWagons();

  socket.on("wagonDataUpdated", fetchWagons);

  return () => {
    socket.off("wagonDataUpdated", fetchWagons);
  };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <h2 className="text-lg font-semibold text-gray-600">
          Loading dashboard...
        </h2>
      </div>
    );
  }

  const metrics = getDashboardMetrics(wagons);
  const issueCount = {};
  metrics.allMaintenanceRecords.forEach((record) => {
    issueCount[record.issue] = (issueCount[record.issue] || 0) + 1;
  });

  const mostCommonIssue =
    Object.keys(issueCount).length > 0
      ? Object.entries(issueCount).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";

  const engineerCount = {};
  metrics.allMaintenanceRecords.forEach((record) => {
    engineerCount[record.engineer] =
      (engineerCount[record.engineer] || 0) + 1;
  });

  const topEngineer =
    Object.keys(engineerCount).length > 0
      ? Object.entries(engineerCount).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";

  const highCostWagons = wagons.filter((wagon) => {
    const totalCost = (wagon.maintenanceHistory || []).reduce(
      (sum, record) => sum + Number(record.cost || 0),
      0
    );

    return totalCost > 50000;
  });

  const totalMaintenanceCases =
    metrics.fixedWagons.length +
    metrics.maintenanceWagons.length;

  const maintenanceRecoveryRate =
    totalMaintenanceCases > 0
      ? (
        (metrics.fixedWagons.length /
          totalMaintenanceCases) *
        100
      ).toFixed(1)
      : 0;

  const fleetHealthScore =
    calculateFleetHealthScore(metrics);

  const fleetHealthLevel =
    getFleetHealthLevel(fleetHealthScore);

  const fleetHealthStyle =
    getFleetHealthStyle(fleetHealthScore);

  const aiExecutiveInsights = [];

  if (metrics.maintenance > 0) {
    aiExecutiveInsights.push(
      `⚠️ ${metrics.maintenance} wagon(s) are currently under maintenance and need operational monitoring.`
    );
  }

  if (metrics.overdueWagons.length > 0) {
    aiExecutiveInsights.push(
      `🚨 ${metrics.overdueWagons.length} wagon(s) have overdue maintenance. Immediate inspection is recommended.`
    );
  }

  if (highCostWagons.length > 0) {
    aiExecutiveInsights.push(
      `💰 ${highCostWagons.length} wagon(s) have high maintenance cost. Cost review is suggested.`
    );
  }

  if (maintenanceRecoveryRate >= 60) {
    aiExecutiveInsights.push(
      `✅ Maintenance recovery rate is ${maintenanceRecoveryRate}%, showing healthy repair completion performance.`
    );
  }

  if (metrics.inactive > 0) {
    aiExecutiveInsights.push(
      `🚫 ${metrics.inactive} wagon(s) are inactive. Reactivation planning can improve fleet utilization.`
    );
  }

  if (aiExecutiveInsights.length === 0) {
    aiExecutiveInsights.push(
      "✅ Fleet operations are stable with no major maintenance or risk concerns currently detected."
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold">📊 System Overview</h1>


      <p className="text-gray-500">
        Centralized operational overview of fleet health,
        maintenance status, and business-critical KPIs.
      </p>

      <div>
        <img
          src="/train.jpg"
          alt="Railway"
          className="w-full h-[300px] object-cover rounded-2xl shadow-lg transition duration-500 hover:scale-[1.01] hover:shadow-2xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-amber-500 text-white p-5 rounded-2xl shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
          <p>Total Wagons</p>
          <h2 className="text-3xl font-bold">{metrics.total}</h2>
        </div>

        <div className="bg-green-600 text-white p-5 rounded-2xl shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
          <p>Active</p>
          <h2 className="text-3xl font-bold">{metrics.active}</h2>
        </div>

        <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
          <p>Available</p>
          <h2 className="text-3xl font-bold">{metrics.available}</h2>
        </div>

        <div className="bg-red-600 text-white p-5 rounded-2xl shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
          <p>Maintenance</p>
          <h2 className="text-3xl font-bold">{metrics.maintenance}</h2>
        </div>

        <div className="bg-gray-600 text-white p-5 rounded-2xl shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
          <p>Inactive</p>
          <h2 className="text-3xl font-bold">{metrics.inactive}</h2>
        </div>
      </div>

      {metrics.maintenance > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          ⚠️ {metrics.maintenance} wagon(s) are currently under maintenance.
        </div>
      )}

      <div
        className={`p-6 rounded-2xl shadow-md border hover:shadow-xl hover:-translate-y-1 transition duration-300 ${fleetHealthStyle}`}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">
              🏆 Fleet Health Score
            </h2> 

            <p className="text-sm mt-1 opacity-80">
              AI-driven operational fleet health monitoring (overall)
            </p>
          </div>

          <div className="text-right">
            <h1 className="text-5xl font-bold">
              {fleetHealthScore}/100
            </h1>

            <p className="text-lg font-semibold mt-1">
              {fleetHealthLevel}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <h2 className="text-xl font-bold mb-5 text-gray-800">🔔 Critical Alerts</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-100 text-red-700 p-4 rounded-xl">
            <p className="font-semibold">Overdue Maintenance</p>
            <h3 className="text-3xl font-bold">
              {metrics.overdueWagons.length}
            </h3>
          </div>

          <div className="bg-gray-100 text-gray-700 p-4 rounded-xl">
            <p className="font-semibold">Inactive Wagons</p>
            <h3 className="text-3xl font-bold">{metrics.inactive}</h3>
          </div>

          <div className="bg-orange-100 text-orange-700 p-4 rounded-xl">
            <p className="font-semibold">High Cost Wagons</p>
            <h3 className="text-3xl font-bold">{highCostWagons.length}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <h2 className="text-xl font-bold mb-5 text-gray-800">🛠 Maintenance Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-red-100 text-red-700 p-4 rounded-xl">
            <p className="font-semibold">Overdue</p>
            <h3 className="text-3xl font-bold">
              {metrics.overdueWagons.length}
            </h3>
          </div>

          <div className="bg-green-100 text-green-700 p-4 rounded-xl">
            <p className="font-semibold">Due Today</p>
            <h3 className="text-3xl font-bold">{metrics.dueToday.length}</h3>
          </div>

          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-xl">
            <p className="font-semibold">Due in 3 Days</p>
            <h3 className="text-3xl font-bold">{metrics.dueSoon.length}</h3>
          </div>

          <div className="bg-blue-100 text-blue-700 p-4 rounded-xl">
            <p className="font-semibold">Scheduled</p>
            <h3 className="text-3xl font-bold">
              {metrics.scheduledMaintenance.length}
            </h3>
          </div>

          <div className="bg-purple-100 text-purple-700 p-4 rounded-xl">
            <p className="font-semibold">Fixed</p>
            <h3 className="text-3xl font-bold">
              {metrics.fixedWagons.length}
            </h3>
          </div>

          <div className="bg-indigo-100 text-indigo-700 p-4 rounded-xl">
            <p className="font-semibold">Total Maintenance</p>
            <h3 className="text-3xl font-bold">{metrics.maintenance}</h3>
          </div>

          <div className="bg-cyan-100 text-cyan-700 p-4 rounded-xl">
            <p className="font-semibold">
              Maintenance Records
            </p>

            <h3 className="text-3xl font-bold">
              {metrics.totalMaintenanceRecords}
            </h3>
          </div>

          <div className="bg-emerald-100 text-emerald-700 p-4 rounded-xl">
            <p className="font-semibold">
              Maintenance Recovery Rate
            </p>

            <h3 className="text-3xl font-bold">
              {maintenanceRecoveryRate}%
            </h3>
          </div>
        </div>
      </div>


      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <h2 className="text-xl font-bold mb-5 text-gray-800">
          🧠 Executive Operational Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-100 text-purple-700 p-4 rounded-xl">
            <p className="font-semibold">Top Cost Wagon</p>
            <h3 className="text-2xl font-bold">
              {metrics.highestCostRecord
                ? metrics.highestCostRecord.wagonNumber
                : "N/A"}
            </h3>
          </div>

          <div className="bg-blue-100 text-blue-700 p-4 rounded-xl">
            <p className="font-semibold">Most Common Issue</p>
            <h3 className="text-2xl font-bold">{mostCommonIssue}</h3>
          </div>

          <div className="bg-green-100 text-green-700 p-4 rounded-xl">
            <p className="font-semibold">Top Engineer</p>
            <h3 className="text-2xl font-bold">{topEngineer}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <h2 className="text-xl font-bold mb-5 text-gray-800">
          🤖 AI Executive Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiExecutiveInsights.map((insight, index) => (
            <div
              key={index}
              className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-sm font-medium"
            >
              {insight}
            </div>
          ))}
        </div>
      </div>

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

export default SystemOverview;