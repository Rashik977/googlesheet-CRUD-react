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
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "react-toastify";
import TruncatedCell from "./TruncatedCell";
import { roster, shifts, weekdays } from "@/constants/constants";
import { readLogData, setLogsData } from "@/api/LogAPI";
import { getSelectStyle } from "@/utils/getSelectStyle";
import { LogHistoryTooltip } from "./logHistoryToolTip";
import { getWorkingDays } from "@/utils/getWorkingDays";
import { useAuth } from "@/context/AuthContext";

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

  const { user } = useAuth();

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
      dateColumns.length === 0 ||
      logData.length === 0
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
      // Find shifts specific to this email
      const personShifts = shiftData.find((shift) => shift.email === email);

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

        // Initialize with N/A for both roster and shift
        dailyData[date] = "N/A/ N/A";

        // Check if the current date is within the shift's date range
        const currentDate = new Date(date);
        const isWithinShiftDateRange =
          personShifts &&
          currentDate >= new Date(personShifts.joinDate) &&
          currentDate <= new Date(personShifts.endDate);

        // Handle roster first
        allRosters.forEach((roster) => {
          if (
            new Date(roster.startDate) <= currentDate &&
            new Date(roster.endDate) >= currentDate
          ) {
            const existingShift = dailyData[date]
              .split("/")
              .map((v) => v.trim())[1];
            if (roster[weekday as keyof RowData] === "WFO") {
              dailyData[date] = `WFO/ ${existingShift}`;
            } else if (
              roster[weekday as keyof RowData] === "WFH" &&
              dailyData[date].split("/")[0] !== "WFO"
            ) {
              dailyData[date] = `WFH/ ${existingShift}`;
            }
          }
        });

        // Handle shifts
        if (isWithinShiftDateRange) {
          const shiftValue = personShifts[weekday as keyof ShiftData];
          if (shiftValue && shiftValue !== "N/A") {
            const [existingRoster] = dailyData[date]
              .split("/")
              .map((v) => v.trim());
            dailyData[date] = `${existingRoster}/ ${shiftValue}`;
          }
        }

        // Handle logs - IMPORTANT: Keep track of both roster and shift separately
        const rosterLogs = logData
          .filter(
            (log) =>
              log.email === email &&
              log.field === "roster" &&
              new Date(log.date || "").toISOString().split("T")[0] ===
                new Date(date).toISOString().split("T")[0]
          )
          .sort(
            (a, b) =>
              new Date(b.timestamp || "").getTime() -
              new Date(a.timestamp || "").getTime()
          );

        const shiftLogs = logData
          .filter(
            (log) =>
              log.email === email &&
              log.field === "shift" &&
              new Date(log.date || "").toISOString().split("T")[0] ===
                new Date(date).toISOString().split("T")[0]
          )
          .sort(
            (a, b) =>
              new Date(b.timestamp || "").getTime() -
              new Date(a.timestamp || "").getTime()
          );

        // Apply roster logs while preserving shift
        if (rosterLogs.length > 0) {
          const existingShift = dailyData[date]
            .split("/")
            .map((v) => v.trim())[1];
          dailyData[date] = `${rosterLogs[0].newValue}/ ${existingShift}`;
        }

        // Apply shift logs while preserving roster
        if (shiftLogs.length > 0) {
          const [existingRoster] = dailyData[date]
            .split("/")
            .map((v) => v.trim());
          dailyData[date] = `${existingRoster}/ ${shiftLogs[0].newValue}`;
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
  }, [
    mainData,
    rosterData,
    shiftData,
    dateColumns,
    startDate,
    endDate,
    logData,
  ]);

  const getLogHistoryForCell = (email: string, date: string) => {
    return logData
      .filter(
        (log) =>
          log.email === email &&
          new Date(log.date || "").toISOString().split("T")[0] === date
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp || "").getTime() -
          new Date(a.timestamp || "").getTime()
      )
      .slice(0, 3);
  };

  const handleValueChange = (
    rowIndex: number,
    date: string,

    type: "roster" | "shift",
    value: string
  ) => {
    setCombinedData((prevData) => {
      const newData = [...prevData] as CombinedData[];
      const currentValues =
        newData[rowIndex][date as keyof CombinedData].split("/");

      if (type === "roster") {
        currentValues[0] = value;
      } else {
        currentValues[1] = ` ${value}`;
      }

      newData[rowIndex] = {
        ...newData[rowIndex],
        [date as keyof CombinedData]: currentValues.join("/"),
      };

      return newData;
    });
  };

  const handleLog = async () => {
    try {
      toast.loading("Logging changes...");
      const changes: LogEntry[] = [];

      combinedData.forEach((currentRow: CombinedData, index) => {
        const originalRow = originalData[index];

        dateColumns.forEach((date) => {
          const [currentRoster, currentShift] = currentRow[
            date as keyof CombinedData
          ]
            .split("/")
            .map((v: string) => v.trim());
          const [originalRoster, originalShift] = originalRow[
            date as keyof CombinedData
          ]
            .split("/")
            .map((v: string) => v.trim());

          const day = new Date(date)
            .toLocaleDateString("en-US", { weekday: "long" })
            .toLowerCase();

          if (currentRoster !== originalRoster && originalRoster !== "N/A") {
            changes.push({
              email: currentRow.email,
              day,
              field: "roster",
              oldValue: originalRoster,
              newValue: currentRoster,
              changedBy: user.email, // Replace with actual user
              timestamp: new Date().toISOString(),
              date: date,
            });
          }

          if (currentShift !== originalShift && originalShift !== "N/A") {
            changes.push({
              email: currentRow.email,
              day,
              field: "shift",
              oldValue: originalShift,
              newValue: currentShift,
              changedBy: user.email, // Replace with actual user
              timestamp: new Date().toISOString(),
              date: date,
            });
          }
        });
      });

      if (changes.length > 0) {
        await setLogsData(changes);
        setOriginalData([...combinedData]);
        // Update log data with new changes
        setLogData((prevLogs) => [...changes, ...prevLogs]);
        toast.dismiss();
        toast.success("Changes Logged Successfully");
      } else {
        toast.info("No changes to log");
      }
    } catch (error) {
      toast.error("Error Logging Changes");
      console.error(error);
    }
  };

  return (
    <div className="w-[95%] flex flex-col justify-center items-center">
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
                {combinedData.length > 0 ? (
                  combinedData.map((row: CombinedData, index) => (
                    <TableRow key={index}>
                      <TableCell className="sticky left-0 bg-white z-10">
                        {row.email}
                      </TableCell>
                      <TableCell className="sticky left-[150px] bg-white z-10">
                        <TruncatedCell text={row.allocation} />
                      </TableCell>
                      {dateColumns.map((date) => {
                        const [rosterValue, shiftValue] = (
                          row[date as keyof CombinedData] || "N/A/ "
                        )
                          .split("/")
                          .map((v: string) => v.trim());

                        return (
                          <TableCell
                            key={date}
                            className="px-6 py-2 border-x-[1px] border-gray-200"
                          >
                            <div className="flex items-center gap-3">
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
                                <LogHistoryTooltip
                                  email={row.email}
                                  date={date}
                                  getLogHistoryForCell={getLogHistoryForCell}
                                />
                              </div>
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
