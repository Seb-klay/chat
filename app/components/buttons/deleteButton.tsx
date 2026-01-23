type PropsButton = {
  onDelete: () => void;
};

export function DeleteButton({ onDelete }: PropsButton) {
  return (
    <button
        onClick={ onDelete }
      className="flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 transition-all duration-700"
    >
      <div className="text-gray-100 mx-4 my-2.5">Delete</div>
    </button>
  );
}
