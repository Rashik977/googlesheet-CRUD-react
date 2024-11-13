import { useState } from "react";
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

const App = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <div className="relative">
          {/* Bookmark Button */}
          <SheetTrigger>
            <Button
              variant="outline"
              className={`bg-black rounded-none hover:bg-gray-500 hover:text-white text-white absolute -right-5 top-10 transform -translate-y-1/2 rotate-90 transition-transform duration-300 ${
                isOpen ? "translate-x-[-60vw]" : ""
              }`}
            >
              Roster
            </Button>
          </SheetTrigger>

          {/* Slide-in Sheet Content */}
          <SheetContent className="w-[60%] h-full">
            <Roster />
          </SheetContent>
        </div>
      </Sheet>
    </>
  );
};

export default App;
