import {
  calculateRiskScore,
  getRiskLevel,
  getRiskStyle,
} from "../utils/riskScore";

function WagonTable({
  wagons,
  setSelectedWagon,
  setSelectedDelete,
  setSelectedDetailsWagon,
}) {
  return (
    <div className="max-h-[600px] overflow-y-auto rounded-xl border border-gray-200">
      <table className="w-full bg-white text-sm">
        <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white sticky top-0 z-10">
          <tr>
            <th className="p-3 text-center font-semibold tracking-wide text-xs uppercase">
              Wagon No.
            </th>
            <th className="p-3 text-center font-semibold tracking-wide text-xs uppercase">
              Type
            </th>
            <th className="p-3 text-center font-semibold tracking-wide text-xs uppercase">
              Capacity
            </th>
            <th className="p-3 text-center font-semibold tracking-wide text-xs uppercase">
              Location
            </th>
            <th className="p-3 text-center font-semibold tracking-wide text-xs uppercase">
              Assigned Route
            </th>
            <th className="p-3 text-center font-semibold tracking-wide text-xs uppercase">
              Last Maintenance
            </th>
            <th className="p-3 text-center font-semibold tracking-wide text-xs uppercase">
              Status
            </th>
            <th className="p-3 text-center font-semibold tracking-wide text-xs uppercase">
              Next Maintenance
            </th>
            <th className="p-3 text-center font-semibold tracking-wide text-xs uppercase">
              Risk Score
            </th>
            <th className="p-3 text-center font-semibold tracking-wide text-xs uppercase">
              Risk Level
            </th>
            <th className="p-3 text-center font-semibold tracking-wide text-xs uppercase">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {wagons.length === 0 ? (
            <tr>
              <td colSpan="11" className="p-6 text-center text-gray-500">
                📭 No wagon records found
              </td>
            </tr>
          ) : (
            wagons.map((wagon, index) => {
              const riskScore = calculateRiskScore(wagon);
              const riskLevel = getRiskLevel(riskScore);
              const riskStyle = getRiskStyle(riskLevel);

              return (
                <tr
                  key={wagon._id}
                  className={`text-center border-t hover:bg-blue-50 transition duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3 font-semibold">
                    {wagon.wagonNumber}
                  </td>

                  <td className="p-3 uppercase">
                    {wagon.type}
                  </td>

                  <td className="p-3">
                    {wagon.capacity}
                  </td>

                  <td className="p-3 uppercase">
                    {wagon.currentLocation}
                  </td>

                  <td className="p-3 uppercase">
                    {wagon.assignedRoute}
                  </td>

                  <td className="p-3">
                    {wagon.lastMaintenanceDate
                      ? new Date(wagon.lastMaintenanceDate).toLocaleDateString()
                      : "N/A"}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        wagon.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : wagon.status === "Available"
                          ? "bg-blue-100 text-blue-700"
                          : wagon.status === "Maintenance"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      <span className="uppercase">
                        {wagon.status}
                      </span>
                    </span>
                  </td>

                  <td className="p-3">
                    {wagon.nextMaintenanceDate
                      ? new Date(wagon.nextMaintenanceDate).toLocaleDateString()
                      : "N/A"}
                  </td>

                  <td className="p-3 font-bold">
                    {riskScore}/100
                  </td>

                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${riskStyle}`}>
                      {riskLevel}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedDetailsWagon(wagon)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => setSelectedWagon(wagon)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold text-xs transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setSelectedDelete(wagon)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold text-xs transition"
                      >
                        Delete
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
  );
}

export default WagonTable;
