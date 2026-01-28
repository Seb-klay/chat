import { TrashIcon } from "@heroicons/react/16/solid";

type PropsButton = {
  onDelete: () => void;
  buttonName: string;
};

export function DeleteButton({ onDelete, buttonName }: PropsButton) {
  return (
    <button
      onClick={onDelete}
      className="px-4 py-2 rounded-lg transition-all duration-300 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30"
    >
      <TrashIcon className="h-4 w-4 inline-block mr-2" />
      {buttonName}
    </button>
  );
}
