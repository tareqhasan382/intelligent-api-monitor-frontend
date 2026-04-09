import { motion } from "framer-motion";
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useGetAllAlertsQuery } from "../redux/features/monitor/monitorApi";
import Loading from "@/components/common/Loading";
import ErrorPage from "@/components/common/ErrorPage";
import { format, subHours, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({
  title,
  value,
  trend,
  trendType,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  trend: string;
  trendType: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: "blue" | "red" | "green" | "amber";
}) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    red: "bg-red-50 text-red-600 border-red-100",
    green: "bg-green-50 text-green-600 border-green-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-2xl border", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
            trendType === "up" ? "bg-green-50 text-green-600" : trendType === "down" ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600"
          )}
        >
          {trendType === "up" ? <ArrowUpRight className="w-3 h-3" /> : trendType === "down" ? <ArrowDownRight className="w-3 h-3" /> : null}
          {trend}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { data: alertsResponse, isLoading, isError, refetch } = useGetAllAlertsQuery();

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPage onRetry={refetch} />;

  const alerts = alertsResponse?.data || [];
  const activeAlerts = alerts.filter((a) => !a.isResolved);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "high");

  // Chart Data Preparation
  const last24Hours = Array.from({ length: 12 }, (_, i) => subHours(new Date(), (11 - i) * 2));
  const labels = last24Hours.map((d) => format(d, "HH:mm"));

  const alertCountsByTime = last24Hours.map((time) => {
    const start = subHours(time, 2);
    const end = time;
    return alerts.filter((a) =>
      isWithinInterval(new Date(a.timestamp), { start, end })
    ).length;
  });

  const responseTimeData = last24Hours.map((time) => {
    const start = subHours(time, 2);
    const end = time;
    const periodAlerts = alerts.filter((a) =>
      isWithinInterval(new Date(a.timestamp), { start, end })
    );
    if (periodAlerts.length === 0) return 0;
    return Math.round(
      periodAlerts.reduce((acc, a) => acc + (a.response_time_ms || 0), 0) / periodAlerts.length
    );
  });

  const lineChartData = {
    labels,
    datasets: [
      {
        label: "Avg Response Time (ms)",
        data: responseTimeData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#3b82f6",
      },
    ],
  };

  const barChartData = {
    labels,
    datasets: [
      {
        label: "Alert Frequency",
        data: alertCountsByTime,
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderRadius: 8,
      },
    ],
  };

  const chartOptions: ChartOptions<"line" | "bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 12,
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 13 },
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(226, 232, 240, 0.5)",
        },
        ticks: {
          font: { weight: "bold" },
          color: "#64748b",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { weight: "bold" },
          color: "#64748b",
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Alerts"
          value={alerts.length}
          trend="+12%"
          trendType="up"
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Active Alerts"
          value={activeAlerts.length}
          trend="-5%"
          trendType="down"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Critical Issues"
          value={criticalAlerts.length}
          trend="+2"
          trendType="up"
          icon={TrendingUp}
          color="red"
        />
        <StatCard
          title="Resolved"
          value={alerts.filter((a) => a.isResolved).length}
          trend="84%"
          trendType="neutral"
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900">Performance Overview</h3>
              <p className="text-sm font-bold text-slate-500">Average API response time (ms)</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="h-80">
            <Line data={lineChartData} options={chartOptions as ChartOptions<"line">} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900">Alert Frequency</h3>
              <p className="text-sm font-bold text-slate-500">Number of issues detected per period</p>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl">
              <Activity className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="h-80">
            <Bar data={barChartData} options={chartOptions as ChartOptions<"bar">} />
          </div>
        </motion.div>
      </div>

      {/* Recent Alerts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900">Recent System Alerts</h3>
          <Link to="/alerts" className="text-sm font-bold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-all">
            View All Alerts
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">API Name</th>
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Severity</th>
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Time</th>
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.slice(0, 5).map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{alert.api_name}</p>
                    <p className="text-xs font-medium text-slate-500">ID: {alert.id.slice(0, 8)}...</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-700">{alert.anomalyType}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter",
                      alert.severity === "high" ? "bg-red-100 text-red-700" :
                      alert.severity === "medium" ? "bg-amber-100 text-amber-700" :
                      "bg-blue-100 text-blue-700"
                    )}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-500">
                    {format(new Date(alert.timestamp), "MMM dd, HH:mm")}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        alert.isResolved ? "bg-green-500" : "bg-red-500 animate-pulse"
                      )}></div>
                      <span className={cn(
                        "text-sm font-bold",
                        alert.isResolved ? "text-green-600" : "text-red-600"
                      )}>
                        {alert.isResolved ? "Resolved" : "Active"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {alerts.length === 0 && (
            <div className="p-12 text-center">
              <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">No alerts detected yet.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
