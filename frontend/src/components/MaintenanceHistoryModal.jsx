import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function MaintenanceHistoryModal({ selectedWagon, setSelectedWagon }) {
  const [formData, setFormData] = useState({
    issue: "",
    engineer: "",
    cost: "",
    remarks: "",
  });

  if (!selectedWagon) return null;

  const history = selectedWagon.maintenanceHistory || [];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Saving Maintenance Record...");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/wagons/${selectedWagon._id}/maintenance-history`,
        {
          ...formData,
          cost: Number(formData.cost),
        }
      );

      setSelectedWagon(res.data);

      toast.dismiss(loadingToast);
      toast.success("Maintenance Record Added Successfully");

      setFormData({
        issue: "",
        engineer: "",
        cost: "",
        remarks: "",
      });

      window.location.reload();
    } catch (err) {
      console.error(err);

      toast.dismiss(loadingToast);
      toast.error("Failed to Add Maintenance Record");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[850px] p-6 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold">
            Add Record - {selectedWagon.wagonNumber}
          </h2>

          <button
            onClick={() => setSelectedWagon(null)}
            className="text-red-500 text-xl"
          >
            ✖
          </button>
        </div>

        <form
          onSubmit={handleAddRecord}
          className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl mb-6"
        >
          <input
            name="issue"
            placeholder="Issue"
            className="border p-3 rounded"
            value={formData.issue}
            onChange={handleChange}
            required
          />

          <input
            name="engineer"
            placeholder="Engineer Name"
            className="border p-3 rounded"
            value={formData.engineer}
            onChange={handleChange}
            required
          />

          <input
            name="cost"
            type="number"
            placeholder="Cost"
            className="border p-3 rounded"
            value={formData.cost}
            onChange={handleChange}
            required
          />

          <input
            name="remarks"
            placeholder="Remarks"
            className="border p-3 rounded"
            value={formData.remarks}
            onChange={handleChange}
          />

          <button className="col-span-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
            Add Maintenance Record
          </button>
        </form>

        {history.length === 0 ? (
          <p className="text-gray-500">
            No maintenance history available for this wagon.
          </p>
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
                    {item.date
                      ? new Date(item.date).toLocaleDateString()
                      : "N/A"}

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

export default MaintenanceHistoryModal;