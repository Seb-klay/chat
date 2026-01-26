export default function AnalyticsSkeleton() {
  return (
    <div className="rounded-2xl p-6 bg-slate-800/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/30 mt-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="space-y-3">
          <div className="h-6 w-48 bg-slate-700/50 rounded-lg"></div>
          <div className="h-4 w-64 bg-slate-700/50 rounded"></div>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            <div className="px-3 py-1 rounded-md bg-slate-700/50 w-12"></div>
            <div className="px-3 py-1 rounded-md bg-slate-700/50 w-12 ml-2"></div>
            <div className="px-3 py-1 rounded-md bg-slate-700/50 w-12 ml-2"></div>
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex border-b border-gray-700/50 mb-6">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="h-5 w-5 bg-slate-700/50 rounded"></div>
          <div className="h-4 w-24 bg-slate-700/50 rounded"></div>
        </div>
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="h-5 w-5 bg-slate-700/50 rounded"></div>
          <div className="h-4 w-24 bg-slate-700/50 rounded"></div>
        </div>
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="h-5 w-5 bg-slate-700/50 rounded"></div>
          <div className="h-4 w-24 bg-slate-700/50 rounded"></div>
        </div>
      </div>

      {/* Charts Grid skeleton */}
      <div className="grid grid-cols-1 gap-6">
        {/* Main chart skeleton */}
        <div>
          <div className="bg-slate-900/40 rounded-xl p-4">
            <div className="h-6 w-64 bg-slate-700/50 rounded-lg mb-4"></div>
            <div className="h-80 bg-slate-800/50 rounded-lg flex items-center justify-center">
              <div className="h-64 w-64 bg-slate-700/50 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Pie chart skeleton */}
        <div className="bg-slate-900/40 rounded-xl p-4">
          <div className="h-6 w-48 bg-slate-700/50 rounded-lg mb-4"></div>
          <div className="h-64 bg-slate-800/50 rounded-lg flex items-center justify-center">
            <div className="h-40 w-40 bg-slate-700/50 rounded-full"></div>
          </div>
        </div>

        {/* Performance metrics skeleton */}
        <div className="bg-slate-900/40 rounded-xl p-4">
          <div className="h-6 w-48 bg-slate-700/50 rounded-lg mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-800/50">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-5 w-32 bg-slate-700/50 rounded"></div>
                  <div className="h-5 w-16 bg-slate-700/50 rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="h-4 w-20 bg-slate-700/50 rounded mb-1"></div>
                    <div className="h-5 w-16 bg-slate-700/50 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 w-20 bg-slate-700/50 rounded mb-1"></div>
                    <div className="h-5 w-16 bg-slate-700/50 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-700/50">
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-32 bg-slate-700/50 rounded"></div>
                    <div className="h-4 w-24 bg-slate-700/50 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-4 w-24 bg-slate-700/50 rounded"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-700/50 rounded-full"></div>
              <div className="h-4 w-24 bg-slate-700/50 rounded"></div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="h-3 w-full bg-slate-700/50 rounded"></div>
        </div>
      </div>
    </div>
  );
}