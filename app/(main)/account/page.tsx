"use client";

import Analytics from "./analytics";
import Accountdetails from "./accountDetails";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../../components/contexts/theme-provider";

export default function Account() {
  const { theme } = useTheme();

  return (
    <div
      style={{ backgroundColor: theme.colors.background, color: theme.colors.primary }}
      className="flex flex-col overflow-y-auto h-dvh p-4 md:p-8 transition-all duration-300 font-sans"
    >
      <div className="flex-1 max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Cog6ToothIcon className="h-7 w-7 text-blue-400" />
            Account Management
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your account details and security
          </p>
        </header>

        {/* Updating account details such as deleting account and change password */}
        <Accountdetails />

        {/* Showing user stats such as model usage, frequency, tokens, etc. */}
        <Analytics />
      </div>
    </div>
  );
}
