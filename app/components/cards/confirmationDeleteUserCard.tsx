type PropsCard = {
  cancelDelete: () => void;
  handleDelete: () => void;
  onError?: string | null;
};

export function ConfirmationCardDeleteUser({
  cancelDelete,
  handleDelete,
  onError,
}: PropsCard) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-800 text-gray-100 p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-bold mb-4">Delete Account ?</h2>
        <p className="mb-6">Are you sure you want to delete this account ?</p>
        {onError && <p className="mb-6 text-red-400">{onError}</p>}
        <div className="flex justify-end gap-4">
          <button
            onClick={cancelDelete}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-400 rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
