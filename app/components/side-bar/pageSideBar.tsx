import React from "react";
import Link from "next/link";
import { useTheme } from "../contexts/theme-provider";
import { usePathname } from "next/navigation";
import {
  publicSidebarRoutes,
  privateSidebarRoutes,
} from "./config/sideBarRoutes";

type pagesSideBarProps = {
  isCollapsed: boolean;
  onCollapse: () => void;
};

const PagesSideBar: React.FC<pagesSideBarProps> = ({
  isCollapsed,
  onCollapse,
}) => {
  const { theme } = useTheme();
  const pathname = usePathname();

  return (
    <div className="flex flex-col space-y-2">
      {/* Link to public pages */}
      {publicSidebarRoutes.map((route) => {
        const Icon = route.icon;

        return (
          <Link
            key={route.href}
            href={route.href}
            onClick={() => {
              if (window.innerWidth < 768) {
                onCollapse();
              }
            }}
            style={{
              color: theme.colors.primary,
              backgroundColor:
                pathname === route.href
                  ? theme.colors.tertiary_background
                  : "transparent",
            }}
            className={`
            flex items-center p-2 rounded-lg hover:opacity-70
            ${
              isCollapsed
                ? "justify-center items-center hidden md:block md:mx-auto"
                : "justify-start"
            }
          `}
            title={isCollapsed ? route.name : ""}
          >
            <Icon className="w-5 h-5" />

            {!isCollapsed && <span className="ml-3">{route.name}</span>}
          </Link>
        );
      })}

      {/* Implement private routes when this component is use Server ! */}
      {/* {privateSidebarRoutes.map((route) => {

      })} */}

      {/* Create New Conversation */}
      <Link
        href="/"
        className={`
          flex items-center p-2 rounded-lg duration-500 ease-in-out bg-linear-to-br from-indigo-500 to-indigo-800 hover:to-violet-900 text-gray-100
          ${
            isCollapsed
              ? "justify-center items-center hidden md:block md:mx-auto"
              : "justify-start"
          }
        `}
        title={isCollapsed ? "New Chat" : ""}
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        {!isCollapsed && <span className="ml-3">New Chat</span>}
      </Link>
    </div>
  );
};

export default PagesSideBar;
