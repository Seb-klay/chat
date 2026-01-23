type PropsButton = {
  onCancel: () => void;
};

export function CancelButton({ onCancel }: PropsButton) {
  return (
    <button
        onClick={onCancel}
      className="flex items-center justify-center rounded-lg bg-gray-500 hover:bg-gray-600 transition-all duration-700"
    >
      <div className="text-gray-100 mx-4 my-2.5">Cancel</div>
    </button>
  );
}
