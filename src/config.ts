const API_URL = import.meta.env.VITE_API_URL;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!API_URL) {
  throw new Error("VITE_API_URL is not defined in environment variables");
}

export { API_URL, GOOGLE_CLIENT_ID };
