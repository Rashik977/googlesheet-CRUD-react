import React, { useEffect, useState } from "react";
import { addData, readData, updateData } from "./ShiftAPI"; // import ShiftAPI functions
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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../components/ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { ShiftData } from "../interfaces/IShiftData";

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

  const { handleSubmit } = useForm();

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
    value: string
  ) => {
    const actualRowIndex = data.findIndex(
      (row) => row === filteredData[rowIndex]
    );
    await updateData(actualRowIndex + 1, column, value);
    readData().then((fetchedData) => {
      setData(fetchedData);
      setFilteredData(
        fetchedData.filter((row: ShiftData) =>
          row.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    });
  };

  const onSubmit = async () => {
    await addData({
      email,
      joinDate,
      endDate,
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
    });
    readData().then((fetchedData) => {
      setData(fetchedData);
    });
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-center py-4">Shift Management</h1>

      <FormProvider {...useForm()}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-wrap gap-8 items-center justify-center p-8 rounded-lg shadow-md"
        >
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
                    placeholder="MM/DD"
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
                    placeholder="MM/DD"
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
          <Button className="px-10 py-5">Add Shift</Button>
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
              <TableCell>{row.joinDate}</TableCell>
              <TableCell>{row.endDate}</TableCell>

              {index === 0 && (
                <>
                  <TableCell className="px-4 py-2">Monday</TableCell>
                  <TableCell className="px-4 py-2">Tuesday</TableCell>
                  <TableCell className="px-4 py-2">Wednesday</TableCell>
                  <TableCell className="px-4 py-2">Thursday</TableCell>
                  <TableCell className="px-4 py-2">Friday</TableCell>
                </>
              )}

              {index > 0 && (
                <>
                  <TableCell>
                    <select
                      value={row.monday}
                      onChange={(e) => handleUpdate(index, 4, e.target.value)}
                      className="bg-gray-200"
                    >
                      <option value="MORNING_SHIFT">MORNING_SHIFT</option>
                      <option value="DAY_SHIFT">DAY_SHIFT</option>
                      <option value="EVENING_SHIFT">EVENING_SHIFT</option>
                      <option value="LATE_EVENING_SHIFT">
                        LATE_EVENING_SHIFT
                      </option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      value={row.tuesday}
                      onChange={(e) => handleUpdate(index, 5, e.target.value)}
                      className="bg-gray-200"
                    >
                      <option value="MORNING_SHIFT">MORNING_SHIFT</option>
                      <option value="DAY_SHIFT">DAY_SHIFT</option>
                      <option value="EVENING_SHIFT">EVENING_SHIFT</option>
                      <option value="LATE_EVENING_SHIFT">
                        LATE_EVENING_SHIFT
                      </option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      value={row.wednesday}
                      onChange={(e) => handleUpdate(index, 6, e.target.value)}
                      className="bg-gray-200"
                    >
                      <option value="MORNING_SHIFT">MORNING_SHIFT</option>
                      <option value="DAY_SHIFT">DAY_SHIFT</option>
                      <option value="EVENING_SHIFT">EVENING_SHIFT</option>
                      <option value="LATE_EVENING_SHIFT">
                        LATE_EVENING_SHIFT
                      </option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      value={row.thursday}
                      onChange={(e) => handleUpdate(index, 7, e.target.value)}
                      className="bg-gray-200"
                    >
                      <option value="MORNING_SHIFT">MORNING_SHIFT</option>
                      <option value="DAY_SHIFT">DAY_SHIFT</option>
                      <option value="EVENING_SHIFT">EVENING_SHIFT</option>
                      <option value="LATE_EVENING_SHIFT">
                        LATE_EVENING_SHIFT
                      </option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      value={row.friday}
                      onChange={(e) => handleUpdate(index, 8, e.target.value)}
                      className="bg-gray-200"
                    >
                      <option value="MORNING_SHIFT">MORNING_SHIFT</option>
                      <option value="DAY_SHIFT">DAY_SHIFT</option>
                      <option value="EVENING_SHIFT">EVENING_SHIFT</option>
                      <option value="LATE_EVENING_SHIFT">
                        LATE_EVENING_SHIFT
                      </option>
                    </select>
                  </TableCell>
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
