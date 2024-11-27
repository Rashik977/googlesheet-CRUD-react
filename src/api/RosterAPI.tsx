import api from "./api";
import { API_URL } from "@/config";
import { RowData } from "@/interfaces/IRowData";

const module = "roster";

// Fetch data from Google Sheets
export const readRosterData = async () => {
  try {
    const response = await api.get(API_URL, {
      params: {
        module: module,
        action: "read",
        permission: "manage_roster",
      },
    });
    const fetchedData = response.data.map((row: string[]) => ({
      projectName: row[0],
      projectLeader: row[1],
      startDate: row[2],
      endDate: row[3],
      monday: row[4],
      tuesday: row[5],
      wednesday: row[6],
      thursday: row[7],
      friday: row[8],
    }));
    return fetchedData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Propagate error for higher-level handling
  }
};

// Function to add data to Google Sheets
export const addRosterData = async (rowData: RowData) => {
  try {
    await api.get(API_URL, {
      params: {
        module: module,
        action: "create",
        projectName: rowData.projectName,
        projectLeader: rowData.projectLeader,
        startDate: rowData.startDate,
        endDate: rowData.endDate,
        monday: rowData.monday,
        tuesday: rowData.tuesday,
        wednesday: rowData.wednesday,
        thursday: rowData.thursday,
        friday: rowData.friday,
      },
    });
    console.log("Data added successfully");
  } catch (error) {
    console.error("Error adding data:", error);
    throw error;
  }
};

// Function to update a specific cell in Google Sheets
export const updateRosterData = async (
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
    console.log("Cell updated successfully");
  } catch (error) {
    console.error("Error updating cell:", error);
    throw error;
  }
};

// Function to delete data from Google Sheets
export const deleteRosterData = async (id: number) => {
  try {
    await api.get(API_URL, {
      params: {
        module: module,
        action: "delete",
        id: id,
      },
    });
    console.log("Data deleted successfully");
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
};
