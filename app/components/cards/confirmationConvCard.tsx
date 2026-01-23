import { useState } from "react";
import { DeleteButton } from "../buttons/deleteButton";
import { CancelButton } from "../buttons/cancelButton";
import { UpdateButton } from "../buttons/updateButton";

type PropsCard = {
  action: "delete" | "rename" | "share";
  onCancel: () => void;
  onDelete: () => void;
  onRename: (newTitle: string | undefined) => void;
  onShare: () => void;
  onError?: string | null;
};

export function ConfirmationConvCard({
  action,
  onCancel,
  onDelete,
  onRename,
  onShare,
  onError,
}: PropsCard) {
  const [newTitle, setNewTitle] = useState<string | undefined>(undefined);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!newTitle) setNewTitle("New conversation");
      onRename(newTitle!);
      setNewTitle(undefined);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="text-gray-100 bg-gray-800 p-6 rounded-lg shadow-lg w-80">
        {action === "delete" && (
          <div className="flex flex-col">
            <h1 className="font-bold">Delete conversation</h1>
            <p className="my-4">Are you sure you want to delete this conversation?</p>
          </div>
        )}

        {action === "rename" && (
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
        )}

        {action === "share" && <h1>Share this conversation?</h1>}

        <div className="actions flex justify-around mx-auto">
          <CancelButton onCancel={onCancel} />

          {action === "delete" && <DeleteButton onDelete={onDelete} />}

          {action === "rename" && (
            <UpdateButton 
              onUpdate={() => onRename(newTitle)}
            />
          )}

          {action === "share" && <button onClick={onShare}>Share</button>}
        </div>
        {onError && <p className="mb-6 text-red-400">{onError}</p>}
      </div>
    </div>
  );
}
