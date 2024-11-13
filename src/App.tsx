import { useEffect, useState } from "react";
import Roster from "./components/Roster";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./components/ui/button";
import Shift from "./components/Shift";
import Header from "./components/Header";
import { readData } from "./GoogleSheetsComponent";
import { RowData } from "./interfaces/IRowData";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [data, setData] = useState<RowData[]>([]);
  const [filteredData, setFilteredData] = useState<RowData[]>([]);

  useEffect(() => {
    readData().then((fetchedData) => {
      setData(fetchedData);
      setFilteredData(fetchedData);
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
              data={data}
              filteredData={filteredData}
              setFilteredData={setFilteredData}
              setData={setData}
            />
          </SheetContent>
        </div>
      </Sheet>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <div className="relative">
          {/* Bookmark Button */}
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

          {/* Slide-in Sheet Content */}
          <SheetContent className="w-[60%] h-full">
            <Shift />
          </SheetContent>
        </div>
      </Sheet>
    </>
  );
};

export default App;
