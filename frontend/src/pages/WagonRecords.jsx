import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket";
import toast from "react-hot-toast";
import WagonDetailsModal from "../components/WagonDetailsModal";
import WagonTable from "../components/WagonTable";
import EditWagonModal from "../components/EditWagonModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import AddWagonModal from "../components/AddWagonModal";

function WagonRecords() {
  const [wagons, setWagons] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [selectedDetailsWagon, setSelectedDetailsWagon] = useState(null);
  const [selectedWagon, setSelectedWagon] = useState(null);
  const [selectedDelete, setSelectedDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

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

  const addActivity = (message) => {
    const savedActivities =
      JSON.parse(localStorage.getItem("activities")) || [];

    const newActivity = {
      message,
      time: new Date().toLocaleString(),
    };

    const updatedActivities = [newActivity, ...savedActivities];

    localStorage.setItem("activities", JSON.stringify(updatedActivities));
  };

  const filteredWagons = wagons.filter((wagon) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      wagon.wagonNumber?.toLowerCase().includes(searchValue) ||
      wagon.type?.toLowerCase().includes(searchValue) ||
      wagon.currentLocation?.toLowerCase().includes(searchValue) ||
      wagon.assignedRoute?.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "" || wagon.status === statusFilter;

    const matchesType =
      typeFilter === "" || wagon.type === typeFilter;

    const matchesRoute =
      routeFilter === "" || wagon.assignedRoute === routeFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesRoute
    );
  });

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/wagons/${selectedDelete._id}`
      );

      setWagons(
        wagons.filter((w) => w._id !== selectedDelete._id)
      );

      toast.success("Wagon Deleted Successfully");

      addActivity(
        `🗑 Deleted Wagon ${selectedDelete.wagonNumber}`
      );

      setSelectedDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to Delete Wagon");
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const loadingToast = toast.loading("Uploading CSV...");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/upload/csv",
        formData
      );

      const updated = await axios.get(
        "http://localhost:5000/api/wagons"
      );

      setWagons(updated.data);

      toast.dismiss(loadingToast);
      toast.success(`${res.data.inserted} wagons uploaded successfully`);

      addActivity(`📤 Uploaded ${res.data.inserted} wagons using CSV`);
    } catch (err) {
      console.error(err);

      toast.dismiss(loadingToast);
      toast.error("CSV upload failed");
    }
  };

  const exportToCSV = () => {
    if (wagons.length === 0) {
      toast.error("No wagon data available to export");
      return;
    }

    const headers = [
      "Wagon Number",
      "Type",
      "Capacity",
      "Status",
      "Current Location",
      "Assigned Route",
      "Last Maintenance Date",
      "Next Maintenance Date",
    ];

    const rows = wagons.map((wagon) => [
      wagon.wagonNumber,
      wagon.type,
      wagon.capacity,
      wagon.status,
      wagon.currentLocation,
      wagon.assignedRoute,
      wagon.lastMaintenanceDate
        ? new Date(
          wagon.lastMaintenanceDate
        ).toLocaleDateString()
        : "N/A",
      wagon.nextMaintenanceDate
        ? new Date(
          wagon.nextMaintenanceDate
        ).toLocaleDateString()
        : "N/A",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${value}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "wagon-records.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV Report Downloaded");
  };

  const uniqueRoutes = [
    ...new Set(wagons.map((wagon) => wagon.assignedRoute)),
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center w-full">
        <div>
          <h1 className="text-3xl font-bold">
            🚆 Wagon Records
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Manage wagon inventory, upload bulk records, and monitor fleet details.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold transition"
          >
            Add New Wagon
          </button>

          <label className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-semibold cursor-pointer transition">
            Upload CSV

            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </label>

          <button
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold transition"
            onClick={exportToCSV}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Advanced Search & Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-4">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            🔎 Search & Filters
          </h2>

          <p className="text-sm text-gray-500">
            Quickly search and filter wagon records by type, status, route, or location.
          </p>
        </div>
        <input
          className="border border-gray-200 p-4 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          placeholder="Search by Wagon Number, Type, Location, Route..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <select
            className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Available">Available</option>
            <option value="Maintenance">
              Maintenance
            </option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
          >
            <option value="">All Types</option>
            <option value="Cargo">Cargo</option>
            <option value="Passenger">Passenger</option>
            <option value="Oil Tanker">
              Oil Tanker
            </option>
            <option value="Container">Container</option>
            <option value="Flatbed">Flatbed</option>
          </select>

          <select
            className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={routeFilter}
            onChange={(e) =>
              setRouteFilter(e.target.value)
            }
          >
            <option value="">All Routes</option>

            {uniqueRoutes.map((route, index) => (
              <option key={index} value={route}>
                {route}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">
          📋 WAGON TABLE
        </h2>

        <p className="text-sm text-gray-500">
          Showing {filteredWagons.length} wagon records
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <WagonTable
          wagons={filteredWagons}
          setWagons={setWagons}
          setSelectedWagon={setSelectedWagon}
          setSelectedDelete={setSelectedDelete}
          setSelectedDetailsWagon={setSelectedDetailsWagon}
        />
      </div>

      <WagonDetailsModal
        selectedDetailsWagon={selectedDetailsWagon}
        setSelectedDetailsWagon={setSelectedDetailsWagon}
      />

      <EditWagonModal
        selectedWagon={selectedWagon}
        setSelectedWagon={setSelectedWagon}
        wagons={wagons}
        setWagons={setWagons}
        addActivity={addActivity}
      />

      <DeleteConfirmModal
        selectedDelete={selectedDelete}
        setSelectedDelete={setSelectedDelete}
        confirmDelete={confirmDelete}
      />

      <AddWagonModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        wagons={wagons}
        setWagons={setWagons}
        addActivity={addActivity}
      />

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
export default WagonRecords;