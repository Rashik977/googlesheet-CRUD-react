import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";

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
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-10">
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
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
