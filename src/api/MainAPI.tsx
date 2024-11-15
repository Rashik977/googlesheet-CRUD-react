import axios from "axios";

const MAIN_API_URL = import.meta.env.VITE_MAIN_API_URL;

// Fetch data from Google Sheets
export const readMainData = async () => {
  try {
    const response = await axios.get(MAIN_API_URL, {
      params: { action: "read" },
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
    await axios.post(MAIN_API_URL, null, {
      params: {
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
    await axios.post(MAIN_API_URL, null, {
      params: {
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
    await axios.post(MAIN_API_URL, null, {
      params: {
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
    const response = await axios.get(MAIN_API_URL, {
      params: { action: "search", email: email },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching data in main sheet:", error);
  }
};

// Fetch unique allocations from Google Sheets
export const getUniqueAllocations = async () => {
  try {
    const response = await axios.get(MAIN_API_URL, {
      params: { action: "getAllocations" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching unique allocations:", error);
  }
};
