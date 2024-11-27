import { API_URL } from "@/config";
import { LogEntry } from "@/interfaces/ILog";
import api from "./api";
const module = "log";

export const setLogsData = async (changes: LogEntry[]) => {
  await api.get(API_URL, {
    params: {
      module: module,
      action: "log",
      logs: JSON.stringify(changes),
    },
  });
};

export const readLogData = async () => {
  try {
    const response = await api.get(API_URL, {
      params: { module: module, action: "read" },
    });
    const fetchedData = response.data.map((row: string[]) => ({
      timestamp: row[0],
      email: row[1],
      day: row[2],
      field: row[3],
      oldValue: row[4],
      newValue: row[5],
      changedBy: row[6],
      date: row[7] || "", // Add date column
    }));
    return fetchedData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};
