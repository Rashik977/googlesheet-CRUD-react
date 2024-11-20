import React, { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../components/ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { ShiftData } from "../interfaces/IShiftData";
import { Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingCell } from "@/interfaces/ILoadingCell";
import { shifts, weekdays } from "@/constants/constants";
import { addShiftData, readShiftData, updateShiftData } from "@/api/ShiftAPI";

interface ShiftProps {
  data: ShiftData[];
  filteredData: ShiftData[];
  setFilteredData: React.Dispatch<React.SetStateAction<ShiftData[]>>;
  setData: React.Dispatch<React.SetStateAction<ShiftData[]>>;
}

const Shift: React.FC<ShiftProps> = ({
  data,
  filteredData,
  setFilteredData,
  setData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingCells, setLoadingCells] = useState<LoadingCell[]>([]);

  const { handleSubmit } = useForm();

  const isLoading = (row: number, day: string) => {
    return loadingCells.some((cell) => cell.row === row && cell.day === day);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const headerRow = data[0];

    const newData = data
      .slice(1)
      .filter((row: ShiftData) =>
        row.email.toLowerCase().includes(e.target.value.toLowerCase())
      );

    setFilteredData([headerRow, ...newData]);
  };

  const handleUpdate = async (
    rowIndex: number,
    column: number,
    value: string,
    day: string
  ) => {
    setLoadingCells((prev) => [...prev, { row: rowIndex, day }]);

    const actualRowIndex = data.findIndex(
      (row) => row === filteredData[rowIndex]
    );

    try {
      await updateShiftData(actualRowIndex + 1, column, value);
      const fetchedData = await readShiftData();
      setData(fetchedData);

      // Apply the current search filter to the updated data
      const headerRow = fetchedData[0];
      const filteredRows = fetchedData
        .slice(1)
        .filter((row: ShiftData) =>
          row.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

      setFilteredData([headerRow, ...filteredRows]);

      toast.success("Shift updated successfully!");
    } catch {
      toast.error("Failed to update shift!");
    } finally {
      setLoadingCells((prev) =>
        prev.filter((cell) => !(cell.row === rowIndex && cell.day === day))
      );
    }
  };

  const dateConverter = (date: string) => {
    const [year, month, day] = date.split("T")[0].split("-");
    return `${year}/${month}/${day}`;
  };

  const onSubmit = async () => {
    try {
      toast.loading("Adding shift...");
      await addShiftData({
        email,
        joinDate,
        endDate,
        monday: "DAY",
        tuesday: "DAY",
        wednesday: "DAY",
        thursday: "DAY",
        friday: "DAY",
      });
      const fetchedData = await readShiftData();
      setData(fetchedData);
      // Update filtered data while maintaining any existing search filter
      const headerRow = fetchedData[0];
      const newFilteredData = fetchedData
        .slice(1)
        .filter((row: ShiftData) =>
          searchTerm
            ? row.email.toLowerCase().includes(searchTerm.toLowerCase())
            : true
        );

      setFilteredData([headerRow, ...newFilteredData]);

      toast.dismiss();
      toast.success("Shift added successfully!");

      // Clear form fields
      setEmail("");
      setJoinDate("");
      setEndDate("");
    } catch {
      toast.error("Failed to add shift!");
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-center py-4">Shift Management</h1>
      <ToastContainer />

      <FormProvider {...useForm()}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-wrap gap-5 items-center p-8 rounded-lg shadow-md"
        >
          <div className="flex gap-5">
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row gap-6 items-center">
                  <FormLabel className="font-semibold text-lg">Email</FormLabel>
                  <FormControl>
                    <input
                      placeholder="Enter employee email"
                      {...field}
                      onChange={(e) => setEmail(e.target.value)}
                      type="text"
                      value={email}
                      className="w-60 p-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-300 border-black border-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="joinDate"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row gap-6 items-center">
                  <FormLabel className="font-semibold text-lg">
                    Join Date
                  </FormLabel>
                  <FormControl>
                    <input
                      placeholder="YYYY/MM/DD"
                      {...field}
                      onChange={(e) => setJoinDate(e.target.value)}
                      type="text"
                      value={joinDate}
                      className="w-60 p-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-300 border-black border-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row gap-6 items-center">
                  <FormLabel className="font-semibold text-lg">
                    End Date
                  </FormLabel>
                  <FormControl>
                    <input
                      placeholder="YYYY/MM/DD"
                      {...field}
                      onChange={(e) => setEndDate(e.target.value)}
                      type="text"
                      value={endDate}
                      className="w-60 p-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-300 border-black border-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-center items-center w-full">
            <Button className="px-10 py-5">Add Shift</Button>
          </div>
        </form>
      </FormProvider>

      <div className="flex justify-center my-4">
        <input
          type="text"
          placeholder="Search by Email"
          value={searchTerm}
          onChange={handleSearch}
          className="w-80 p-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-300 border-black border-2"
        />
      </div>

      <Table className="w-[100%] mx-auto rounded-lg shadow-lg">
        <TableCaption>A list of all shifts.</TableCaption>

        <TableBody>
          {filteredData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.email}</TableCell>

              {index === 0 && (
                <>
                  <TableCell>Join Date</TableCell>
                  <TableCell>End Date</TableCell>
                </>
              )}

              {index > 0 && (
                <>
                  <TableCell className="px-4 py-2">
                    {dateConverter(row.joinDate)}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {dateConverter(row.endDate)}
                  </TableCell>
                </>
              )}
              {index === 0 && (
                <>
                  {weekdays.map((day, i) => (
                    <TableCell key={i} className="px-4 py-2">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </TableCell>
                  ))}
                </>
              )}

              {index > 0 && (
                <>
                  {weekdays.map((day, i) => (
                    <TableCell key={i}>
                      {isLoading(index, day) ? (
                        <div className="flex items-center justify-center w-[100px] h-[30px]">
                          <Loader2 className="h-6 animate-spin" />
                        </div>
                      ) : (
                        <select
                          value={row[day as keyof ShiftData]}
                          onChange={(e) =>
                            handleUpdate(index, 4 + i, e.target.value, day)
                          }
                          className={`w-[100px] h-[30px] rounded-lg ${
                            row[day as keyof ShiftData] === "MORNING"
                              ? "bg-[#fee5a0]"
                              : row[day as keyof ShiftData] === "DAY"
                              ? "bg-[#E8EAED]"
                              : row[day as keyof ShiftData] === "EVENING"
                              ? "bg-[#F6C7A9]"
                              : row[day as keyof ShiftData] === "LATE"
                              ? "bg-[#3D3D3D] text-white"
                              : "bg-white"
                          }`}
                        >
                          {Object.values(shifts).map((shift, j) => (
                            <option key={j} value={shift}>
                              {shift}
                            </option>
                          ))}
                        </select>
                      )}
                    </TableCell>
                  ))}
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default Shift;
