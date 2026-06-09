import {
    calculatePredictiveMaintenance,
} from "../utils/predictiveMaintenanceUtils";

import {
    calculateFailureProbability,
} from "../utils/failureProbabilityUtils";

import {
    calculateMaintenanceEfficiency,
} from "../utils/maintenanceEfficiencyUtils";

import {
    calculateDowntimeDays,
    getDowntimeLevel,
    getDowntimeStyle,
} from "../utils/downtimeUtils";

function WagonDetailsModal({
    selectedDetailsWagon,
    setSelectedDetailsWagon,
}) {
    if (!selectedDetailsWagon) return null;

    const wagon = selectedDetailsWagon;

    const predictive =
        calculatePredictiveMaintenance(wagon);

    const failure =
        calculateFailureProbability(wagon);

    const efficiency =
        calculateMaintenanceEfficiency(wagon);

    const downtimeDays =
        calculateDowntimeDays(wagon);

    const downtimeLevel =
        getDowntimeLevel(downtimeDays);

    const downtimeStyle =
        getDowntimeStyle(downtimeLevel);

    const totalCost = (
        wagon.maintenanceHistory || []
    ).reduce(
        (sum, record) =>
            sum + Number(record.cost || 0),
        0
    );

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
            <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">

                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            🚆 Wagon Detailed Profile
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Complete operational intelligence and maintenance history
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            setSelectedDetailsWagon(null)
                        }
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition"
                    >
                        Close
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Main Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <p className="text-sm text-gray-500">
                                Wagon Number
                            </p>

                            <h3 className="text-2xl font-bold text-blue-700 mt-2">
                                {wagon.wagonNumber}
                            </h3>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                            <p className="text-sm text-gray-500">
                                Wagon Type
                            </p>

                            <h3 className="text-2xl font-bold text-purple-700 mt-2">
                                {wagon.type}
                            </h3>
                        </div>

                        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                            <p className="text-sm text-gray-500">
                                Capacity
                            </p>

                            <h3 className="text-2xl font-bold text-green-700 mt-2">
                                {wagon.capacity}
                            </h3>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                            <p className="text-sm text-gray-500">
                                Status
                            </p>

                            <h3 className="text-2xl font-bold text-orange-700 mt-2">
                                {wagon.status}
                            </h3>
                        </div>
                    </div>

                    {/* Location & Route */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="bg-white border p-5 rounded-2xl">
                            <h3 className="font-bold text-lg mb-3">
                                📍 Operational Information
                            </h3>

                            <div className="space-y-3 text-sm">
                                <p>
                                    <span className="font-semibold">
                                        Current Location:
                                    </span>{" "}
                                    {wagon.currentLocation}
                                </p>

                                <p>
                                    <span className="font-semibold">
                                        Assigned Route:
                                    </span>{" "}
                                    {wagon.assignedRoute}
                                </p>

                                <p>
                                    <span className="font-semibold">
                                        Last Maintenance:
                                    </span>{" "}
                                    {wagon.lastMaintenanceDate
                                        ? new Date(
                                            wagon.lastMaintenanceDate
                                        ).toLocaleDateString()
                                        : "N/A"}
                                </p>

                                <p>
                                    <span className="font-semibold">
                                        Next Maintenance:
                                    </span>{" "}
                                    {wagon.nextMaintenanceDate
                                        ? new Date(
                                            wagon.nextMaintenanceDate
                                        ).toLocaleDateString()
                                        : "N/A"}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border p-5 rounded-2xl">
                            <h3 className="font-bold text-lg mb-3">
                                📊 Operational Intelligence
                            </h3>

                            <div className="space-y-3 text-sm">

                                <p>
                                    <span className="font-semibold">
                                        Predictive Risk:
                                    </span>{" "}
                                    {predictive.riskLevel}
                                </p>

                                <p>
                                    <span className="font-semibold">
                                        Failure Probability:
                                    </span>{" "}
                                    {failure.probability}%
                                </p>

                                <p>
                                    <span className="font-semibold">
                                        Maintenance Efficiency:
                                    </span>{" "}
                                    {efficiency.efficiencyScore}/100
                                </p>

                                <p>
                                    <span className="font-semibold">
                                        Downtime:
                                    </span>{" "}
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${downtimeStyle}`}
                                    >
                                        {downtimeDays} Days • {downtimeLevel}
                                    </span>
                                </p>

                            </div>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                            <p className="text-sm text-gray-500">
                                Total Maintenance Cost
                            </p>

                            <h3 className="text-3xl font-bold text-red-700 mt-2">
                                ₹{totalCost}
                            </h3>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
                            <p className="text-sm text-gray-500">
                                Total Repairs
                            </p>

                            <h3 className="text-3xl font-bold text-yellow-700 mt-2">
                                {(wagon.maintenanceHistory || []).length}
                            </h3>
                        </div>

                        <div className="bg-cyan-50 p-4 rounded-2xl border border-cyan-100">
                            <p className="text-sm text-gray-500">
                                Failure Probability
                            </p>

                            <h3 className="text-3xl font-bold text-cyan-700 mt-2">
                                {failure.probability}%
                            </h3>
                        </div>

                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                            <p className="text-sm text-gray-500">
                                Efficiency Score
                            </p>

                            <h3 className="text-3xl font-bold text-emerald-700 mt-2">
                                {efficiency.efficiencyScore}
                            </h3>
                        </div>
                    </div>

                    {/* Maintenance Timeline */}
                    <div className="bg-white border rounded-2xl overflow-hidden">
                        <div className="p-5 border-b">
                            <h2 className="text-xl font-bold">
                                🕒 Maintenance Timeline
                            </h2>
                        </div>

                        <div className="p-5 space-y-4">
                            {(wagon.maintenanceHistory || []).length === 0 ? (
                                <p className="text-gray-500 text-sm">
                                    No timeline records available.
                                </p>
                            ) : (
                                (wagon.maintenanceHistory || []).map((record, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="w-3 h-3 bg-indigo-600 rounded-full mt-2"></div>

                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full">
                                            <h3 className="font-bold text-gray-800">
                                                {record.issue || "Maintenance Record"}
                                            </h3>

                                            <p className="text-sm text-gray-500 mt-1">
                                                Engineer: {record.engineer || "N/A"} | Cost: ₹{record.cost || 0}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-2">
                                                {record.date
                                                    ? new Date(record.date).toLocaleDateString()
                                                    : "No Date"}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Maintenance History */}
                    <div className="bg-white border rounded-2xl overflow-hidden">
                        <div className="p-5 border-b">
                            <h2 className="text-xl font-bold">
                                🛠 Maintenance History
                            </h2>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            <table className="w-full text-sm">

                                <thead className="bg-gray-900 text-white sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 text-left">
                                            Date
                                        </th>

                                        <th className="p-3 text-left">
                                            Issue
                                        </th>

                                        <th className="p-3 text-left">
                                            Engineer
                                        </th>

                                        <th className="p-3 text-left">
                                            Cost
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {(wagon.maintenanceHistory || [])
                                        .length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="p-6 text-center text-gray-500"
                                            >
                                                No maintenance records available
                                            </td>
                                        </tr>
                                    ) : (
                                        wagon.maintenanceHistory.map(
                                            (record, index) => (
                                                <tr
                                                    key={index}
                                                    className="border-t hover:bg-gray-50"
                                                >
                                                    <td className="p-3">
                                                        {record.date
                                                            ? new Date(
                                                                record.date
                                                            ).toLocaleDateString()
                                                            : "N/A"}
                                                    </td>

                                                    <td className="p-3">
                                                        {record.issue}
                                                    </td>

                                                    <td className="p-3">
                                                        {record.engineer}
                                                    </td>

                                                    <td className="p-3 font-semibold text-green-700">
                                                        ₹{record.cost}
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>

                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default WagonDetailsModal;