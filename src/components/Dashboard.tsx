import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import App from "@/App";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const printUser = () => {
    console.log(user);
  };

  return (
    <>
      <Button onClick={handleLogout} className="absolute top-8 right-10">
        Logout
      </Button>
      <App />
    </>
  );
};

export default Dashboard;
