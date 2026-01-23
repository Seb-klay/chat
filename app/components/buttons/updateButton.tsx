type PropsButton = {
  onUpdate: () => void;
};

export function UpdateButton({ onUpdate }: PropsButton) {
  return (
    <button
        onClick={ onUpdate }
      className="flex items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-600 transition-all duration-700"
    >
      <div className="text-gray-100 mx-4 my-2.5">Update</div>
    </button>
  );
}
