type collapseButtonProps = {
  isCollapsed: boolean;
  onCollapse: () => void;
};

const CollapseButton: React.FC<collapseButtonProps> = ({
  isCollapsed,
  onCollapse,
}) => {
  return (
    <button
      onClick={onCollapse}
      className={`p-2 rounded hover:opacity-70 hidden md:block ${
        isCollapsed ? "justify-center" : "justify-end"
      }`}
      title={isCollapsed ? "Expand" : "Collapse"}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
};

export default CollapseButton;
