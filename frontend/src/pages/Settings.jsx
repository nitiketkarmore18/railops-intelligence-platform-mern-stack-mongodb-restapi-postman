function Settings() {
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold">⚙ Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage administrator profile, system preferences, and platform information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-xl font-bold mb-5 text-gray-800">
            👤 Admin Profile
          </h2>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
              👤
            </div>

            <div>
              <h3 className="text-lg font-semibold">Admin</h3>
              <p className="text-gray-500 text-sm">System Administrator</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            This admin account manages wagon records, maintenance workflows,
            analytics dashboards, reports, and operational activity monitoring.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-xl font-bold mb-5 text-gray-800">
            🖥 System Information
          </h2>

          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>Application:</strong> RailOps Intelligence Platform</p>
            <p><strong>Version:</strong> 1.0</p>
            <p><strong>Frontend:</strong> React + Tailwind CSS</p>
            <p><strong>Backend:</strong> Node.js + Express.js</p>
            <p><strong>Database:</strong> MongoDB</p>
            <p><strong>Core Module:</strong> Wagon Operations & Predictive Maintenance</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-xl font-bold mb-5 text-gray-800">
            🎛 Preferences
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Theme Mode
              </label>

              <select className="border border-gray-300 bg-white text-black p-2 rounded-lg w-full">
                <option>Light Mode</option>
                <option>Dark Mode Coming Soon</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Notification Preference
              </label>

              <select className="border border-gray-300 bg-white text-black p-2 rounded-lg w-full">
                <option>Enable Toast Notifications</option>
                <option>Disable Notifications Coming Soon</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-red-100">
          <h2 className="text-xl font-bold mb-5 text-gray-800">
            🔐 Security
          </h2>

          <p className="text-sm text-gray-600 mb-5">
            Securely end the current administrator session and return to the login screen.
          </p>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700 font-semibold shadow-md transition"
          >
            Logout
          </button>
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

export default Settings;