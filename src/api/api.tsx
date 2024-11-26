// api.tsx - Axios instance with interceptors
import { API_URL } from "@/config";
import axios from "axios";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token && config.params) {
      config.params.token = token; // Add token
      config.params.permission = config.params.permission || ""; // Specify required permission
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Check token expiry in interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      // Refresh logic here
      localStorage.removeItem("authToken");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
