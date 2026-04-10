import { useState } from "react";
import {
  Upload,
  FileJson,
  CheckCircle2,
  Activity,
  ArrowRight,
  Database,
  Trash2,
} from "lucide-react";
import { useProcessMonitorMutation } from "../../redux/features/monitor/monitorApi";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const MonitorContent = ({ onSuccess }: { onSuccess?: () => void }) => {
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
          let finalData;

          // If user provided the full object { apiResponses: [...] }
          if (!Array.isArray(parsed) && parsed.apiResponses && Array.isArray(parsed.apiResponses)) {
            finalData = parsed;
          } 
          // If user provided just the array [...]
          else if (Array.isArray(parsed)) {
            finalData = { apiResponses: parsed };
          }
          // If user provided a single object {...}
          else {
            finalData = { apiResponses: [parsed] };
          }

          await processMonitor(finalData).unwrap();
        } catch {
          return toast.error("Invalid JSON format", { id: toastId });
        }
      } else {
        return toast.error("Please provide data to process", { id: toastId });
      }

      toast.success("API responses processed successfully!", { id: toastId });
      setFile(null);
      setJsonInput("");
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to process data", { id: toastId });
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Method Selector */}
        <div className="space-y-6">
          <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-200 flex gap-1 shadow-sm">
            <button
              onClick={() => setMode("file")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm",
                mode === "file" ? "bg-white text-blue-600 shadow-md shadow-slate-200 border border-slate-100" : "text-slate-500 hover:bg-white/50"
              )}
            >
              <Upload className="w-4 h-4" />
              File Upload
            </button>
            <button
              onClick={() => setMode("manual")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm",
                mode === "manual" ? "bg-white text-blue-600 shadow-md shadow-slate-200 border border-slate-100" : "text-slate-500 hover:bg-white/50"
              )}
            >
              <FileJson className="w-4 h-4" />
              Manual JSON
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-h-[350px] flex flex-col">
            <div className="flex-1">
              {mode === "file" ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-100 rounded-2xl p-6 hover:border-blue-200 hover:bg-blue-50/20 transition-all group relative cursor-pointer">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".json"
                  />
                  {!file ? (
                    <>
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-slate-900">Drop JSON file</p>
                        <p className="text-xs font-medium text-slate-500">or click to browse</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <FileJson className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-slate-900 truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs font-medium text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
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
                <div className=" h-64 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">JSON Input</label>
                    <button
                      onClick={() => setJsonInput("")}
                      className="text-[10px] font-black text-red-500 hover:underline uppercase"
                    >
                      Clear
                    </button>
                  </div>
                  <textarea
                    value={jsonInput}
                    onChange={(event) => setJsonInput(event.target.value)}
                    placeholder='[
  { 
    "api_name": "BillingGateway", 
    "response_time_ms": 150, 
    "status_code": 200, 
    "records_returned": 0 
  }
]'
                    className="flex-1 w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-200 resize-none transition-all"
                  />
                </div>
              )}
            </div>

            <Button
              className="w-full mt-6 py-4 text-sm font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 transform active:scale-[0.98] transition-all"
              onClick={handleProcess}
              isLoading={isLoading}
              disabled={mode === "file" ? !file : !jsonInput}
            >
              Start Analysis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Info & Requirements */}
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
              <Database className="w-4 h-4 text-blue-600" />
              Data Format
            </h3>
            <div className="space-y-3">
              {[
                { label: "api_name", desc: "Identifier for the service", icon: CheckCircle2 },
                { label: "status_code", desc: "HTTP status (200, 500, etc.)", icon: CheckCircle2 },
                { label: "response_time_ms", desc: "Duration in milliseconds", icon: CheckCircle2 },
                { label: "records_returned", desc: "Number of entries returned", icon: CheckCircle2 },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-slate-100 group transition-all">
                  <div className="p-1.5 bg-blue-50 rounded-xl text-blue-600">
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{item.label}</p>
                    <p className="text-[10px] font-bold text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-3xl text-white space-y-3 shadow-lg shadow-blue-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <h4 className="text-sm font-black uppercase tracking-widest">AI Detection</h4>
            </div>
            <p className="text-[11px] font-bold text-blue-100 leading-relaxed">
              Our models automatically detect latency spikes, error patterns, and data anomalies. All findings are enriched with AI root-cause analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitorContent;
