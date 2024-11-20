import { API_URL } from "@/config";
import { RowData } from "@/interfaces/IRowData";
import axios from "axios";

const module = "roster";

// Fetch data from Google Sheets
export const readRosterData = async () => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        module: module,
        action: "read",
      },
    });
    const fetchedData = response.data.map((row: string[]) => ({
      projectName: row[0],
      projectLeader: row[1],
      monday: row[2],
      tuesday: row[3],
      wednesday: row[4],
      thursday: row[5],
      friday: row[6],
    }));
    return fetchedData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Function to add data to Google Sheets
export const addRosterData = async (rowData: RowData) => {
  try {
    await axios.get(API_URL, {
      params: {
        module: module,
        action: "create",
        projectName: rowData.projectName,
        projectLeader: rowData.projectLeader,
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
  }
};

// Function to update a specific cell in Google Sheets
export const updateRosterData = async (
  row: number,
  column: number,
  value: string
) => {
  try {
    await axios.get(API_URL, {
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
  }
};

// Function to delete data from Google Sheets
export const deleteRosterData = async (id: number) => {
  try {
    await axios.get(API_URL, {
      params: {
        module: module,
        action: "delete",
        id: id,
      },
    });
    console.log("Data deleted successfully");
  } catch (error) {
    console.error("Error deleting data:", error);
  }
};
