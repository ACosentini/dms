import React, { useEffect, useState } from "react";
import AuthService from "../services/auth.service";
const Dashboard: React.FC = () => {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    AuthService.hello().then((message) => setMessage(message));
  }, []);

  return (
    <div className="page-container">
      <h1>Dashboard</h1>
      <p>{message}</p>
    </div>
  );
};

export default Dashboard;
