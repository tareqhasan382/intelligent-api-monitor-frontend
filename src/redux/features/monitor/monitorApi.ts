import baseApi from "../../api/baseApi";
import type { Monitor, Alert, ApiResponseData } from "../../../types/monitor";

export const monitorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Monitor API
    processMonitor: builder.mutation<{ success: boolean; data: Monitor }, { apiResponses: ApiResponseData[] } | FormData>({
      query: (data) => ({
        url: "/monitor",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Monitor", "Alert"],
    }),

    // Alerts API
    getAllAlerts: builder.query<{ success: boolean; data: Alert[] }, void>({
      query: () => "/alerts",
      providesTags: ["Alert"],
    }),
    getAlertById: builder.query<{ success: boolean; data: Alert }, string>({
      query: (id) => `/alerts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Alert", id }],
    }),
    resolveAlert: builder.mutation<{ success: boolean; data: Alert }, string>({
      query: (id) => ({
        url: `/alerts/${id}/resolve`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => ["Alert", { type: "Alert", id }],
    }),
  }),
});

export const {
  useProcessMonitorMutation,
  useGetAllAlertsQuery,
  useGetAlertByIdQuery,
  useResolveAlertMutation,
} = monitorApi;
