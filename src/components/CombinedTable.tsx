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

interface CombinedTableProps {
  mainData: MainData[];
  rosterData: RowData[];
  shiftData: ShiftData[];
}

const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const rosterOptions = ["WFH", "WFO"];
const shiftOptions = [
  "DAY_SHIFT",
  "MORNING_SHIFT",
  "EVENING_SHIFT",
  "LATE_EVENING_SHIFT",
];

const CombinedTable: React.FC<CombinedTableProps> = ({
  mainData,
  rosterData,
  shiftData,
}) => {
  const [combinedData, setCombinedData] = useState<CombinedData[]>([]);

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
      // Create combined record using the first allocation's data for display
      const baseAllocation = personAllocations[0];
      const combinedRecord = {
        ...baseAllocation,
        projectName: baseAllocation.projectName || "N/A",
        allocation: personAllocations
          .map((a: MainData) => a.allocation)
          .join(", "),
        ...weeklyRoster,
      };
      // Set combined data by email
      combinedDataMap.set(email, combinedRecord);
    });
    // Set combined data to state
    setCombinedData(Array.from(combinedDataMap.values()));
  }, [mainData, rosterData, shiftData]);

  const handleValueChange = (
    rowIndex: number,
    day: string,
    type: "roster" | "shift",
    value: string
  ) => {
    setCombinedData((prevData) => {
      const newData = [...prevData];
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
      return value === "MORNING_SHIFT"
        ? "bg-[#fee5a0]"
        : value === "DAY_SHIFT"
        ? "bg-[#E8EAED]"
        : value === "EVENING_SHIFT"
        ? "bg-[#F6C7A9]"
        : value === "LATE_EVENING_SHIFT"
        ? "bg-[#3D3D3D] text-white"
        : "bg-white";
    }
  };

  return (
    <div className="w-[95%] flex justify-center">
      <Table className="w-[90%] mx-auto rounded-lg shadow-lg">
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
            combinedData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.allocation}</TableCell>
                {weekdays.map((day) => {
                  const [rosterValue, shiftValue] = row[day]
                    .split("/")
                    .map((v) => v.trim());
                  return (
                    <TableCell key={day} className="p-2">
                      <div className="flex flex-col gap-1">
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
                          {rosterOptions.map((option) => (
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
                          className={`w-[180px] h-[30px] rounded-lg ${getSelectStyle(
                            "shift",
                            shiftValue
                          )}`}
                        >
                          <option value="N/A">N/A</option>
                          {shiftOptions.map((option) => (
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
  );
};

export default CombinedTable;
