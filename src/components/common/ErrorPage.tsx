import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";

interface ErrorPageProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorPage = ({ message = "Something went wrong. Please try again later.", onRetry }: ErrorPageProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-red-50"
      >
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">System Error</h2>
          <p className="text-slate-600 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
