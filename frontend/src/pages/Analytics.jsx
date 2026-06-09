import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket";
import {
  getMaintenanceRecommendations,
  getRecommendationStyle,
} from "../utils/maintenanceRecommendationUtils";
import {
  getMaintenancePriorityRanking,
  getPriorityStyle,
} from "../utils/maintenancePriorityUtils";
import { detectFailurePatterns } from "../utils/failurePatternUtils";
import { calculateSLAStatus } from "../utils/slaTrackingUtils";
import { getEngineerAnalytics } from "../utils/engineerAnalyticsUtils";
import { calculateMaintenanceEfficiency } from "../utils/maintenanceEfficiencyUtils";
import { calculateFailureProbability } from "../utils/failureProbabilityUtils";
import { calculateDowntimeDays } from "../utils/downtimeUtils";
import { calculateCostForecast } from "../utils/costForecastingUtils";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { getDashboardMetrics } from "../utils/dashboardMetrics";
import { exportAnalyticsSummary } from "../utils/exportAnalyticsSummary";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function Analytics() {
  const [wagons, setWagons] = useState([]);

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
  const recommendations = getMaintenanceRecommendations(wagons);

  const totalCapacity = wagons.reduce(
    (sum, wagon) => sum + Number(wagon.capacity || 0),
    0
  );

  const averageCapacity =
    metrics.total > 0 ? Math.round(totalCapacity / metrics.total) : 0;

  const maintenancePercentage =
    metrics.total > 0
      ? ((metrics.maintenance / metrics.total) * 100).toFixed(1)
      : 0;

  const inactivePercentage =
    metrics.total > 0
      ? ((metrics.inactive / metrics.total) * 100).toFixed(1)
      : 0;

  const fleetUtilizationRate =
    metrics.total > 0
      ? ((metrics.active / metrics.total) * 100).toFixed(1)
      : 0;

  const getOperationalHealthStatus = () => {
    if (
      metrics.criticalRisk > 0 ||
      metrics.averageDowntimeDays > 14 ||
      Number(maintenancePercentage) > 40
    ) {
      return {
        status: "Critical Attention",
        level: "High operational risk detected",
        style: "bg-red-50 text-red-700 border-red-100",
      };
    }

    if (
      metrics.highRisk > 0 ||
      Number(maintenancePercentage) > 25 ||
      Number(inactivePercentage) > 20
    ) {
      return {
        status: "Needs Monitoring",
        level: "Moderate operational pressure",
        style: "bg-orange-50 text-orange-700 border-orange-100",
      };
    }

    return {
      status: "Stable",
      level: "Fleet operations are within healthy limits",
      style: "bg-green-50 text-green-700 border-green-100",
    };
  };

  const operationalHealth = getOperationalHealthStatus();

  const executiveAlerts = [];

  if (metrics.criticalRisk > 0) {
    executiveAlerts.push({
      title: "Critical Risk Wagons",
      value: metrics.criticalRisk,
      message: "Immediate maintenance inspection required.",
      style: "bg-red-50 text-red-700 border-red-100",
    });
  }

  if (metrics.overdueWagons?.length > 0) {
    executiveAlerts.push({
      title: "Overdue Maintenance",
      value: metrics.overdueWagons.length,
      message: "Maintenance schedule breach detected.",
      style: "bg-orange-50 text-orange-700 border-orange-100",
    });
  }

  if (Number(fleetUtilizationRate) < 60) {
    executiveAlerts.push({
      title: "Low Fleet Utilization",
      value: `${fleetUtilizationRate}%`,
      message: "Operational asset usage is below expected level.",
      style: "bg-yellow-50 text-yellow-700 border-yellow-100",
    });
  }

  if (metrics.averageDowntimeDays > 10) {
    executiveAlerts.push({
      title: "High Average Downtime",
      value: `${metrics.averageDowntimeDays}d`,
      message: "Repair turnaround requires operational review.",
      style: "bg-purple-50 text-purple-700 border-purple-100",
    });
  }

  if (executiveAlerts.length === 0) {
    executiveAlerts.push({
      title: "No Critical Alerts",
      value: "Stable",
      message: "Fleet operations are currently within acceptable limits.",
      style: "bg-green-50 text-green-700 border-green-100",
    });
  }

  const cargo = wagons.filter((w) => w.type === "Cargo").length;
  const passenger = wagons.filter((w) => w.type === "Passenger").length;
  const oilTanker = wagons.filter((w) => w.type === "Oil Tanker").length;
  const container = wagons.filter((w) => w.type === "Container").length;
  const flatbed = wagons.filter((w) => w.type === "Flatbed").length;

  const typeChartData = {
    labels: ["Cargo", "Passenger", "Oil Tanker", "Container", "Flatbed"],
    datasets: [
      {
        label: "Wagons by Type",
        data: [cargo, passenger, oilTanker, container, flatbed],
        backgroundColor: ["blue", "purple", "red", "green", "orange"],
      },
    ],
  };

  const costData = {};

  metrics.maintenanceWagons.forEach((wagon) => {
    const totalCost = (wagon.maintenanceHistory || []).reduce(
      (sum, record) => sum + Number(record.cost || 0),
      0
    );

    if (totalCost > 0) {
      costData[wagon.wagonNumber] = totalCost;
    }
  });

  const costChartData = {
    labels: Object.keys(costData),
    datasets: [
      {
        label: "Maintenance Cost",
        data: Object.values(costData),
        backgroundColor: "#9ca3af",
        borderRadius: 8,

      },
    ],
  };

  const fixedCostData = {};

  metrics.fixedWagons.forEach((wagon) => {
    const totalCost = (wagon.maintenanceHistory || []).reduce(
      (sum, record) => sum + Number(record.cost || 0),
      0
    );

    if (totalCost > 0) {
      fixedCostData[wagon.wagonNumber] = totalCost;
    }
  });

  const fixedCostChartData = {
    labels: Object.keys(fixedCostData),
    datasets: [
      {
        label: "Fixed Wagon Repair Cost",
        data: Object.values(fixedCostData),
        backgroundColor: "#9ca3af",
        borderRadius: 8,

      },
    ],
  };

  const statusChartData = {
    labels: ["Active", "Available", "Maintenance", "Inactive"],
    datasets: [
      {
        label: "Wagons by Status",
        data: [
          metrics.active,
          metrics.available,
          metrics.maintenance,
          metrics.inactive,
        ],
        backgroundColor: ["green", "orange", "red", "gray"],
      },
    ],
  };

  const riskChartData = {
    labels: ["Low", "Medium", "High", "Critical"],
    datasets: [
      {
        label: "Risk Distribution",
        data: [
          metrics.lowRisk,
          metrics.mediumRisk,
          metrics.highRisk,
          metrics.criticalRisk,
        ],
        backgroundColor: ["green", "yellow", "orange", "red"],
      },
    ],
  };

  const downtimeLevelCount = {
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0,
  };

  metrics.downtimeData.forEach((wagon) => {
    downtimeLevelCount[wagon.downtimeLevel] += 1;
  });

  const downtimeChartData = {
    labels: ["Low", "Medium", "High", "Critical"],
    datasets: [
      {
        label: "Downtime Severity",
        data: [
          downtimeLevelCount.Low,
          downtimeLevelCount.Medium,
          downtimeLevelCount.High,
          downtimeLevelCount.Critical,
        ],
        backgroundColor: ["green", "yellow", "orange", "red"],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      x: {
        title: {
          display: true,
          text: "Wagons / Categories",
          font: {
            size: 14,
            weight: "bold",
          },
        },

        grid: {
          display: false,
        },
      },

      y: {
        beginAtZero: true,

        title: {
          display: true,
          text: "Values / Counts",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const aiRecommendations = [];

  if (metrics.criticalRisk > 0) {
    aiRecommendations.push(
      `⚠️ ${metrics.criticalRisk} wagon(s) are in Critical Risk. Immediate inspection is recommended.`
    );
  }

  if (metrics.highRisk > 0) {
    aiRecommendations.push(
      `🔧 ${metrics.highRisk} wagon(s) are in High Risk. Schedule preventive maintenance soon.`
    );
  }

  if (metrics.totalMaintenanceCost > 50000) {
    aiRecommendations.push(
      `💰 Maintenance cost is high at ₹${metrics.totalMaintenanceCost}. Review high-cost wagons to reduce repair expenses.`
    );
  }

  if (maintenancePercentage > 30) {
    aiRecommendations.push(
      `📉 ${maintenancePercentage}% wagons are under maintenance. This may affect operational availability.`
    );
  }

  if (inactivePercentage > 20) {
    aiRecommendations.push(
      `🚫 ${inactivePercentage}% wagons are inactive. Reactivation planning can improve fleet utilization.`
    );
  }

  if (metrics.highestCostRecord) {
    aiRecommendations.push(
      `📌 Wagon ${metrics.highestCostRecord.wagonNumber} has the highest maintenance cost. Prioritize detailed inspection.`
    );
  }

  if (aiRecommendations.length === 0) {
    aiRecommendations.push(
      "✅ Fleet condition looks stable. Continue routine monitoring and scheduled maintenance."
    );
  }

  const smartInsights = [];

  const activeEfficiency =
    metrics.total > 0
      ? ((metrics.active / metrics.total) * 100).toFixed(1)
      : 0;

  if (activeEfficiency < 70) {
    smartInsights.push(
      `📉 Active fleet efficiency is ${activeEfficiency}%. Operational utilization is below optimal level.`
    );
  }

  if (metrics.averageDowntimeDays > 10) {
    smartInsights.push(
      `⏱ Average downtime is ${metrics.averageDowntimeDays} days. Maintenance turnaround needs improvement.`
    );
  }

  if (metrics.totalMaintenanceCost > 100000) {
    smartInsights.push(
      `💰 Maintenance spending crossed ₹${metrics.totalMaintenanceCost}. Cost optimization strategy is recommended.`
    );
  }

  if (metrics.criticalRisk > 0) {
    smartInsights.push(
      `🚨 ${metrics.criticalRisk} wagon(s) are classified as Critical Risk assets.`
    );
  }

  if (
    metrics.fixedWagons.length >
    metrics.maintenanceWagons.length
  ) {
    smartInsights.push(
      `✅ Maintenance recovery performance is healthy with more fixed wagons than active maintenance cases.`
    );
  }

  if (smartInsights.length === 0) {
    smartInsights.push(
      "📊 Fleet operational KPIs are currently stable and within expected limits."
    );
  }

  const mttrChartData = {
    labels: ["Low", "Medium", "High", "Critical"],
    datasets: [
      {
        label: "MTTR Severity",
        data: [
          metrics.lowMTTR,
          metrics.mediumMTTR,
          metrics.highMTTR,
          metrics.criticalMTTR,
        ],
        backgroundColor: ["green", "yellow", "orange", "red"],
      },
    ],
  };

  const maintenanceWagons = metrics.maintenanceWagons;
  const priorityRanking = getMaintenancePriorityRanking(wagons);
  const failurePatterns = detectFailurePatterns(wagons);
  const costForecasts = maintenanceWagons.map((wagon) => ({
    ...wagon,
    forecast: calculateCostForecast(wagon),
  }));

  const totalForecastedCost = costForecasts.reduce(
    (sum, wagon) => sum + wagon.forecast.forecastedCost,
    0
  );

  const avgFutureRepairCost =
    costForecasts.length > 0
      ? Math.round(totalForecastedCost / costForecasts.length)
      : 0;

  const highCostRiskWagons = costForecasts.filter(
    (wagon) => wagon.forecast.costRisk === "High Cost Risk"
  ).length;

  const mostExpensiveForecastWagon = costForecasts.reduce(
    (max, wagon) =>
      wagon.forecast.forecastedCost > (max?.forecast?.forecastedCost || 0)
        ? wagon
        : max,
    null
  );

  const getGroupedData = (key) => {
    const grouped = {};

    metrics.allMaintenanceRecords.forEach((record) => {
      const value = record[key] || "Unknown";
      grouped[value] = (grouped[value] || 0) + 1;
    });

    return grouped;
  };

  const issueData = getGroupedData("issue");

  const issueChartData = {
    labels: Object.keys(issueData),
    datasets: [
      {
        label: "Issue Frequency",
        data: Object.values(issueData),
        backgroundColor: "#9ca3af",
        borderRadius: 8,
      },
    ],
  };

  const topRiskWagons = [...priorityRanking]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  const monthlyCostTrend = {};

  metrics.allMaintenanceRecords.forEach((record) => {
    if (!record.date) return;

    const month = new Date(record.date).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    monthlyCostTrend[month] =
      (monthlyCostTrend[month] || 0) + Number(record.cost || 0);
  });

  const costTrendChartData = {
    labels: Object.keys(monthlyCostTrend),
    datasets: [
      {
        label: "Monthly Maintenance Cost",
        data: Object.values(monthlyCostTrend),
        borderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
      },

      y: {
        beginAtZero: true,
      },
    },
  };

  const slaTrackingData = wagons
    .filter(
      (wagon) =>
        wagon.status === "Maintenance" ||
        wagon.status === "Inactive"
    )
    .map((wagon) => {
      const downtime = calculateDowntimeDays(wagon);

      return {
        wagonNumber: wagon.wagonNumber,
        downtimeDays: downtime,

        ...calculateSLAStatus({
          ...wagon,
          downtimeDays: downtime,
        }),
      };
    });

  const engineerAnalytics = getEngineerAnalytics(wagons);

  const failureProbabilityData = wagons
    .map((wagon) => ({
      wagonNumber: wagon.wagonNumber,
      ...calculateFailureProbability(wagon),
    }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);

  const maintenanceEfficiencyData = wagons
    .filter(
      (wagon) =>
        wagon.status === "Active" ||
        wagon.status === "Available"
    )
    .map((wagon) => ({
      wagonNumber: wagon.wagonNumber,
      ...calculateMaintenanceEfficiency(wagon),
    }))
    .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold">📈 Analytics Dashboard</h1>
      <p className="text-gray-500 text-sm mt-1">
        Analyze fleet performance, maintenance costs, risk, downtime, and repair efficiency.
      </p>
      <div className="flex justify-end">
        <button
          onClick={() => exportAnalyticsSummary(metrics)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold shadow"
        >
          📑 Export Analytics Summary
        </button>
      </div>

      <div className="mb-2">
        <h2 className="text-2xl font-bold text-gray-800">
          📊 Executive KPI Overview
        </h2>

        <p className="text-gray-500 text-sm">
          Key operational and maintenance performance indicators
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

        <div className="bg-blue-100 text-blue-700 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
          <p className="font-semibold text-lg">
            Total Capacity
          </p>

          <h3 className="text-4xl font-bold mt-2">
            {totalCapacity}
          </h3>
        </div>

        <div className="bg-purple-100 text-purple-700 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
          <p className="font-semibold text-lg">
            Average Capacity
          </p>

          <h3 className="text-4xl font-bold mt-2">
            {averageCapacity}
          </h3>
        </div>

        <div className="bg-red-100 text-red-700 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
          <p className="font-semibold text-lg">
            Maintenance %
          </p>

          <h3 className="text-4xl font-bold mt-2">
            {maintenancePercentage}%
          </h3>
        </div>

        <div className="bg-gray-200 text-gray-700 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
          <p className="font-semibold text-lg">
            Inactive %
          </p>

          <h3 className="text-4xl font-bold mt-2">
            {inactivePercentage}%
          </h3>
        </div>

        <div className="bg-emerald-100 text-emerald-700 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
          <p className="font-semibold text-lg">
            Fleet Utilization
          </p>

          <h3 className="text-4xl font-bold mt-2">
            {fleetUtilizationRate}%
          </h3>
        </div>

      </div>

      {/* Executive Business Operations Intelligence */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
          <h2 className="text-xl font-bold text-gray-800 mb-5">
            🏢 Operational Health Status
          </h2>

          <div className={`p-5 rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 ${operationalHealth.style}`}>
            <p className="text-sm font-semibold opacity-80">
              Current Business Status
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {operationalHealth.status}
            </h3>

            <p className="text-sm mt-2">
              {operationalHealth.level}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <div className="bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <p className="text-sm text-gray-500">Maintenance Pressure</p>
              <h3 className="text-2xl font-bold mt-2">{maintenancePercentage}%</h3>
            </div>

            <div className="bg-purple-50 border border-purple-100 text-purple-700 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <p className="text-sm text-gray-500">Average Downtime</p>
              <h3 className="text-2xl font-bold mt-2">{metrics.averageDowntimeDays}d</h3>
            </div>

            <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <p className="text-sm text-gray-500">Critical Risk</p>
              <h3 className="text-2xl font-bold mt-2">{metrics.criticalRisk}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                🚨 Executive Alert Center
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Business-critical operational exceptions requiring attention.
              </p>
            </div>

            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold">
              {executiveAlerts.length} Alert(s)
            </span>
          </div>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
            {executiveAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 ${alert.style}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      {alert.title}
                    </h3>

                    <p className="text-sm mt-1">
                      {alert.message}
                    </p>
                  </div>

                  <span className="text-2xl font-bold">
                    {alert.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Maintenance Priority Ranking */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-6 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            🚨 Maintenance Priority Intelligence
          </h2>

          <span className="text-sm text-gray-500">
            Top 5 High-Risk Wagons
          </span>
        </div>

        {priorityRanking.length === 0 ? (
          <p className="text-gray-500 text-sm">
            ✅ No wagons currently under maintenance.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {priorityRanking.slice(0, 5).map((wagon, index) => (
              <div
                key={wagon._id}
                className="bg-gradient-to-br from-red-50 to-white border border-red-100 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500">
                      PRIORITY #{index + 1}
                    </p>

                    <h3 className="text-xl font-bold text-gray-800 mt-1">
                      {wagon.wagonNumber}
                    </h3>

                    <p className="text-xs uppercase tracking-wide text-gray-500 mt-1">
                      {wagon.type}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityStyle(
                      wagon.priorityLevel
                    )}`}
                  >
                    {wagon.priorityLevel}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Risk</span>
                    <span className="font-bold text-red-600">
                      {wagon.riskScore || wagon.score || 0}/100
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Downtime</span>
                    <span className="font-semibold">
                      {wagon.downtimeDays}d
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Repairs</span>
                    <span className="font-semibold">
                      {wagon.totalRepairs}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cost Forecasting Insights */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <h2 className="text-xl font-bold text-gray-800 mb-5">
          💰 Cost Forecasting Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="bg-green-50 border border-green-100 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="text-sm text-gray-500">Total Forecasted Cost</p>
            <h3 className="text-2xl font-bold text-green-700 mt-2">
              ₹{totalForecastedCost}
            </h3>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="text-sm text-gray-500">Avg Future Repair Cost</p>
            <h3 className="text-2xl font-bold text-blue-700 mt-2">
              ₹{avgFutureRepairCost}
            </h3>
          </div>

          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="text-sm text-gray-500">High Cost Risk Wagons</p>
            <h3 className="text-2xl font-bold text-red-700 mt-2">
              {highCostRiskWagons}
            </h3>
          </div>

          <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="text-sm text-gray-500">Most Expensive Forecast</p>
            <h3 className="text-2xl font-bold text-purple-700 mt-2">
              {mostExpensiveForecastWagon?.wagonNumber || "N/A"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              ₹{mostExpensiveForecastWagon?.forecast?.forecastedCost || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h2 className="text-2xl font-bold text-gray-800">
          💰 Financial Intelligence
        </h2>

        <p className="text-gray-500 text-sm">
          Maintenance cost, repair analytics, and operational cost insights
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <h2 className="text-xl font-bold text-gray-800 mb-5">
          💰 Maintenance & Financial KPIs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="text-sm text-gray-500">
              Total Maintenance Cost
            </p>

            <h3 className="text-2xl font-bold text-red-700 mt-2">
              ₹{metrics.totalMaintenanceCost}
            </h3>
          </div>

          <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="text-sm text-gray-500">
              Average Repair Cost
            </p>

            <h3 className="text-2xl font-bold text-orange-700 mt-2">
              ₹{metrics.averageRepairCost}
            </h3>
          </div>

          <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="text-sm text-gray-500">
              Highest Repair Cost
            </p>

            <h3 className="text-2xl font-bold text-purple-700 mt-2">
              ₹{metrics.highestCostRecord?.cost || 0}
            </h3>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="text-sm text-gray-500">
              Total Repair Records
            </p>

            <h3 className="text-2xl font-bold text-blue-700 mt-2">
              {metrics.allMaintenanceRecords?.length || 0}
            </h3>
          </div>

        </div>
      </div>

      {/* Maintenance Cost Trend Analysis */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <h2 className="text-xl font-bold mb-5 text-gray-800">
          📈 Maintenance Cost Trend Analysis
        </h2>

        <div className="w-full h-80">
          <Line data={costTrendChartData} options={lineChartOptions} />
        </div>
      </div>

      {/* Maintenance Cost Charts */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
          <h2 className="text-xl font-bold mb-5 text-gray-800">
            Maintenance Cost Bar Chart
          </h2>

          <div className="w-full h-80">
            <Bar data={costChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Fixed Wagon cost Charts */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
          <h2 className="text-xl font-bold mb-5 text-gray-800">
            Maintenance Fixed Bar Chart
          </h2>

          <div className="w-full h-80">
            <Bar data={fixedCostChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h2 className="text-2xl font-bold text-gray-800">
          🚆 Wagon Distribution Intelligence
        </h2>

        <p className="text-gray-500 text-sm">
          Wagon type and operational status distribution
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <h2 className="text-xl font-bold mb-5 text-gray-800">
          🚆 Wagon Type Distribution
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-100 text-blue-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">Cargo</p>
            <h3 className="text-3xl font-bold">{cargo}</h3>
          </div>

          <div className="bg-purple-100 text-purple-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">Passenger</p>
            <h3 className="text-3xl font-bold">{passenger}</h3>
          </div>

          <div className="bg-green-100 text-green-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">Container</p>
            <h3 className="text-3xl font-bold">{container}</h3>
          </div>

          <div className="bg-red-100 text-red-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">Oil Tanker</p>
            <h3 className="text-3xl font-bold">{oilTanker}</h3>
          </div>

          <div className="bg-orange-100 text-orange-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">Flatbed</p>
            <h3 className="text-3xl font-bold">{flatbed}</h3>
          </div>
        </div>
      </div>

      {/* wagon type charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-5 text-gray-800">Wagon Type Bar Chart</h2>

          <div className="w-full h-80">
            <Bar data={typeChartData} options={barChartOptions} />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm w-full">
            <p>🔵 Cargo: {cargo}</p>
            <p>🟣 Passenger: {passenger}</p>
            <p>🔴 Oil Tanker: {oilTanker}</p>
            <p>🟢 Container: {container}</p>
            <p>🟠 Flatbed: {flatbed}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-5 text-gray-800">Wagon Type Pie Chart</h2>

          <div className="w-80 h-80">
            <Pie data={typeChartData} options={pieChartOptions} />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm w-full">
            <p>🔵 Cargo: {cargo}</p>
            <p>🟣 Passenger: {passenger}</p>
            <p>🔴 Oil Tanker: {oilTanker}</p>
            <p>🟢 Container: {container}</p>
            <p>🟠 Flatbed: {flatbed}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-5 text-gray-800">Wagon Status Bar Chart</h2>

          <div className="w-full h-80">
            <Bar data={statusChartData} options={barChartOptions} />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm w-full">
            <p>🟢 Active: {metrics.active}</p>
            <p>🟠 Available: {metrics.available}</p>
            <p>🔴 Maintenance: {metrics.maintenance}</p>
            <p>⚫ Inactive: {metrics.inactive}</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h2 className="text-2xl font-bold text-gray-800">
          🚨 Predictive Maintenance Intelligence
        </h2>

        <p className="text-gray-500 text-sm">
          Risk-based maintenance intelligence and failure prediction
        </p>
      </div>

      {/* Top Risk Wagons */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            🚨 Highest Risk Wagons
          </h2>

          <span className="text-sm text-gray-500">
            Top 5 AI-ranked maintenance risk
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-3 text-left">Rank</th>
                <th className="p-3 text-left">Wagon No.</th>
                <th className="p-3 text-left">Risk Score</th>
                <th className="p-3 text-left">Downtime</th>
                <th className="p-3 text-left">Risk Level</th>
              </tr>
            </thead>

            <tbody>
              {topRiskWagons.map((wagon, index) => (
                <tr key={wagon._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-bold">#{index + 1}</td>

                  <td className="p-3 font-semibold">
                    {wagon.wagonNumber}
                  </td>

                  <td className="p-3 font-bold text-red-600">
                    {wagon.riskScore || wagon.score || 0}/100
                  </td>

                  <td className="p-3">
                    {wagon.downtimeDays} days
                  </td>

                  <td className="p-3">
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                      High Priority
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failure Probability Score */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            ⚠ Failure Probability Wagons
          </h2>

          <span className="text-sm text-gray-500">
            Top 5 wagon breakdown analysis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {failureProbabilityData.map((wagon, index) => {
            const color =
              wagon.level === "Critical"
                ? "bg-red-100 text-red-700"
                : wagon.level === "High"
                  ? "bg-orange-100 text-orange-700"
                  : wagon.level === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700";

            return (
              <div
                key={index}
                className={`${color} p-2 rounded-xl`}
              >
                <p className="font-semibold">
                  {wagon.wagonNumber}
                </p>

                <h3 className="text-3xl font-bold">
                  {wagon.probability}%
                </h3>

                <p className="text-sm">
                  {wagon.level}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Maintenance Efficiency Score */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            ⚙ Maintenance Efficiency Score
          </h2>

          <span className="text-sm text-gray-500">
            Top 5 Wagons
            Efficiency
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {maintenanceEfficiencyData.map((wagon, index) => {
            const color =
              wagon.efficiencyLevel === "Excellent"
                ? "bg-green-100 text-green-700"
                : wagon.efficiencyLevel === "Good"
                  ? "bg-blue-100 text-blue-700"
                  : wagon.efficiencyLevel === "Moderate"
                    ? "bg-yellow-100 text-yellow-700"
                    : wagon.efficiencyLevel === "Poor"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-red-100 text-red-700";

            return (
              <div
                key={index}
                className={`${color} p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300`}
              >
                <p className="font-semibold">
                  {wagon.wagonNumber}
                </p>

                <h3 className="text-3xl font-bold">
                  {wagon.efficiencyScore}
                </h3>

                <p className="text-sm">
                  {wagon.efficiencyLevel}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <h2 className="text-xl font-bold mb-5 text-gray-800">
          📈 Predictive Maintenance Risk Score
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-100 text-green-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">Low Risk</p>
            <h3 className="text-3xl font-bold">{metrics.lowRisk}</h3>
          </div>

          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">Medium Risk</p>
            <h3 className="text-3xl font-bold">{metrics.mediumRisk}</h3>
          </div>

          <div className="bg-orange-100 text-orange-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">High Risk</p>
            <h3 className="text-3xl font-bold">{metrics.highRisk}</h3>
          </div>

          <div className="bg-red-100 text-red-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">Critical Risk</p>
            <h3 className="text-3xl font-bold">{metrics.criticalRisk}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-5 text-gray-800">
            Risk Distribution Bar Chart
          </h2>

          <div className="w-full h-80">
            <Bar data={riskChartData} options={barChartOptions} />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm w-full">
            <p>🟢 Low Risk: {metrics.lowRisk}</p>
            <p>🟡 Medium Risk: {metrics.mediumRisk}</p>
            <p>🟠 High Risk: {metrics.highRisk}</p>
            <p>🔴 Critical Risk: {metrics.criticalRisk}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-5 text-gray-800">
            Risk Distribution Pie Chart
          </h2>

          <div className="w-80 h-80">
            <Pie data={riskChartData} options={pieChartOptions} />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm w-full">
            <p>🟢 Low Risk: {metrics.lowRisk}</p>
            <p>🟡 Medium Risk: {metrics.mediumRisk}</p>
            <p>🟠 High Risk: {metrics.highRisk}</p>
            <p>🔴 Critical Risk: {metrics.criticalRisk}</p>
          </div>
        </div>
      </div>



      <div className="pt-4">
        <h2 className="text-2xl font-bold text-gray-800">
          🛠 Maintenance Operations Intelligence
        </h2>

        <p className="text-gray-500 text-sm">
          Downtime, MTTR, and maintenance efficiency tracking
        </p>
      </div>

      {/* Issue Frequency Charts */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
          <h2 className="text-xl font-bold mb-5 text-gray-800">
            Issue Frequency Bar Chart
          </h2>

          <div className="w-full h-80">
            <Bar data={issueChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Engineer Performance Intelligence */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            👨‍🔧 Engineer Performance Intelligence
          </h2>

          <span className="text-sm text-gray-500">
            Workforce maintenance analytics
          </span>
        </div>

        <div className="max-h-[450px] overflow-y-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left">Engineer</th>
                <th className="p-3 text-left">Repairs</th>
                <th className="p-3 text-left">Total Cost</th>
                <th className="p-3 text-left">Average Cost</th>
              </tr>
            </thead>

            <tbody>
              {engineerAnalytics.map((engineer, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3 font-semibold">
                    {engineer.engineer}
                  </td>

                  <td className="p-3">
                    {engineer.repairs}
                  </td>

                  <td className="p-3 text-red-600 font-semibold">
                    ₹{engineer.totalCost}
                  </td>

                  <td className="p-3 text-blue-600 font-semibold">
                    ₹{engineer.averageCost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance SLA Tracking */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            📋 Maintenance SLA Tracking
          </h2>

          <span className="text-sm text-gray-500">
            Service-level maintenance monitoring
          </span>
        </div>

        <div className="max-h-[500px] overflow-y-auto rounded-xl border border-gray-200">          <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white sticky top-0 z-10">            <tr>
            <th className="p-3 text-left">Wagon</th>
            <th className="p-3 text-left">Downtime</th>
            <th className="p-3 text-left">SLA Status</th>
          </tr>
          </thead>

          <tbody>
            {slaTrackingData.map((wagon, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold">
                  {wagon.wagonNumber}
                </td>

                <td className="p-3">
                  {wagon.downtimeDays} days
                </td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${wagon.color}`}
                  >
                    {wagon.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>


      {/* Downtime Analytics */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <h2 className="text-xl font-bold mb-5 text-gray-800">
          ⏱ Downtime Analytics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-100 text-red-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">Total Downtime Days</p>
            <h3 className="text-3xl font-bold">
              {metrics.totalDowntimeDays}
            </h3>
          </div>

          <div className="bg-orange-100 text-orange-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">Average Downtime</p>
            <h3 className="text-3xl font-bold">
              {metrics.averageDowntimeDays} days
            </h3>
          </div>

          <div className="bg-purple-100 text-purple-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">Longest Downtime Wagon</p>
            <h3 className="text-2xl font-bold">
              {metrics.longestDowntimeWagon
                ? metrics.longestDowntimeWagon.wagonNumber
                : "N/A"}
            </h3>
          </div>
        </div>
      </div>

      {/* Downtime Severity Charts */}
      <div className="grid grid-cols-1 gap-6 items-start">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-5 text-gray-800">
            Downtime Severity Bar Chart
          </h2>

          <div className="w-full h-80">
            <Bar data={downtimeChartData} options={barChartOptions} />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm w-full">
            <p>🟢 Low: {downtimeLevelCount.Low}</p>
            <p>🟡 Medium: {downtimeLevelCount.Medium}</p>
            <p>🟠 High: {downtimeLevelCount.High}</p>
            <p>🔴 Critical: {downtimeLevelCount.Critical}</p>
          </div>
        </div>
      </div>

      {/* MTTR Analytics */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <h2 className="text-xl font-bold mb-5 text-gray-800">
          🧰 MTTR Analytics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-100 text-blue-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">Average MTTR</p>
            <h3 className="text-3xl font-bold">
              {metrics.averageMTTR} days
            </h3>
          </div>

          <div className="bg-green-100 text-green-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">Fastest Repair Wagon</p>
            <h3 className="text-2xl font-bold">
              {metrics.fastestRepairWagon
                ? metrics.fastestRepairWagon.wagonNumber
                : "N/A"}
            </h3>
          </div>

          <div className="bg-red-100 text-red-700 p-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <p className="font-semibold">Slowest Repair Wagon</p>
            <h3 className="text-2xl font-bold">
              {metrics.slowestRepairWagon
                ? metrics.slowestRepairWagon.wagonNumber
                : "N/A"}
            </h3>
          </div>
        </div>
      </div>

      {/* MTTR Severity Charts */}
      <div className="grid grid-cols-1 gap-6 items-start">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-5 text-gray-800">
            MTTR Severity Bar Chart
          </h2>

          <div className="w-full h-80">
            <Bar data={mttrChartData} options={barChartOptions} />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm w-full">
            <p>🟢 Low: {metrics.lowMTTR}</p>
            <p>🟡 Medium: {metrics.mediumMTTR}</p>
            <p>🟠 High: {metrics.highMTTR}</p>
            <p>🔴 Critical: {metrics.criticalMTTR}</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h2 className="text-2xl font-bold text-gray-800">
          🧠 AI & Smart Insights
        </h2>

        <p className="text-gray-500 text-sm">
          Automated operational recommendations and KPI intelligence
        </p>
      </div>


      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-start mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              🤖 Predictive Maintenance Recommendations
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              AI-driven wagon maintenance recommendations based on risk score,
              repair history, downtime, and maintenance cost analysis.
            </p>
          </div>

          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold">
            {recommendations.length} Recommendations
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            ✅ No high-priority maintenance recommendations currently detected.
          </div>
        ) : (
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
            {recommendations.map((wagon) => (
              <div
                key={wagon._id}
                className="border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >
                <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {wagon.wagonNumber} — {wagon.type}
                    </h3>

                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                      {wagon.reason}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-4 text-xs">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">
                        Risk Score: {wagon.riskScore}/100
                      </span>

                      <span className="bg-gray-100 px-3 py-1 rounded-full">
                        Repairs: {wagon.totalRepairs}
                      </span>

                      <span className="bg-gray-100 px-3 py-1 rounded-full">
                        Cost: ₹{wagon.totalCost}
                      </span>

                      <span className="bg-gray-100 px-3 py-1 rounded-full">
                        Status: {wagon.status}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-xs font-semibold ${getRecommendationStyle(
                      wagon.priority
                    )}`}
                  >
                    {wagon.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <h2 className="text-xl font-bold mb-5 text-gray-800">
          🔎 Failure Pattern Detection
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {failurePatterns.map((pattern, index) => (
            <div
              key={index}
              className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm font-medium shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
            >
              {pattern}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
        <h2 className="text-xl font-bold mb-5 text-gray-800">
          🤖 AI Operational Recommendations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiRecommendations.map((recommendation, index) => (
            <div
              key={index}
              className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-sm font-medium shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
            >
              {recommendation}
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

export default Analytics;