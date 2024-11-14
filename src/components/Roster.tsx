import React, { useEffect, useState } from "react";
import { addData, readData, updateData } from "../api/RosterAPI"; // import the updateData function
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { RowData } from "@/interfaces/IRowData";

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
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [filteredRosterData, setFilteredRosterData] = useState<RowData[]>([]);

  const { handleSubmit } = useForm();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      setFilteredData(data); // Reset filter if search is empty
    } else {
      const headerRow = data[0];
      const newFilteredData = data
        .slice(1)
        .filter((row: RowData) =>
          row.projectName.toLowerCase().includes(e.target.value.toLowerCase())
        );
      setFilteredData([headerRow, ...newFilteredData]);
    }
  };

  const handleUpdate = async (
    rowIndex: number,
    column: number,
    value: string
  ) => {
    const actualRowIndex = data.findIndex(
      (row) => row === filteredData[rowIndex]
    );
    await updateData(actualRowIndex + 1, column, value); // Adjust for sheet index
    readData().then((fetchedData) => {
      setData(fetchedData);
      setFilteredData(
        fetchedData.filter((row: RowData) =>
          row.projectName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    });
  };

  const onSubmit = async () => {
    await addData(name, email);
    readData().then((fetchedData) => {
      setData(fetchedData);
    });
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-center py-4">Roster Management</h1>

      <FormProvider {...useForm()}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex gap-8 items-center justify-center p-8 rounded-lg shadow-md"
        >
          <FormField
            name="username"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row gap-6 items-center ">
                <FormLabel className="font-semibold text-lg">
                  Project/Person Name
                </FormLabel>
                <FormControl>
                  <input
                    placeholder="Enter project name"
                    {...field}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    value={name}
                    className="w-60 p-2 -800 rounded-md focus:outline-none focus:ring focus:ring-indigo-300 border-black border-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row gap-6 items-center text-black">
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
                    className="w-60 p-2 -800 rounded-md focus:outline-none focus:ring focus:ring-indigo-300 border-black border-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="px-10 py-5">Add</Button>
        </form>
      </FormProvider>

      <div className="flex justify-center  items-center">
        {/* Search Field */}
        <div className="flex justify-center my-4">
          <input
            type="text"
            placeholder="Search by Project/Person Name"
            value={searchTerm}
            onChange={handleSearch}
            className="w-80 p-2 -800 rounded-md focus:outline-none focus:ring focus:ring-indigo-300 border-black border-2 my-2"
          />
        </div>
        {/* <Popover>
          <PopoverTrigger>
            <Button className="w-[240px] pl-3 text-left font-normal">
              <span>Pick a date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
            />
          </PopoverContent>
        </Popover> */}
      </div>

      <Table className="w-[100%] mx-auto  rounded-lg shadow-lg">
        <TableCaption className="-400 py-4">
          A list of all members.
        </TableCaption>
        <TableHeader></TableHeader>
        <TableBody>
          {filteredData.length > 0 ? (
            filteredData.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="px-4 py-2">{row.projectName}</TableCell>
                <TableCell className="px-4 py-2">{row.projectLeader}</TableCell>

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
                    <TableCell className="px-4 py-2 text-white">
                      <select
                        name="monday"
                        value={row.monday}
                        onChange={(e) => handleUpdate(index, 3, e.target.value)}
                        className={
                          row.monday === "WFH" ? "bg-[#69c17c]" : "bg-[#4a805b]"
                        }
                      >
                        <option value="WFH">WFH</option>
                        <option value="WFO">WFO</option>
                      </select>
                    </TableCell>
                    <TableCell className="px-4 py-2 text-white">
                      <select
                        name="tuesday"
                        value={row.tuesday}
                        onChange={(e) => handleUpdate(index, 4, e.target.value)}
                        className={
                          row.tuesday === "WFH"
                            ? "bg-[#69c17c]"
                            : "bg-[#4a805b]"
                        }
                      >
                        <option value="WFH">WFH</option>
                        <option value="WFO">WFO</option>
                      </select>
                    </TableCell>
                    <TableCell className="px-4 py-2 text-white">
                      <select
                        name="wednesday"
                        value={row.wednesday}
                        onChange={(e) => handleUpdate(index, 5, e.target.value)}
                        className={
                          row.wednesday === "WFH"
                            ? "bg-[#69c17c]"
                            : "bg-[#4a805b]"
                        }
                      >
                        <option value="WFH">WFH</option>
                        <option value="WFO">WFO</option>
                      </select>
                    </TableCell>
                    <TableCell className="px-4 py-2 text-white">
                      <select
                        name="thursday"
                        value={row.thursday}
                        onChange={(e) => handleUpdate(index, 6, e.target.value)}
                        className={
                          row.thursday === "WFH"
                            ? "bg-[#69c17c]"
                            : "bg-[#4a805b]"
                        }
                      >
                        <option value="WFH">WFH</option>
                        <option value="WFO">WFO</option>
                      </select>
                    </TableCell>
                    <TableCell className="px-4 py-2 text-white">
                      <select
                        name="friday"
                        value={row.friday}
                        onChange={(e) => handleUpdate(index, 7, e.target.value)}
                        className={
                          row.friday === "WFH" ? "bg-[#69c17c]" : "bg-[#4a805b]"
                        }
                      >
                        <option value="WFH">WFH</option>
                        <option value="WFO">WFO</option>
                      </select>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={2}
                className="text-center py-6 -400 flex items-center justify-center"
              >
                <div className="loader "></div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default Roster;
