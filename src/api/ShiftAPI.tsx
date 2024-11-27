import { API_URL } from "@/config";
import { ShiftData } from "@/interfaces/IShiftData";
import api from "./api";

const module = "shift";

// Fetch data from Google Sheets
export const readShiftData = async () => {
  try {
    const response = await api.get(API_URL, {
      params: {
        module: module,
        action: "read",
        permission: "manage_shifts",
      },
    });
    const fetchedData = response.data.map((row: string[]) => ({
      email: row[0],
      joinDate: row[1],
      endDate: row[2],
      monday: row[3],
      tuesday: row[4],
      wednesday: row[5],
      thursday: row[6],
      friday: row[7],
    }));
    return fetchedData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Function to add data to Google Sheets
export const addShiftData = async (shiftData: ShiftData) => {
  try {
    await api.get(API_URL, {
      params: {
        module: module,
        action: "create",
        email: shiftData.email,
        joinDate: shiftData.joinDate,
        endDate: shiftData.endDate,
        monday: shiftData.monday,
        tuesday: shiftData.tuesday,
        wednesday: shiftData.wednesday,
        thursday: shiftData.thursday,
        friday: shiftData.friday,
      },
    });
    console.log("Shift data added successfully");
  } catch (error) {
    console.error("Error adding shift data:", error);
  }
};

// Function to update a specific cell in Google Sheets
export const updateShiftData = async (
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
    console.log("Shift cell updated successfully");
  } catch (error) {
    console.error("Error updating shift cell:", error);
  }
};

export const deleteShiftData = async (id: number) => {
  try {
    await api.get(API_URL, {
      params: {
        module: module,
        action: "delete",
        id: id,
      },
    });
    console.log("Shift data deleted successfully");
  } catch (error) {
    console.error("Error deleting shift data:", error);
  }
};
