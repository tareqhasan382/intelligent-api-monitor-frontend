import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  RefreshCcw,
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
import { useGetAllAlertsQuery, useResolveAlertMutation } from "../redux/features/monitor/monitorApi";
import Loading from "@/components/common/Loading";
import ErrorPage from "@/components/common/ErrorPage";
import { format, subHours, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import MonitorContent from "@/components/monitor/MonitorContent";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

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
      className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-2xl border", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
            trendType === "up" ? "bg-green-50 text-green-600" : trendType === "down" ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"
          )}
        >
          {trendType === "up" ? <ArrowUpRight className="w-3 h-3" /> : trendType === "down" ? <ArrowDownRight className="w-3 h-3" /> : null}
          {trend}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h3>
        <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { data: alertsResponse, isLoading, isError, refetch } = useGetAllAlertsQuery();
  const [resolveAlert, { isLoading: isResolving }] = useResolveAlertMutation();
  const [isMonitorOpen, setIsMonitorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("active");

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPage onRetry={refetch} />;

  const alerts = alertsResponse?.data || [];
  const activeAlerts = alerts.filter((a) => !a.isResolved);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "high");

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = alert.api_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          alert.anomalyType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" ? true : filter === "active" ? !alert.isResolved : alert.isResolved;
    return matchesSearch && matchesFilter;
  });

  const handleResolve = async (id: string) => {
    const toastId = toast.loading("Marking as resolved...");
    try {
      await resolveAlert(id).unwrap();
      toast.success("Alert resolved!", { id: toastId });
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to resolve alert", { id: toastId });
    }
  };

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
        label: "Latency (ms)",
        data: responseTimeData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.05)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels,
    datasets: [
      {
        label: "Alerts",
        data: alertCountsByTime,
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderRadius: 8,
        hoverBackgroundColor: "#ef4444",
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
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 12 },
        cornerRadius: 12,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(226, 232, 240, 0.5)",
        },
        border: {
          display: false,
        },
        ticks: {
          font: { weight: "bold", size: 10 },
          color: "#64748b",
        },
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: { weight: "bold", size: 10 },
          color: "#64748b",
        },
      },
    },
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-sm font-bold text-slate-400">Real-time API performance and anomaly tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsMonitorOpen(true)}
            className="rounded-2xl px-6 py-4 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 transform active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Scan
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Detected Issues"
          value={alerts.length}
          trend="+12%"
          trendType="up"
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Currently Active"
          value={activeAlerts.length}
          trend="-5%"
          trendType="down"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Critical Alerts"
          value={criticalAlerts.length}
          trend="+2"
          trendType="up"
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="Recovery Rate"
          value={`${Math.round((alerts.filter((a) => a.isResolved).length / (alerts.length || 1)) * 100)}%`}
          trend="84%"
          trendType="neutral"
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Latency Trends</h3>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Avg Response Time (ms)</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="h-72">
            <Line data={lineChartData} options={chartOptions as ChartOptions<"line">} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Anomaly Density</h3>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Alerts Detected per period</p>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl border border-red-100 text-red-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="h-72">
            <Bar data={barChartData} options={chartOptions as ChartOptions<"bar">} />
          </div>
        </motion.div>
      </div>

      {/* Alerts Management Hub */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Incident Log</h2>
            <p className="text-sm font-bold text-slate-400">Review and resolve detected system anomalies.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner">
              {["active", "resolved", "all"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t as typeof filter)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    filter === t ? "bg-white text-slate-900 shadow-md border border-slate-50" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={() => { void refetch(); }}
              className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm active:rotate-180 duration-500"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search service name, incident type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 font-bold text-slate-700 transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAlerts.slice(0, 6).map((alert) => (
              <motion.div
                layout
                key={alert.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative",
                  !alert.isResolved && alert.severity === "high" && "border-red-100 ring-2 ring-red-500/5"
                )}
              >
                <div className="p-8 space-y-5 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Layers className="w-3 h-3 text-blue-600" />
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{alert.anomalyType}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{alert.api_name}</h3>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      alert.severity === "high" ? "bg-red-50 text-red-700 border-red-100" :
                      alert.severity === "medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
                      "bg-blue-50 text-blue-700 border-blue-100"
                    )}>
                      {alert.severity}
                    </span>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 group-hover:bg-white transition-all duration-300">
                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed line-clamp-2 italic">
                      "{alert.description}"
                    </p>
                    
                    {/* AI Insight Section */}
                    <div className="pt-3 border-t border-slate-200 mt-2">
                       <div className="flex items-center gap-2 mb-1.5">
                         <TrendingUp className={cn("w-3 h-3", alert.alertStatus === "pending" ? "text-amber-500 animate-pulse" : "text-blue-600")} />
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                           AI Insight {alert.alertStatus === "pending" && "pending"}
                         </span>
                       </div>
                       {alert.alertStatus === "pending" ? (
                         <div className="flex items-center gap-2">
                           <div className="flex gap-1">
                             <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                             <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                             <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce"></span>
                           </div>
                           <p className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest">
                             Analyzing...
                           </p>
                         </div>
                       ) : alert.ai_description ? (
                         <p className="text-[10px] font-black text-slate-700 line-clamp-3 leading-relaxed">
                           {alert.ai_description}
                         </p>
                       ) : (
                         <p className="text-[10px] font-black text-slate-400 italic">
                           No additional insights available.
                         </p>
                       )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Latency</p>
                        <p className="text-xs font-black text-slate-900">{alert.response_time_ms}ms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Detected</p>
                        <p className="text-xs font-black text-slate-900">{format(new Date(alert.timestamp), "HH:mm")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto group-hover:bg-blue-50/50 transition-all">
                  {alert.isResolved ? (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-black text-green-600 text-[10px] uppercase tracking-widest">Resolved</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-100 transform active:scale-[0.98]"
                      onClick={() => handleResolve(alert.id)}
                      isLoading={isResolving}
                    >
                      Resolve Incident
                      <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No matching incidents found</p>
          </div>
        )}

        {filteredAlerts.length > 6 && (
           <div className="flex justify-center pt-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing latest {Math.min(filteredAlerts.length, 6)} of {filteredAlerts.length} incidents
              </p>
           </div>
        )}
      </motion.div>

      {/* Modals */}
      <Modal
        isOpen={isMonitorOpen}
        onClose={() => setIsMonitorOpen(false)}
        title="Analyze API Responses"
        maxWidth="4xl"
      >
        <MonitorContent onSuccess={() => setIsMonitorOpen(false)} />
      </Modal>
    </div>
  );
};

export default Dashboard;

