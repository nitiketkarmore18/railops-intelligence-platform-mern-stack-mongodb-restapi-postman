function DeleteConfirmModal({ selectedDelete, setSelectedDelete, confirmDelete }) {
  if (!selectedDelete) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-96 p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-bold mb-3 text-red-600">
          Confirm Delete
        </h2>

        <p className="mb-6 text-gray-700">
          Are you sure you want to delete wagon{" "}
          <strong>{selectedDelete.wagonNumber}</strong>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => setSelectedDelete(null)}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={confirmDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;