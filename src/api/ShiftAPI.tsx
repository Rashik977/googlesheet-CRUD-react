import { ShiftData } from "@/interfaces/IShiftData";
import axios from "axios";

const API_URL = import.meta.env.VITE_SHIFT_API_URL;

// Type definition for shift data

// Fetch data from Google Sheets
export const readData = async () => {
  try {
    const response = await axios.get(API_URL, { params: { action: "read" } });
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
  }
};

// Function to add data to Google Sheets
export const addData = async (shiftData: ShiftData) => {
  try {
    await axios.post(API_URL, null, {
      params: {
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
export const updateData = async (
  row: number,
  column: number,
  value: string
) => {
  try {
    await axios.post(API_URL, null, {
      params: {
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

// Function to delete data from Google Sheets
export const deleteData = async (id: number) => {
  try {
    await axios.post(API_URL, null, {
      params: {
        action: "delete",
        id: id,
      },
    });
    console.log("Shift data deleted successfully");
  } catch (error) {
    console.error("Error deleting shift data:", error);
  }
};

// Helper function to validate shift type
export const validateShiftType = (shift: string): boolean => {
  const validShifts = ["DAY_SHIFT", "EVENING_SHIFT", "LATE_EVENING_SHIFT"];
  return validShifts.includes(shift);
};

// Helper function to validate date format (MM/DD)
export const validateDate = (date: string): boolean => {
  const regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])$/;
  return regex.test(date);
};
