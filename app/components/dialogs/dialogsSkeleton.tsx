import React from 'react';

export default function DialogsSkeleton () {
  return (
    <div className="w-full space-y-6 py-2 animate-pulse">
        <div className="space-y-4">
          {/* AI Message Skeleton (Left) */}
          <div className="flex items-start gap-3 justify-start">
            <div className="flex flex-col gap-2 w-full">
              <div className="h-24 bg-slate-800 rounded w-3/4" />
            </div>
          </div>

          {/* User Message Skeleton (Right) */}
          <div className="flex items-start gap-3 justify-end">
            <div className="flex flex-col gap-2 w-full items-end">
              <div className="h-24 bg-slate-800 rounded w-3/4" />
            </div>
          </div>

          <div className="flex items-start gap-3 justify-start">
            <div className="flex flex-col gap-2 w-full">
              <div className="h-32 bg-slate-800 rounded w-3/4" />
            </div>
          </div>

        <div className="flex items-start gap-3 justify-end">
            <div className="flex flex-col gap-2 w-full items-end">
              <div className="h-20 bg-slate-800 rounded w-3/4" />
            </div>
          </div>

          <div className="flex items-start gap-3 justify-start">
            <div className="flex flex-col gap-2 w-full">
              <div className="h-42 bg-slate-800 rounded w-3/4" />
            </div>
          </div>

        </div>
    </div>
  );
};