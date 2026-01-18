export function LoadingButton() {
  return (
    <button
      disabled
      className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    </button>
  );
}
