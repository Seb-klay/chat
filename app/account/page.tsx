"use server";

import { Suspense } from "react";
import Analytics from "./analytics";
import Accountdetails from "./accountDetails";
import AnalyticsSkeleton from "./analyticsSkeleton";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { getUserAnalytics } from "../service";

export default async function Account() {
  const analyticsResponse = getUserAnalytics();

  return (
    <div className="flex flex-col overflow-y-auto h-[100dvh] bg-slate-900 text-gray-100 p-4 md:p-8 transition-all duration-300 font-sans">
      <div className="flex-1 max-w-4xl mx-auto w-full mb-6">
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

        <Suspense fallback={<AnalyticsSkeleton/>}>
          <Analytics analyticsPromise={analyticsResponse} />
        </Suspense>
      </div>
    </div>
  );
}
