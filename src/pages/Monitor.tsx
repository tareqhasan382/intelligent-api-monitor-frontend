import { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
  Database,
  Trash2,
} from "lucide-react";
import { useProcessMonitorMutation } from "../redux/features/monitor/monitorApi";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const Monitor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [mode, setMode] = useState<"file" | "manual">("file");
  const [processMonitor, { isLoading }] = useProcessMonitorMutation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== "application/json") {
        return toast.error("Please upload a JSON file");
      }
      setFile(selectedFile);
    }
  };

  const handleProcess = async () => {
    const toastId = toast.loading("Processing API responses...");
    try {
      if (mode === "file" && file) {
        const formData = new FormData();
        formData.append("file", file);
        await processMonitor(formData).unwrap();
      } else if (mode === "manual" && jsonInput) {
        try {
          const parsed = JSON.parse(jsonInput);
          const apiResponses = Array.isArray(parsed) ? parsed : [parsed];
          await processMonitor({ apiResponses }).unwrap();
        } catch {
          return toast.error("Invalid JSON format", { id: toastId });
        }
      } else {
        return toast.error("Please provide data to process", { id: toastId });
      }

      toast.success("API responses processed successfully!", { id: toastId });
      setFile(null);
      setJsonInput("");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to process data", { id: toastId });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="mx-auto w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center border border-blue-100 mb-4 shadow-sm"
        >
          <Activity className="w-10 h-10 text-blue-600" />
        </motion.div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">API Monitoring Engine</h1>
        <p className="text-lg font-medium text-slate-500 max-w-xl mx-auto">
          Upload your system's API response logs for real-time anomaly detection and AI analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Method Selector */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-white p-2 rounded-2xl border border-slate-200 flex gap-2 shadow-sm">
            <button
              onClick={() => setMode("file")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
                mode === "file" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Upload className="w-4 h-4" />
              File Upload
            </button>
            <button
              onClick={() => setMode("manual")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
                mode === "manual" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <FileJson className="w-4 h-4" />
              Manual JSON
            </button>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex-1">
              {mode === "file" ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-blue-400 hover:bg-blue-50/30 transition-all group relative cursor-pointer">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".json"
                  />
                  {!file ? (
                    <>
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-black text-slate-900 text-lg">Drop JSON file here</p>
                        <p className="text-sm font-medium text-slate-500">or click to browse your computer</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <FileJson className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-black text-slate-900 text-lg">{file.name}</p>
                        <p className="text-sm font-medium text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button
                        onClick={(event) => { event.stopPropagation(); setFile(null); }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-slate-500 uppercase tracking-widest">JSON Input</label>
                    <button
                      onClick={() => setJsonInput("")}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <textarea
                    value={jsonInput}
                    onChange={(event) => setJsonInput(event.target.value)}
                    placeholder='[{"api_name": "Auth Service", "status_code": 200, "response_time_ms": 150, "records_returned": 1}]'
                    className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
                  />
                </div>
              )}
            </div>

            <Button
              className="w-full mt-8 py-4 text-base font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 transform active:scale-[0.98] transition-all"
              onClick={handleProcess}
              isLoading={isLoading}
              disabled={mode === "file" ? !file : !jsonInput}
            >
              Analyze Responses
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Info & Tips */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-600" />
              Data Requirements
            </h3>
            <div className="space-y-4">
              {[
                { label: "API Name", desc: "Identifier for the service", icon: CheckCircle2 },
                { label: "Status Code", desc: "HTTP response status (e.g. 200, 500)", icon: CheckCircle2 },
                { label: "Response Time", desc: "Duration in milliseconds", icon: CheckCircle2 },
                { label: "Records", desc: "Number of data entries returned", icon: CheckCircle2 },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl group hover:bg-blue-50/50 transition-all">
                  <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.label}</p>
                    <p className="text-sm font-medium text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-3xl text-white space-y-4 shadow-xl shadow-blue-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <h4 className="text-lg font-black tracking-tight">AI Detection Engine</h4>
            </div>
            <p className="text-sm font-bold text-blue-100 leading-relaxed">
              Once processed, our system automatically detects anomalies such as high latency, error codes, and unexpected record counts. All issues are then enqueued for detailed AI analysis to provide you with actionable insights.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Monitor;
