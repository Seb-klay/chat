import { KeyIcon, PencilIcon } from "@heroicons/react/16/solid";

type PropsButton = {
  onUpdate: () => void;
  buttonName: string;
  isPending?: boolean;
  buttonType?: "button" | "submit" ;
};

export function UpdateButton({ onUpdate, buttonName, isPending = false, buttonType = "button" }: PropsButton) {
  return (
    <button
      onClick={onUpdate}
      className="px-4 py-2 rounded-lg transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-gray-100"
      disabled={isPending}
      type={buttonType}
    >
      {buttonName.toLowerCase().includes("rename") ? (
        <PencilIcon className="h-4 w-4 inline-block mr-2" />
      ) : (
        <KeyIcon className="h-4 w-4 inline-block mr-2" />
      )}
      {buttonName}
    </button>
  );
}
