function FixedWagonDetailsModal({ selectedFixedWagon, setSelectedFixedWagon }) {
  if (!selectedFixedWagon) return null;

  const history = selectedFixedWagon.maintenanceHistory || [];

  const totalCost = history.reduce(
    (sum, record) => sum + Number(record.cost || 0),
    0
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[850px] p-6 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold">
            Wagon History - {selectedFixedWagon.wagonNumber}
          </h2>

          <button
            onClick={() => setSelectedFixedWagon(null)}
            className="text-red-500 text-xl"
          >
            ✖
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-gray-500">No maintenance history available.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Engineer</th>
                <th className="p-3">Issue</th>
                <th className="p-3">Cost</th>
                <th className="p-3">Remarks</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item, index) => (
                <tr key={index} className="text-center border-t">
                  <td className="p-3">
                    {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="p-3">{item.engineer}</td>
                  <td className="p-3">{item.issue}</td>
                  <td className="p-3">₹{item.cost}</td>
                  <td className="p-3">{item.remarks || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default FixedWagonDetailsModal;