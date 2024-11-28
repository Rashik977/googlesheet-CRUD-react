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

import { dateConverter } from "./utils/dateConverter";
import { addDays } from "date-fns";

import { usePermission } from "@/hooks/usePermission";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [rosterData, setRosterData] = useState<RowData[]>([]);
  const [filteredRosterData, setFilteredRosterData] = useState<RowData[]>([]);
  const [shiftData, setShiftData] = useState<ShiftData[]>([]);
  const [filteredShiftData, setFilteredShiftData] = useState<ShiftData[]>([]);
  const [mainData, setMainData] = useState<MainData[]>([]);
  const [startDate, setStartDate] = useState<string>(
    `${dateConverter(new Date().toISOString())}`
  );
  const [endDate, setEndDate] = useState<string>(
    `${dateConverter(addDays(new Date(), 7).toISOString())}`
  );

  const { user } = useAuth();
  // Permissions
  const canViewLogs = usePermission("view_logs");
  const canManageRoster = usePermission("manage_roster");
  const canManageShift = usePermission("manage_shifts");
  const canManageSpecificRoster = usePermission("manage_specific_roster");

  useEffect(() => {
    readRosterData().then((fetchedData) => {
      let processedRosterData = fetchedData;

      if (canManageSpecificRoster && user?.email) {
        // Filter roster data to only include projects where user is project leader
        processedRosterData = [
          fetchedData[0], // Keep the first row (header)
          ...fetchedData
            .slice(1)
            .filter((roster: RowData) => roster.projectLeader === user.email),
        ];
      }

      setRosterData(processedRosterData);
      setFilteredRosterData(processedRosterData);
    });

    readShiftData().then((fetchedData) => {
      setShiftData(fetchedData);
      setFilteredShiftData(fetchedData);
    });

    readMainData().then((fetchedData) => {
      setMainData(fetchedData);
    });
  }, [user, canManageSpecificRoster]);

  return (
    <div>
      <Header
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {/* Render Roster if the user has permissions */}
      {canManageRoster && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <div className="relative">
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
      )}

      {/* Render Shift if the user has permissions */}
      {canManageShift && (
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
      )}

      {/* Combined Table */}
      {canViewLogs && (
        <div className="flex flex-col items-center gap-7">
          <CombinedTable
            mainData={mainData}
            rosterData={canManageRoster ? rosterData : []}
            shiftData={canManageShift ? shiftData : []}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default App;
