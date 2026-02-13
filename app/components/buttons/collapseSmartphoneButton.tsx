import { useTheme } from "../contexts/theme-provider";

type collapseSmallButtonProps = {
  isCollapsed: boolean;
  onCollapse: () => void;
};

const CollapseSmallButton: React.FC<collapseSmallButtonProps> = ({
  isCollapsed,
  onCollapse,
}) => {
  const { theme } = useTheme();

  return (
    <button
      onClick={onCollapse}
      style={{
        backgroundColor: theme.colors.background_second,
        color: theme.colors.primary,
      }}
      className="fixed top-4 left-4 z-50 p-2.5 rounded-lg shadow-lg hover:opacity-70 transition-all md:hidden"
      aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
    >
      <div className="w-5 h-5 relative flex items-center justify-center">
        <span
          className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ${
            isCollapsed
              ? "top-1 left-0"
              : "rotate-45 top-1/2 left-0 -translate-y-1/2"
          }`}
        ></span>
        <span
          className={`absolute h-0.5 w-full bg-current transition-all duration-300 ${
            isCollapsed ? "top-2 left-0 opacity-100" : "opacity-0"
          }`}
        ></span>
        <span
          className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ${
            isCollapsed
              ? "top-3 left-0"
              : "-rotate-45 top-1/2 left-0 -translate-y-1/2"
          }`}
        ></span>
      </div>
    </button>
  );
};

export default CollapseSmallButton;
