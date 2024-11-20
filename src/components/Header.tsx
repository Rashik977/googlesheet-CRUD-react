import { useState } from "react";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "./DateRange";
import { Button } from "./ui/button";
import { addDays } from "date-fns";

const Header = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -15),
    to: addDays(new Date(), 15),
  });

  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold text-[#4e9045]">
            RM{" "}
          </a>
        </div>
        <div className="flex gap-3">
          <DatePickerWithRange setDate={setDateRange} date={dateRange} />
          <Button className="bg-secondary text-black hover:bg-black hover:text-white transition-all">
            Filter
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
