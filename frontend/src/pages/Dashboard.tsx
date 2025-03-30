import React, { useEffect, useState } from "react";
import AuthService from "../services/auth.service";
import { useAuth } from "../contexts/AuthContext";
import StorageService from "../services/storage.service";

const Dashboard: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { authState } = useAuth();

  useEffect(() => {
    console.log("Current token:", StorageService.getAccessToken());

    AuthService.hello()
      .then((message) => {
        setMessage(message);
        setError("");
      })
      .catch((error) => {
        console.error("Hello API Error:", error);
        setError(error.message || "Error fetching message");
        setMessage("");
      });
  }, []);

  return (
    <div className="page-container">
      <h1>Dashboard</h1>
      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div>
        <p>
          Auth Status:{" "}
          {authState.isAuthenticated ? "Authenticated" : "Not Authenticated"}
        </p>
        <p>Token exists: {StorageService.getAccessToken() ? "Yes" : "No"}</p>
        <p>Token expired: {StorageService.isTokenExpired() ? "Yes" : "No"}</p>
        <p>Loading: {authState.loading ? "Yes" : "No"}</p>
        {authState.error && <p>Auth Error: {authState.error}</p>}
      </div>
    </div>
  );
};

export default Dashboard;
