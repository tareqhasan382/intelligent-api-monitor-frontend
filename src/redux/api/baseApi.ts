import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl:`${BASE_URL}/api/v1`,// "http://localhost:5000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth: { token: string | null } }).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Monitor", "Alert"],
  endpoints: () => ({}),
});

export default baseApi;
