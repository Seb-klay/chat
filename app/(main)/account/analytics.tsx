import { useEffect, useState } from "react";
import {
  InformationCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export interface IAnalytics {
  day: string;
  model: string;
  requests: string;
  total_duration: string;
  load_duration: string;
  prompt_eval_count: string;
  prompt_eval_duration: string;
  eval_count: string;
  eval_duration: string;
}
import { useTheme } from "../../components/contexts/theme-provider";
import { getUserAnalytics } from "../../service";
import { toast } from "sonner";
import AnalyticsSkeleton from "./analyticsSkeleton";

// Color palette for models
const MODEL_COLORS = {
  "llama3.2:3b": "#3B82F6", // blue
  tinyllama: "#10B981", // emerald
  "gemma3:1b": "#8B5CF6", // violet
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
};

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<
    "tokens" | "duration" | "requests"
  >("tokens");
  const [dataAnalytics, setDataAnalytics] = useState<IAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { theme } = useTheme();

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        const analytics = await getUserAnalytics();
        setDataAnalytics(analytics);
      } catch (err) {
        toast.error(String(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // Process data for charts
  const processedData = dataAnalytics?.map((item) => ({
    ...item,
    formattedDay: formatDate(item.day),
    total_tokens: parseInt(item.prompt_eval_count) + parseInt(item.eval_count),
    total_duration_seconds: parseInt(item.total_duration) / 1_000_000_000,
    eval_duration_seconds: parseInt(item.eval_duration) / 1_000_000_000,
    prompt_eval_duration_seconds:
      parseInt(item.prompt_eval_duration) / 1_000_000_000,
  }));

  // Group data by model for pie chart
  const modelSummary = Object.values(
    processedData.reduce(
      (acc, item) => {
        if (!acc[item.model]) {
          acc[item.model] = {
            model: item.model,
            total_tokens: 0,
            total_requests: 0,
            total_eval_duration: 0,
            color:
              MODEL_COLORS[item.model as keyof typeof MODEL_COLORS] ||
              "#6B7280",
          };
        }
        acc[item.model].total_tokens +=
          parseInt(item.prompt_eval_count) + parseInt(item.eval_count);
        acc[item.model].total_requests += parseInt(item.requests);
        acc[item.model].total_eval_duration += parseInt(item.eval_duration);
        return acc;
      },
      {} as Record<string, any>,
    ),
  );

  // if loading state, display skeleton
  if (isLoading) return <AnalyticsSkeleton />
  // if no analytics to display, show message
  if (dataAnalytics.length === 0) return <div className="flex p-6 md:p-12 justify-center items-center mx-auto">No Analytics to display yet.</div>

  return (
    <div>
      <div
        style={{
          backgroundColor: theme.colors.background_second,
          color: theme.colors.primary,
        }}
        className="rounded-2xl p-6 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/30 mt-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6 text-blue-400" />
              AI Model Analytics
            </h2>
            <p style={{ color: theme.colors.secondary }} className="mt-1">
              Track your model usage and performance over time
            </p>
            <p
              style={{ color: theme.colors.secondary }}
              className="text-xs mt-3"
            >
              <InformationCircleIcon className="h-4 w-4 inline-block mr-1" />
              Data reflects the last 7 days of usage. Tokens include both input
              (prompt) and output (response) tokens.
            </p>
          </div>

          {/* change time slots */}
          {/* <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm transition-all ${timeRange === range ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div> */}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700/50 mb-6">
          {[
            { id: "tokens", label: "Token Usage", icon: "🧠" },
            { id: "duration", label: "Response Times", icon: "⚡" },
            { id: "requests", label: "Request Volume", icon: "📊" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-gray-300"}`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Main Chart */}
          <div>
            <div
              style={{
                backgroundColor: theme.colors.background_second,
                color: theme.colors.secondary,
              }}
              className="rounded-xl p-4"
            >
              <h3 className="text-lg font-medium mb-4">
                {activeTab === "tokens" &&
                  "Total Tokens Processed (Input + Output)"}
                {activeTab === "duration" && "Evaluation Duration per Request"}
                {activeTab === "requests" && "Daily Request Volume by Model"}
              </h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {activeTab === "tokens" && (
                    <AreaChart data={processedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="formattedDay"
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip
                        formatter={(value) => [
                          value?.toLocaleString(),
                          "Tokens",
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          borderColor: "#374151",
                          color: "white",
                        }}
                      />
                      <Legend />
                      {Object.keys(MODEL_COLORS).map((model) => (
                        <Area
                          key={model}
                          type="monotone"
                          dataKey="total_tokens"
                          data={processedData?.filter((d) => d.model === model)}
                          name={model}
                          stroke={
                            MODEL_COLORS[model as keyof typeof MODEL_COLORS]
                          }
                          fill={
                            MODEL_COLORS[model as keyof typeof MODEL_COLORS]
                          }
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      ))}
                    </AreaChart>
                  )}

                  {activeTab === "duration" && (
                    <BarChart data={processedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="formattedDay"
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => `${value}s`}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${Number(value).toFixed(2)}s`,
                          "Duration",
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          borderColor: "#374151",
                          color: "white",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="eval_duration_seconds"
                        name="Response Generation"
                        fill="#10B981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="prompt_eval_duration_seconds"
                        name="Prompt Processing"
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  )}

                  {activeTab === "requests" && (
                    <LineChart data={processedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="formattedDay"
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        formatter={(value) => [value, "Requests"]}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          borderColor: "#374151",
                          color: "white",
                        }}
                      />
                      <Legend />
                      {Object.keys(MODEL_COLORS).map((model) => (
                        <Line
                          key={model}
                          type="monotone"
                          dataKey="requests"
                          data={processedData?.filter((d) => d.model === model)}
                          name={model}
                          stroke={
                            MODEL_COLORS[model as keyof typeof MODEL_COLORS]
                          }
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Model Distribution Pie Chart */}
          <div
            style={{
              backgroundColor: theme.colors.background_second,
              color: theme.colors.secondary,
            }}
            className="rounded-xl p-4"
          >
            <h3 className="text-lg font-medium mb-4">
              Model Usage Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelSummary}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => {
                      const model =
                        entry.payload?.model || entry.model || entry.name;
                      const percent = entry.percent;
                      return `${model}: ${percent ? (percent * 100).toFixed(0) : 0}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_requests"
                    nameKey="model"
                  >
                    {modelSummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      if (name === "total_requests") return [value, "Requests"];
                      if (name === "total_tokens")
                        return [value?.toLocaleString(), "Tokens"];
                      return [value, name];
                    }}
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      borderColor: "#374151",
                      color: "white",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legends */}
            <div
              style={{
                backgroundColor: theme.colors.background_second,
                color: theme.colors.secondary,
              }}
              className="flex flex-wrap items-center gap-4 text-sm"
            >
              <span>Model Legend:</span>
              {Object.entries(MODEL_COLORS).map(([model, color]) => (
                <div key={model} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span>{model}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div
            style={{
              backgroundColor: theme.colors.background_second,
              color: theme.colors.secondary,
            }}
            className="rounded-xl p-4"
          >
            <h3 className="text-lg font-medium mb-4">Performance Summary</h3>
            <div className="space-y-4">
              {modelSummary.map((model) => (
                <div
                  key={model.model}
                  className="p-3 rounded-lg border-l-4 hover:opacity-70"
                  style={{ borderLeftColor: model.color }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className="font-medium"
                      style={{ color: model.color }}
                    >
                      {model.model}
                    </span>
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                      {model.total_requests} requests
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p>Total Tokens</p>
                      <p className="font-semibold">
                        {model.total_tokens.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p>Avg Eval Time</p>
                      <p className="font-semibold">
                        {(
                          model.total_eval_duration /
                          model.total_requests /
                          1_000_000_000
                        ).toFixed(2)}
                        s
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div
                style={{ color: theme.colors.secondary }}
                className="pt-4 border-t border-gray-700/50"
              >
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Total Requests:</span>
                    <span className="font-medium">
                      {modelSummary.reduce(
                        (sum, m) => sum + m.total_requests,
                        0,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Tokens Processed:</span>
                    <span className="font-medium">
                      {modelSummary
                        .reduce((sum, m) => sum + m.total_tokens, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response Time:</span>
                    <span className="font-medium">
                      {(
                        modelSummary.reduce(
                          (sum, m) => sum + m.total_eval_duration,
                          0,
                        ) /
                        modelSummary.reduce(
                          (sum, m) => sum + m.total_requests,
                          0,
                        ) /
                        1_000_000_000
                      ).toFixed(2)}
                      s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
