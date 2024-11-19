import { LogEntry } from "@/interfaces/ILog";
import axios from "axios";

const API_URL = import.meta.env.VITE_LOG_API_URL;

export const setLogsData = async (changes: LogEntry[]) => {
  await axios.post(API_URL, null, {
    params: {
      action: "log",
      logs: JSON.stringify(changes),
    },
  });
};

export const readLogData = async () => {
  try {
    const response = await axios.get(API_URL, { params: { action: "read" } });
    console.log(response);
    const fetchedData = response.data.map((row: string[]) => ({
      timestamp: row[0],
      email: row[1],
      day: row[2],
      field: row[3],
      oldValue: row[4],
      newValue: row[5],
      changedBy: row[6],
    }));
    return fetchedData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
