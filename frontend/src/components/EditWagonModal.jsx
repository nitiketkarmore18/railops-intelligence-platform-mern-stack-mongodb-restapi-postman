import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function EditWagonModal({
  selectedWagon,
  setSelectedWagon,
  wagons,
  setWagons,
  addActivity,
}) {
  const [formData, setFormData] = useState({
    wagonNumber: "",
    type: "",
    capacity: "",
    status: "",
    currentLocation: "",
    assignedRoute: "",
  });

  useEffect(() => {
    if (selectedWagon) {
      setFormData(selectedWagon);
    }
  }, [selectedWagon]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Updating Wagon...");

    try {
      await axios.put(
        `http://localhost:5000/api/wagons/${selectedWagon._id}`,
        formData
      );

      setWagons(
        wagons.map((wagon) =>
          wagon._id === selectedWagon._id
            ? { ...wagon, ...formData }
            : wagon
        )
      );

      toast.dismiss(loadingToast);
      toast.success("Wagon Updated Successfully");

      addActivity(`✏️ Updated Wagon ${formData.wagonNumber}`);

      setSelectedWagon(null);
    } catch (err) {
      console.error(err);

      toast.dismiss(loadingToast);
      toast.error("Failed to Update Wagon");
    }
  };

  if (!selectedWagon) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white p-8 rounded-xl shadow-xl w-[600px]">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Edit Wagon 🚆
          </h2>

          <button
            className="text-red-500 text-xl"
            onClick={() => setSelectedWagon(null)}
          >
            ✖
          </button>
        </div>

        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-2 gap-4"
        >

          <input
            type="text"
            name="wagonNumber"
            value={formData.wagonNumber}
            onChange={handleChange}
            placeholder="Wagon Number"
            className="border p-3 rounded"
          />

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="border p-3 rounded"
          >
            <option value="Cargo">Cargo</option>
            <option value="Passenger">Passenger</option>
            <option value="Oil Tanker">Oil Tanker</option>
            <option value="Container">Container</option>
            <option value="Flatbed">Flatbed</option>
          </select>

          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Capacity"
            className="border p-3 rounded"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border p-3 rounded"
          >
            <option value="Available">Available</option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>

          <input
            type="text"
            name="currentLocation"
            value={formData.currentLocation}
            onChange={handleChange}
            placeholder="Current Location"
            className="border p-3 rounded"
          />

          <input
            type="text"
            name="assignedRoute"
            value={formData.assignedRoute}
            onChange={handleChange}
            placeholder="Assigned Route"
            className="border p-3 rounded"
          />

          <button
            className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
          >
            Save Changes
          </button>

        </form>
      </div>
    </div>
  );
}

export default EditWagonModal;