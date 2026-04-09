export interface ApiResponseData {
  api_name: string;
  status_code: number;
  response_time_ms: number;
  records_returned: number;
  timestamp?: string;
  method?: string;
  endpoint?: string;
  payload?: unknown;
  responseBody?: unknown;
}

export interface Monitor {
  id: string;
  userId: string;
  apiResponses: ApiResponseData[];
  processedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type AlertSeverity = "low" | "medium" | "high";
export type AlertStatus = "pending" | "processing" | "completed" | "failed";
export type AnomalyType = "High Response Time" | "Error Status Code" | "Zero Records Returned" | "Unexpected Payload";

export interface Alert {
  id: string;
  userId: string;
  monitorId: string;
  api_name: string;
  status_code?: number;
  response_time_ms?: number;
  anomalyType: AnomalyType;
  description: string;
  ai_description?: string;
  severity: AlertSeverity;
  alertStatus: AlertStatus;
  timestamp: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export const MONITOR_TYPE_VERSION = "1.0.0";
