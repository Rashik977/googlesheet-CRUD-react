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
            <TableCell>Monday</TableCell>
            <TableCell>Tuesday</TableCell>
            <TableCell>Wednesday</TableCell>
            <TableCell>Thursday</TableCell>
            <TableCell>Friday</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinedData.length > 0 ? (
            combinedData.map((row: CombinedData, index: number) => (
              <TableRow key={index}>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.allocation || "N/A"}</TableCell>
                <TableCell>{row.monday || "N/A"}</TableCell>
                <TableCell>{row.tuesday || "N/A"}</TableCell>
                <TableCell>{row.wednesday || "N/A"}</TableCell>
                <TableCell>{row.thursday || "N/A"}</TableCell>
                <TableCell>{row.friday || "N/A"}</TableCell>
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
