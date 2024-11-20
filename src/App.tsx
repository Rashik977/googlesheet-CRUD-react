import { useEffect, useState } from "react";
import Roster from "./components/Roster";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./components/ui/button";
import Shift from "./components/Shift";
import Header from "./components/Header";
import { readRosterData } from "./api/RosterAPI";
import { RowData } from "./interfaces/IRowData";
import { ShiftData } from "./interfaces/IShiftData";
import { readShiftData } from "./api/ShiftAPI";
import { MainData } from "./interfaces/IMainData";
import { readMainData } from "./api/MainAPI";
import CombinedTable from "./components/CombinedTable";
import { readLogData } from "./api/LogAPI";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [rosterData, setRosterData] = useState<RowData[]>([]);
  const [filteredRosterData, setFilteredRosterData] = useState<RowData[]>([]);

  const [shiftData, setShiftData] = useState<ShiftData[]>([]);
  const [filteredShiftData, setFilteredShiftData] = useState<ShiftData[]>([]);

  const [mainData, setMainData] = useState<MainData[]>([]);

  useEffect(() => {
    readRosterData().then((fetchedData) => {
      setRosterData(fetchedData);
      setFilteredRosterData(fetchedData);
    });
    readShiftData().then((fetchedData) => {
      setShiftData(fetchedData);
      setFilteredShiftData(fetchedData);
    });

    readMainData().then((fetchedData) => {
      setMainData(fetchedData);
    });

    readLogData().then((fetchedData) => {
      console.log(fetchedData);
    });
  }, []);

  return (
    <>
      <Header />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <div className="relative">
          {/* Bookmark Button */}
          <SheetTrigger>
            <Button
              variant="outline"
              className={`bg-black rounded-none hover:bg-gray-500 hover:text-white text-white absolute -right-7 top-[3rem] transform -translate-y-1/2 rotate-90 transition-transform duration-300 h-10 w-24 ${
                isOpen ? "translate-x-[-60vw]" : ""
              }`}
            >
              Roster
            </Button>
          </SheetTrigger>

          {/* Slide-in Sheet Content */}
          <SheetContent className="w-[60%] h-full overflow-auto">
            <Roster
              data={rosterData}
              filteredData={filteredRosterData}
              setFilteredData={setFilteredRosterData}
              setData={setRosterData}
            />
          </SheetContent>
        </div>
      </Sheet>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <div className="relative">
          <SheetTrigger className="w-full flex justify-end">
            <Button
              variant="outline"
              className={`bg-black rounded-none hover:bg-gray-500 hover:text-white text-white absolute -right-7 top-[8rem] transform -translate-y-1/2 rotate-90 transition-transform duration-300 h-10 w-24 ${
                isSheetOpen ? "translate-x-[-60vw]" : ""
              }`}
            >
              Shift
            </Button>
          </SheetTrigger>

          <SheetContent className="w-[60%] h-full overflow-auto">
            <Shift
              data={shiftData}
              filteredData={filteredShiftData}
              setData={setShiftData}
              setFilteredData={setFilteredShiftData}
            />
          </SheetContent>
        </div>
      </Sheet>

      <div className="flex flex-col items-center gap-7">
        <CombinedTable
          mainData={mainData}
          rosterData={rosterData}
          shiftData={shiftData}
        />
      </div>
    </>
  );
};

export default App;
