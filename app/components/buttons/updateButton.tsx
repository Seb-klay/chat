import { KeyIcon } from "@heroicons/react/16/solid";

type PropsButton = {
  onUpdate: () => void;
  buttonName: string;
};

export function UpdateButton({ onUpdate, buttonName }: PropsButton) {
  return (
    <button
      onClick={onUpdate}
      className="px-4 py-2 rounded-lg transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white"
    >
      <KeyIcon className="h-4 w-4 inline-block mr-2" />
      {buttonName}
    </button>
  );
}
