import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import App from "@/App";
import { usePermission } from "@/hooks/usePermission";

const Dashboard: React.FC = () => {
  return (
    <>
      <App />
    </>
  );
};

export default Dashboard;
