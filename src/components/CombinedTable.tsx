// CombinedTable.tsx
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MainData } from "../interfaces/IMainData";
import { RowData } from "../interfaces/IRowData";
import { ShiftData } from "../interfaces/IShiftData";
import { CombinedData } from "@/interfaces/ICombinedData";
import { Button } from "./ui/button";
import { LogEntry } from "@/interfaces/ILog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { History } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TruncatedCell from "./TruncatedCell";
import { roster, shifts, weekdays } from "@/constants/constants";
import { readLogData, setLogsData } from "@/api/LogAPI";

interface CombinedTableProps {
  mainData: MainData[];
  rosterData: RowData[];
  shiftData: ShiftData[];
  startDate: string;
  endDate: string;
}

const CombinedTable: React.FC<CombinedTableProps> = ({
  mainData,
  rosterData,
  shiftData,
  startDate,
  endDate,
}) => {
  const [combinedData, setCombinedData] = useState<CombinedData[]>([]);
  const [originalData, setOriginalData] = useState<CombinedData[]>([]);
  const [logData, setLogData] = useState<LogEntry[]>([]);
  const [dateColumns, setDateColumns] = useState<string[]>([]);

  // Helper function to get dates between range (excluding weekends)
  const getWorkingDays = (start: string, end: string) => {
    if (!start || !end) return [];
    const dates: string[] = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        // Skip Saturday (6) and Sunday (0)
        dates.push(current.toISOString().split("T")[0]);
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  useEffect(() => {
    if (startDate && endDate) {
      setDateColumns(getWorkingDays(startDate, endDate));
    }
  }, [startDate, endDate]);

  useEffect(() => {
    // Fetch log data when component mounts
    readLogData().then((fetchedLogData) => {
      setLogData(fetchedLogData);
    });
  }, []);

  useEffect(() => {
    if (
      mainData.length === 0 ||
      rosterData.length === 0 ||
      shiftData.length === 0 ||
      dateColumns.length === 0
    )
      return;

    const combinedDataMap = new Map();
    const mainDataByEmail = mainData.slice(1).reduce((acc, curr) => {
      if (!acc.has(curr.email)) {
        acc.set(curr.email, []);
      }
      acc.get(curr.email).push(curr);
      return acc;
    }, new Map());

    mainDataByEmail.forEach((personAllocations, email) => {
      const matchingShift = shiftData.find((shift) => shift.email === email);
      const allProjectRosters = personAllocations.flatMap(
        (allocation: MainData) =>
          rosterData.filter(
            (roster) =>
              roster.projectName === allocation.allocation &&
              new Date(roster.startDate) <= new Date(endDate) &&
              new Date(roster.endDate) >= new Date(startDate)
          )
      );

      const matchingPeopleRoster = rosterData.filter(
        (roster) =>
          roster.projectName === email &&
          new Date(roster.startDate) <= new Date(endDate) &&
          new Date(roster.endDate) >= new Date(startDate)
      );

      const allRosters = [...allProjectRosters, ...matchingPeopleRoster];

      const dailyData: { [key: string]: string } = {};
      dateColumns.forEach((date) => {
        const dayOfWeek = new Date(date).getDay();
        const weekday = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ][dayOfWeek].toLowerCase();

        dailyData[date] = "N/A";

        allRosters.forEach((roster) => {
          if (
            new Date(roster.startDate) <= new Date(date) &&
            new Date(roster.endDate) >= new Date(date)
          ) {
            if (roster[weekday as keyof RowData] === "WFO") {
              dailyData[date] = `WFO`;
            } else if (
              roster[weekday as keyof RowData] === "WFH" &&
              dailyData[date] !== "WFO"
            ) {
              dailyData[date] = `WFH`;
            }
          }
        });

        if (matchingShift) {
          dailyData[date] = `${dailyData[date]}/ ${
            matchingShift[weekday as keyof ShiftData] || ""
          }`;
        }
      });

      const baseAllocation = personAllocations[0];
      const combinedRecord = {
        email: baseAllocation.email,
        projectName: baseAllocation.projectName || "N/A",
        allocation: personAllocations
          .map((a: MainData) => a.allocation)
          .join(", "),
        ...dailyData,
      };

      combinedDataMap.set(email, combinedRecord);
    });

    setCombinedData(Array.from(combinedDataMap.values()));
    setOriginalData(Array.from(combinedDataMap.values()));
  }, [mainData, rosterData, shiftData, dateColumns, startDate, endDate]);

  const getLogHistoryForCell = (email: string, day: string) => {
    return logData
      .filter((log) => log.email === email && log.day.toLowerCase() === day)
      .sort(
        (a, b) =>
          new Date(b.timestamp || "").getTime() -
          new Date(a.timestamp || "").getTime()
      )
      .slice(0, 3);
  };

  const formatDateTime = (timestamp?: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleValueChange = (
    rowIndex: number,
    day: string,
    type: "roster" | "shift",
    value: string
  ) => {
    setCombinedData((prevData) => {
      const newData = [...prevData] as any;
      const currentValues = newData[rowIndex][day].split("/");

      if (type === "roster") {
        currentValues[0] = value;
      } else {
        currentValues[1] = ` ${value}`;
      }

      newData[rowIndex] = {
        ...newData[rowIndex],
        [day]: currentValues.join("/"),
      };

      return newData;
    });
  };

  const getSelectStyle = (type: "roster" | "shift", value: string) => {
    if (type === "roster") {
      return value === "WFH"
        ? "bg-[#69c17c] text-white"
        : value === "WFO"
        ? "bg-[#4a805b] text-white"
        : "bg-white text-black";
    } else {
      return value === "MORNING"
        ? "bg-[#fee5a0] text-black"
        : value === "DAY"
        ? "bg-[#E8EAED] text-black"
        : value === "EVENING"
        ? "bg-[#F6C7A9] text-black"
        : value === "LATE"
        ? "bg-[#3D3D3D] text-white"
        : "bg-white";
    }
  };

  const handleLog = async () => {
    try {
      toast.loading("Logging changes...");
      const changes: LogEntry[] = [];
      combinedData.forEach((currentRow: any, index) => {
        const originalRow = originalData[index] as any;

        weekdays.forEach((day: any) => {
          const [currentRoster, currentShift] = currentRow[day]
            .split("/")
            .map((v: string) => v.trim());
          const [originalRoster, originalShift] = originalRow[day]
            .split("/")
            .map((v: string) => v.trim());

          if (currentRoster !== originalRoster && originalRoster !== "N/A") {
            changes.push({
              email: currentRow.email,
              day,
              field: "roster",
              oldValue: originalRoster,
              newValue: currentRoster,
              changedBy: "user@example.com",
              timestamp: new Date().toISOString(),
            });
          }

          if (currentShift !== originalShift && originalShift !== "N/A") {
            changes.push({
              email: currentRow.email,
              day,
              field: "shift",
              oldValue: originalShift,
              newValue: currentShift,
              changedBy: "user@example.com",
              timestamp: new Date().toISOString(),
            });
          }
        });
      });

      if (changes.length > 0) {
        await setLogsData(changes);
        setOriginalData([...combinedData]);
        // Update log data with new changes
        setLogData((prevLogs) => [...changes, ...prevLogs]);
        console.log("Changes logged successfully");
      }
      toast.dismiss();
      toast.success("Changes Logged Successfully");
      toast.dismiss();
    } catch (error) {
      toast.error("Error Logging Changes");
    }
  };

  return (
    <div className="w-[95%] flex flex-col justify-center items-center">
      <ToastContainer />
      <TooltipProvider>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table className="w-full mx-auto rounded-lg shadow-lg">
              <TableCaption className="text-lg py-4">
                Combined Roster, Shift, and Main Data
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableCell className="sticky left-0 bg-white z-10">
                    Email
                  </TableCell>
                  <TableCell className="sticky left-[150px] bg-white z-10">
                    Allocation
                  </TableCell>
                  {dateColumns.map((date) => (
                    <TableCell key={date}>
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedData.map((row: any, index) => (
                  <TableRow key={index}>
                    <TableCell className="sticky left-0 bg-white z-10">
                      {row.email}
                    </TableCell>
                    <TableCell className="sticky left-[150px] bg-white z-10">
                      <TruncatedCell text={row.allocation} />
                    </TableCell>
                    {dateColumns.map((date) => {
                      const [rosterValue, shiftValue] = (row[date] || "N/A/ ")
                        .split("/")
                        .map((v: string) => v.trim());

                      return (
                        <TableCell key={date} className="p-2">
                          <div className="flex gap-3">
                            <select
                              value={rosterValue}
                              onChange={(e) =>
                                handleValueChange(
                                  index,
                                  date,
                                  "roster",
                                  e.target.value
                                )
                              }
                              className={`w-[80px] h-[30px] rounded-lg ${getSelectStyle(
                                "roster",
                                rosterValue
                              )}`}
                            >
                              {Object.values(roster).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <select
                              value={shiftValue}
                              onChange={(e) =>
                                handleValueChange(
                                  index,
                                  date,
                                  "shift",
                                  e.target.value
                                )
                              }
                              className={`w-[100px] h-[30px] rounded-lg ${getSelectStyle(
                                "shift",
                                shiftValue
                              )}`}
                            >
                              {Object.values(shifts).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </TooltipProvider>

      <Button className="m-4 w-16 flex-end p-5" onClick={handleLog}>
        LOG
      </Button>
    </div>
  );
};

export default CombinedTable;
