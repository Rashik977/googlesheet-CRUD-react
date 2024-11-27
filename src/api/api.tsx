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

export default api;
