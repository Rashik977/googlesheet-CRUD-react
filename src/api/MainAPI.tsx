import { API_URL } from "@/config";
import api from "./api";

const module = "main";

// Fetch data from Google Sheets
export const readMainData = async () => {
  try {
    const response = await api.get(API_URL, {
      params: {
        module: module,
        action: "read",
      },
    });
    const fetchedData = response.data.map((row: string[]) => ({
      email: row[0],
      allocation: row[1],
      startDate: row[2],
      endDate: row[3],
    }));
    return fetchedData;
  } catch (error) {
    console.error("Error fetching main data:", error);
  }
};

// Add new data to Google Sheets
export const addMainData = async (
  email: string,
  allocation: string,
  startDate: string,
  endDate: string
) => {
  try {
    await api.get(API_URL, {
      params: {
        module: module,
        action: "create",
        email: email,
        allocation: allocation,
        startDate: startDate,
        endDate: endDate,
      },
    });
    console.log("Data added successfully to main sheet");
  } catch (error) {
    console.error("Error adding data to main sheet:", error);
  }
};

// Update specific cell in Google Sheets
export const updateMainData = async (
  row: number,
  column: number,
  value: string
) => {
  try {
    await api.get(API_URL, {
      params: {
        module: module,
        action: "update",
        row: row,
        column: column,
        value: value,
      },
    });
    console.log("Main sheet cell updated successfully");
  } catch (error) {
    console.error("Error updating main sheet cell:", error);
  }
};

// Delete data from Google Sheets
export const deleteMainData = async (row: number) => {
  try {
    await api.get(API_URL, {
      params: {
        module: module,
        action: "delete",
        row: row,
      },
    });
    console.log("Data deleted successfully from main sheet");
  } catch (error) {
    console.error("Error deleting data from main sheet:", error);
  }
};

// Search data in Google Sheets by email
export const searchMainDataByEmail = async (email: string) => {
  try {
    const response = await api.get(API_URL, {
      params: { module: module, action: "search", email: email },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching data in main sheet:", error);
  }
};

// Fetch unique allocations from Google Sheets
export const getUniqueAllocations = async () => {
  try {
    const response = await api.get(API_URL, {
      params: { module: module, action: "getAllocations" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching unique allocations:", error);
  }
};
