function ActivityLog({ activities }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Recent Activities</h2>

      {activities.length === 0 ? (
        <p className="text-gray-500">No recent activity</p>
      ) : (
        <ul className="space-y-3">
          {activities.map((activity, index) => (
            <li key={index} className="border-b pb-2 text-sm">
              <p>{activity.message}</p>
              <span className="text-gray-400">{activity.time}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ActivityLog;