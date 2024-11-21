import { useState } from "react";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "./DateRange";
import { Button } from "./ui/button";
import { addDays } from "date-fns";
import { Input } from "./ui/input";

type HeaderProps = {
  startDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  endDate: string;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
};

const Header = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: HeaderProps) => {
  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold text-[#4e9045]">
            RM{" "}
          </a>
        </div>
        <div className="flex justify-center gap-4 my-4">
          <div className="flex items-center gap-2">
            <label>Start Date:</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <label>End Date:</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
