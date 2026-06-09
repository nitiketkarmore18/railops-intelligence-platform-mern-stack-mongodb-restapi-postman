import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AddWagon() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    wagonNumber: "",
    type: "",
    capacity: "",
    status: "Available",
    currentLocation: "",
    assignedRoute: "",
    lastMaintenanceDate: "",
    nextMaintenanceDate: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/wagons", {
        ...formData,
        capacity: Number(formData.capacity),
      });

      toast.success("Wagon Added Successfully");
      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to Add Wagon");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Add New Wagon 🚆</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="wagonNumber"
          placeholder="Wagon Number"
          className="border p-3 rounded"
          value={formData.wagonNumber}
          onChange={handleChange}
          required
        />

        <select
          name="type"
          className="border p-3 rounded"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="">Select Type</option>
          <option value="Cargo">Cargo</option>
          <option value="Passenger">Passenger</option>
          <option value="Oil Tanker">Oil Tanker</option>
          <option value="Container">Container</option>
          <option value="Flatbed">Flatbed</option>
        </select>

        <input
          type="number"
          name="capacity"
          placeholder="Capacity"
          className="border p-3 rounded"
          value={formData.capacity}
          onChange={handleChange}
          required
        />

        <select
          name="status"
          className="border p-3 rounded"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Available">Available</option>
          <option value="Active">Active</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Inactive">Inactive</option>
        </select>

        <input
          type="text"
          name="currentLocation"
          placeholder="Current Location"
          className="border p-3 rounded"
          value={formData.currentLocation}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="assignedRoute"
          placeholder="Assigned Route"
          className="border p-3 rounded"
          value={formData.assignedRoute}
          onChange={handleChange}
          required
        />

        <div>
          <label className="text-sm text-gray-600">Last Maintenance</label>
          <input
            type="date"
            name="lastMaintenanceDate"
            className="border p-3 rounded w-full"
            value={formData.lastMaintenanceDate}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Next Maintenance</label>
          <input
            type="date"
            name="nextMaintenanceDate"
            className="border p-3 rounded w-full"
            value={formData.nextMaintenanceDate}
            onChange={handleChange}
          />
        </div>

        <button className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition">
          Add Wagon
        </button>
      </form>
    </div>
  );
}

export default AddWagon;