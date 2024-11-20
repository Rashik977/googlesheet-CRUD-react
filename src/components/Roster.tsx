import React, { useState } from "react";
import {
  addRosterData,
  readRosterData,
  updateRosterData,
} from "../api/RosterAPI";
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
import { RowData } from "@/interfaces/IRowData";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { LoadingCell } from "@/interfaces/ILoadingCell";
import { roster, weekdays } from "@/constants/constants";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { DatePickerWithRange } from "./DateRange";
import { dateConverter } from "@/utils/dateConverter";

interface RosterProps {
  data: RowData[];
  filteredData: RowData[];
  setFilteredData: React.Dispatch<React.SetStateAction<RowData[]>>;
  setData: React.Dispatch<React.SetStateAction<RowData[]>>;
}

const Roster: React.FC<RosterProps> = ({
  data,
  filteredData,
  setFilteredData,
  setData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loadingCells, setLoadingCells] = useState<LoadingCell[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const { handleSubmit } = useForm();

  const isLoading = (row: number, day: string) => {
    return loadingCells.some((cell) => cell.row === row && cell.day === day);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const headerRow = data[0];

    const newData = data
      .slice(1)
      .filter((row: RowData) =>
        row.projectName.toLowerCase().includes(e.target.value.toLowerCase())
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
      await updateRosterData(actualRowIndex + 1, column, value);
      const fetchedData = await readRosterData();
      setData(fetchedData);

      const headerRow = fetchedData[0];
      const filteredRows = fetchedData
        .slice(1)
        .filter((row: RowData) =>
          row.projectName.toLowerCase().includes(searchTerm.toLowerCase())
        );

      setFilteredData([headerRow, ...filteredRows]);

      toast.success("Roster updated successfully!");
    } catch {
      toast.error("Failed to update roster!");
    } finally {
      setLoadingCells((prev) =>
        prev.filter((cell) => !(cell.row === rowIndex && cell.day === day))
      );
    }
  };

  const onSubmit = async () => {
    try {
      toast.loading("Adding roster...");
      const formData = {
        projectName: name,
        projectLeader: email,
        monday: "WFH",
        tuesday: "WFH",
        wednesday: "WFH",
        thursday: "WFH",
        friday: "WFH",
        startDate: dateRange?.from ? format(dateRange.from, "yyyy/MM/dd") : "",
        endDate: dateRange?.to ? format(dateRange.to, "yyyy/MM/dd") : "",
      };
      await addRosterData(formData);

      const fetchedData = await readRosterData();
      setData(fetchedData);

      // Update filtered data while maintaining any existing search filter
      const headerRow = fetchedData[0];
      const newFilteredData = fetchedData
        .slice(1)
        .filter((row: RowData) =>
          searchTerm
            ? row.projectName.toLowerCase().includes(searchTerm.toLowerCase())
            : true
        );

      setFilteredData([headerRow, ...newFilteredData]);

      toast.dismiss();
      toast.success("Roster added successfully!");

      setName("");
      setEmail("");
    } catch {
      toast.error("Failed to add roster!");
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-center py-4">Roster Management</h1>
      <FormProvider {...useForm()}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-wrap gap-8 items-center justify-center p-8 rounded-lg shadow-md"
        >
          <FormField
            name="projectName"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row gap-6 items-center">
                <FormLabel className="font-semibold text-lg">
                  Project Name
                </FormLabel>
                <FormControl>
                  <input
                    placeholder="Enter project name"
                    {...field}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    value={name}
                    className="w-60 p-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-300 border-black border-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="projectLeader"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row gap-6 items-center">
                <FormLabel className="font-semibold text-lg">
                  Project Leader
                </FormLabel>
                <FormControl>
                  <input
                    placeholder="Enter project leader"
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
            name="dateRange"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row gap-6 items-center">
                <FormLabel className="font-semibold text-lg">
                  Date Range
                </FormLabel>
                <FormControl>
                  <DatePickerWithRange
                    className="w-[300px]"
                    date={dateRange}
                    setDate={setDateRange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="px-10 py-5">Add Roster</Button>
        </form>
      </FormProvider>

      <div className="flex justify-center my-4">
        <input
          type="text"
          placeholder="Search by Project Name"
          value={searchTerm}
          onChange={handleSearch}
          className="w-80 p-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-300 border-black border-2"
        />
      </div>

      <Table className="w-[100%] mx-auto rounded-lg shadow-lg">
        <TableCaption>A list of all rosters.</TableCaption>

        <TableBody>
          {filteredData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.projectName}</TableCell>
              <TableCell>{row.projectLeader}</TableCell>

              {index === 0 && (
                <>
                  <TableCell className="px-4 py-2">Start Date</TableCell>
                  <TableCell className="px-4 py-2">End Date</TableCell>
                  {weekdays.map((day, i) => (
                    <TableCell key={i} className="px-4 py-2">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </TableCell>
                  ))}
                </>
              )}

              {index > 0 && (
                <>
                  <TableCell className="px-4 py-2">
                    {isLoading(index, "startDate") ? (
                      <div className="flex items-center justify-center w-[100px] h-[30px]">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <input
                          className="border-[1px] border-gray-300 text-gray-600 rounded-md p-1"
                          type="date"
                          value={dateConverter(row.startDate)}
                          onChange={(e) =>
                            handleUpdate(index, 3, e.target.value, "startDate")
                          }
                        />
                      </>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {isLoading(index, "endDate") ? (
                      <div className="flex items-center justify-center w-[100px] h-[30px]">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <input
                        className="border-[1px] border-gray-300 text-gray-600 rounded-md p-1"
                        type="date"
                        value={dateConverter(row.endDate)}
                        onChange={(e) =>
                          handleUpdate(index, 4, e.target.value, "endDate")
                        }
                      />
                    )}
                  </TableCell>
                  {weekdays.map((day, i) => (
                    <TableCell key={i}>
                      {isLoading(index, day) ? (
                        <div className="flex items-center justify-center w-[80px] h-[30px]">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : (
                        <select
                          value={row[day as keyof RowData]}
                          onChange={(e) =>
                            handleUpdate(index, 5 + i, e.target.value, day)
                          }
                          className={`w-[80px] h-[30px] rounded-l ${
                            row[day as keyof RowData] === "WFH"
                              ? "bg-[#69c17c] text-white"
                              : row[day as keyof RowData] === "WFO"
                              ? "bg-[#4a805b] text-white"
                              : "bg-white text-black"
                          }`}
                        >
                          {Object.values(roster).map((option, j) => (
                            <option key={j} value={option}>
                              {option}
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

export default Roster;
