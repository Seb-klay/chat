import { useState } from "react";

type PropsCard = {
  error?: string | null;
  setRenamingConversationId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  setDeleteError: React.Dispatch<React.SetStateAction<string | null>>;
  handleRename: (newTitle: string | undefined) => void;
};

export function ConfirmationCardRename({
  error,
  setRenamingConversationId,
  setDeleteError,
  handleRename,
}: PropsCard) {
  const [newTitle, setNewTitle] = useState<string | undefined>(undefined);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!newTitle) setNewTitle("New conversation");
      handleRename(newTitle!);
      setNewTitle(undefined);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-bold mb-4">Rename Conversation?</h2>
        {error && <p className="mb-6 text-red-400">{error}</p>}
        <div className="my-2">
          <textarea
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="New title"
            className="w-full p-4 pr-36 bg-gray-900 text-gray-100 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 placeholder-gray-500 overflow-hidden overflow-y-scroll resize-none min-h-[30px] md:min-h-[60px]"
            rows={1}
            style={{ height: "auto" }}
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setRenamingConversationId(null), setDeleteError(null);
            }}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleRename(newTitle);
              setNewTitle(undefined);
            }}
            className="px-4 py-2 bg-blue-400 rounded-lg hover:bg-blue-600"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
