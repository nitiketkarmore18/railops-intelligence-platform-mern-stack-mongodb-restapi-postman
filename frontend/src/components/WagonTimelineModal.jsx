function WagonTimelineModal({ selectedTimelineWagon, setSelectedTimelineWagon }) {
  if (!selectedTimelineWagon) return null;

  const wagon = selectedTimelineWagon;

  const timelineEvents = [];

  if (wagon.createdAt) {
    timelineEvents.push({
      title: "Wagon Record Created",
      date: wagon.createdAt,
      icon: "🚆",
      color: "bg-blue-100 text-blue-700",
    });
  }

  if (wagon.lastMaintenanceDate) {
    timelineEvents.push({
      title: "Last Maintenance Completed",
      date: wagon.lastMaintenanceDate,
      icon: "🛠",
      color: "bg-green-100 text-green-700",
    });
  }

  if (wagon.nextMaintenanceDate) {
    timelineEvents.push({
      title: "Next Maintenance Scheduled",
      date: wagon.nextMaintenanceDate,
      icon: "📅",
      color: "bg-yellow-100 text-yellow-700",
    });
  }

  if (wagon.status === "Under Maintenance" || wagon.status === "Maintenance") {
    timelineEvents.push({
      title: "Currently Under Maintenance",
      date: new Date(),
      icon: "⚠️",
      color: "bg-red-100 text-red-700",
    });
  }

  if (wagon.status === "Available" || wagon.status === "Active") {
    timelineEvents.push({
      title: "Available for Operation",
      date: new Date(),
      icon: "✅",
      color: "bg-emerald-100 text-emerald-700",
    });
  }

  (wagon.maintenanceHistory || []).forEach((record) => {
    timelineEvents.push({
      title: record.issue || "Maintenance Record Added",
      date: record.date || wagon.lastMaintenanceDate || new Date(),
      icon: "🔧",
      color: "bg-purple-100 text-purple-700",
      description: `Engineer: ${record.engineer || "N/A"} | Cost: ₹${
        record.cost || 0
      }`,
    });
  });

  const sortedTimeline = timelineEvents.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              🕒 Maintenance Timeline
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Wagon {wagon.wagonNumber} lifecycle and maintenance history
            </p>
          </div>

          <button
            onClick={() => setSelectedTimelineWagon(null)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-semibold"
          >
            ✕
          </button>
        </div>

        {sortedTimeline.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 text-gray-500 p-5 rounded-xl text-center">
            No timeline records available for this wagon.
          </div>
        ) : (
          <div className="relative border-l-4 border-gray-200 ml-4 space-y-6">
            {sortedTimeline.map((event, index) => (
              <div key={index} className="relative pl-8">
                <div className="absolute -left-[18px] top-0 w-8 h-8 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center">
                  <span className="text-sm">{event.icon}</span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {event.description}
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${event.color}`}
                    >
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WagonTimelineModal;