import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import App from "@/App";
import { usePermission } from "@/hooks/usePermission";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const canViewLogs = usePermission("view_logs");
  const canManageRoster = usePermission("manage_roster");
  const canManageShift = usePermission("manage_shifts");
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <Button onClick={handleLogout} className="absolute top-8 right-10">
        Logout
      </Button>
      {canViewLogs && <div>Logs Section</div>}
      {canManageRoster && <div>Roster Management Section</div>}
      {canManageShift && <div>Shift Management Section</div>}
    </>
  );
};

export default Dashboard;
