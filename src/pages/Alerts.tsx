import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  CheckCircle,
  RefreshCcw,
  Activity,
} from "lucide-react";
import {
  useGetAllAlertsQuery,
  useResolveAlertMutation,
} from "../redux/features/monitor/monitorApi";
import Loading from "@/components/common/Loading";
import ErrorPage from "@/components/common/ErrorPage";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";

const Alerts = () => {
  const { data: alertsResponse, isLoading, isError, refetch } = useGetAllAlertsQuery();
  const [resolveAlert, { isLoading: isResolving }] = useResolveAlertMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("active");

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPage onRetry={refetch} />;

  const alerts = alertsResponse?.data || [];
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

  const stats = {
    active: alerts.filter((a) => !a.isResolved).length,
    high: alerts.filter((a) => a.severity === "high" && !a.isResolved).length,
    resolved: alerts.filter((a) => a.isResolved).length,
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Alerts</h1>
          </div>
          <p className="text-sm font-bold text-slate-500 max-w-lg">
            Monitor and manage anomalies detected in your API infrastructure.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex gap-2">
            {[
              { id: "active", label: `Active (${stats.active})`, color: "red" },
              { id: "resolved", label: `Resolved (${stats.resolved})`, color: "green" },
              { id: "all", label: "All Logs", color: "blue" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id as typeof filter)}
                className={cn(
                  "px-4 py-2.5 rounded-xl font-black text-sm transition-all duration-200",
                  filter === btn.id
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              void refetch();
            }}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:rotate-180 duration-500"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "High Severity", value: stats.high, icon: ShieldAlert, color: "red" },
          { label: "Currently Active", value: stats.active, icon: AlertTriangle, color: "amber" },
          { label: "Success Resolution", value: stats.resolved, icon: CheckCircle, color: "green" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-all">
            <div className={cn(
              "p-3 rounded-2xl border",
              stat.color === "red" ? "bg-red-50 text-red-600 border-red-100" :
              stat.color === "amber" ? "bg-amber-50 text-amber-600 border-amber-100" :
              "bg-green-50 text-green-600 border-green-100"
            )}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Results */}
      <div className="space-y-6">
        <div className="relative group max-w-2xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search API name, anomaly type, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-8 py-5 bg-white border border-slate-200 rounded-3xl shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAlerts.map((alert) => (
              <motion.div
                layout
                key={alert.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative",
                  !alert.isResolved && alert.severity === "high" && "border-red-200 ring-2 ring-red-500/10"
                )}
              >
                {!alert.isResolved && alert.severity === "high" && (
                  <div className="absolute top-4 right-4 animate-pulse">
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.8)]"></div>
                  </div>
                )}
                
                <div className="p-8 space-y-6 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{alert.anomalyType}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{alert.api_name}</h3>
                    </div>
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                      alert.severity === "high" ? "bg-red-50 text-red-700 border-red-100" :
                      alert.severity === "medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
                      "bg-blue-50 text-blue-700 border-blue-100"
                    )}>
                      {alert.severity}
                    </span>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 group-hover:bg-white group-hover:border-blue-100 transition-all duration-300">
                    <p className="text-sm font-bold text-slate-600 leading-relaxed italic line-clamp-3">
                      "{alert.description}"
                    </p>
                    {alert.ai_description && (
                      <div className="pt-3 border-t border-slate-200 mt-3 space-y-1.5">
                         <div className="flex items-center gap-2">
                           <Activity className="w-3.5 h-3.5 text-blue-600" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Insights</span>
                         </div>
                         <p className="text-xs font-bold text-slate-700 line-clamp-4 leading-relaxed">
                           {alert.ai_description}
                         </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-xl">
                        <Clock className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Response Time</p>
                        <p className="text-sm font-black text-slate-900">{alert.response_time_ms}ms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-xl">
                        <Calendar className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected</p>
                        <p className="text-sm font-black text-slate-900">{format(new Date(alert.timestamp), "HH:mm, MMM dd")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto group-hover:bg-blue-50/30 transition-all duration-300">
                  {alert.isResolved ? (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-black text-green-600 text-sm uppercase tracking-widest">Resolved</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-6 text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all transform active:scale-[0.98]"
                      onClick={() => handleResolve(alert.id)}
                      isLoading={isResolving}
                    >
                      Mark Resolved
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredAlerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-6"
          >
            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <CheckCircle2 className="w-16 h-16 text-slate-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">All systems operational!</h3>
              <p className="text-slate-500 font-bold">No {filter} alerts found matching your criteria.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
