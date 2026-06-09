import { useEffect, useState } from "react";

function RecentActivities() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const savedActivities =
      JSON.parse(localStorage.getItem("activities")) || [];

    setActivities(savedActivities);
  }, []);

  const clearActivities = () => {
    localStorage.removeItem("activities");
    setActivities([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📝 Recent Activities</h1>

        <button
          onClick={clearActivities}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Clear Logs
        </button>
      </div>

      <div className="bg-white p-5 rounded-xl shadow">
        {activities.length === 0 ? (
          <p className="text-gray-500">No activity logs available.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-600 bg-gray-50 p-4 rounded"
              >
                <p className="font-medium">{activity.message}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            ))}
          </div>
        )}
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

export default RecentActivities;