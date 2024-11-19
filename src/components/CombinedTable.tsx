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
}

const CombinedTable: React.FC<CombinedTableProps> = ({
  mainData,
  rosterData,
  shiftData,
}) => {
  const [combinedData, setCombinedData] = useState<CombinedData[]>([]);
  const [originalData, setOriginalData] = useState<CombinedData[]>([]);
  const [logData, setLogData] = useState<LogEntry[]>([]);

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
      shiftData.length === 0
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
            (roster) => roster.projectName === allocation.allocation
          )
      );
      const matchingPeopleRoster = rosterData.filter(
        (roster) => roster.projectName === email
      );
      const allRosters = [...allProjectRosters, ...matchingPeopleRoster];
      const weeklyRoster = {
        monday: "N/A",
        tuesday: "N/A",
        wednesday: "N/A",
        thursday: "N/A",
        friday: "N/A",
      };
      (allRosters as RowData[]).forEach((roster) => {
        (weekdays as (keyof typeof weeklyRoster)[]).forEach((day) => {
          if (roster[day] === "WFO") {
            weeklyRoster[day] = `WFO`;
          } else if (roster[day] === "WFH") {
            if (weeklyRoster[day] !== "WFO") {
              weeklyRoster[day] = `WFH`;
            }
          }
        });
      });
      (weekdays as (keyof typeof weeklyRoster)[]).forEach((day) => {
        weeklyRoster[day] = `${weeklyRoster[day]}/ ${
          matchingShift?.[day] || ""
        }`;
      });
      const baseAllocation = personAllocations[0];
      const combinedRecord = {
        ...baseAllocation,
        projectName: baseAllocation.projectName || "N/A",
        allocation: personAllocations
          .map((a: MainData) => a.allocation)
          .join(", "),
        ...weeklyRoster,
      };
      combinedDataMap.set(email, combinedRecord);
    });
    setCombinedData(Array.from(combinedDataMap.values()));
    setOriginalData(Array.from(combinedDataMap.values()));
  }, [mainData, rosterData, shiftData]);

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
    } catch (error) {
      toast.error("Error Logging Changes");
    }
  };

  return (
    <div className="w-[95%] flex flex-col justify-center items-center">
      <ToastContainer />
      <TooltipProvider>
        <Table className="w-full mx-auto rounded-lg shadow-lg">
          <TableCaption className="text-lg py-4">
            Combined Roster, Shift, and Main Data
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Allocation</TableCell>
              {weekdays.map((day) => (
                <TableCell key={day}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinedData.length > 0 ? (
              combinedData.map((row: any, index) => (
                <TableRow key={index}>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <TruncatedCell text={row.allocation} />
                  </TableCell>

                  {weekdays.map((day) => {
                    const [rosterValue, shiftValue] = row[day]
                      .split("/")
                      .map((v: string) => v.trim());
                    const cellHistory = getLogHistoryForCell(row.email, day);

                    return (
                      <TableCell key={day} className="p-2">
                        <div className="flex gap-3 ">
                          <div className="flex gap-3">
                            <select
                              value={rosterValue}
                              onChange={(e) =>
                                handleValueChange(
                                  index,
                                  day,
                                  "roster",
                                  e.target.value
                                )
                              }
                              className={`w-[80px] h-[30px] rounded-lg ${getSelectStyle(
                                "roster",
                                rosterValue
                              )}`}
                            >
                              <option value="N/A">N/A</option>
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
                                  day,
                                  "shift",
                                  e.target.value
                                )
                              }
                              className={`w-[100px] h-[30px] rounded-lg ${getSelectStyle(
                                "shift",
                                shiftValue
                              )}`}
                            >
                              <option value="N/A">N/A</option>
                              {Object.values(shifts).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                          {cellHistory.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger>
                                <History className="h-4 text-gray-500" />
                              </TooltipTrigger>
                              <TooltipContent className="w-64 p-2">
                                <div className="space-y-2">
                                  <p className="font-semibold">
                                    Change History:
                                  </p>
                                  {cellHistory.map((log, i) => (
                                    <div key={i} className="text-sm">
                                      <span className="text-gray-500">
                                        {formatDateTime(log.timestamp)}
                                      </span>
                                      <br />
                                      <span className="capitalize">
                                        {log.field}:
                                      </span>{" "}
                                      <span
                                        className={
                                          getSelectStyle(
                                            log.field as "roster" | "shift",
                                            log.oldValue
                                          ) + " p-[3px] rounded-md"
                                        }
                                      >
                                        {log.oldValue}
                                      </span>
                                      {" → "}
                                      <span
                                        className={
                                          getSelectStyle(
                                            log.field as "roster" | "shift",
                                            log.newValue
                                          ) + " p-[3px] rounded-md"
                                        }
                                      >
                                        {log.newValue}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="w-full text-center">
                <TableCell colSpan={weekdays.length + 4} className="py-4">
                  <div className="flex justify-center items-center">
                    <div className="loader"></div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TooltipProvider>

      <Button className="m-4 w-16 flex-end p-5" onClick={handleLog}>
        LOG
      </Button>
    </div>
  );
};

export default CombinedTable;
