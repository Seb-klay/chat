type PropsCard = {
    error?: string | null;
    setDeletingConversationId: React.Dispatch<React.SetStateAction<string | null>>;
    setDeleteError: React.Dispatch<React.SetStateAction<string | null>>;
    handleDelete: () => void;
}

export function ConfirmationCardDelete({error, setDeletingConversationId, setDeleteError, handleDelete}: PropsCard) {
    return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">
            Delete Conversation?
            </h2>
            <p className="mb-6">
            Are you sure you want to delete this conversation ?
            </p>
            {error && (
            <p className="mb-6 text-red-400">
                { error }
            </p>
            )}
            <div className="flex justify-end gap-4">
            <button
                onClick={() => {
                setDeletingConversationId(null),
                    setDeleteError(null);
                }}
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
    )
}