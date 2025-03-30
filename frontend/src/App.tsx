import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./AppRoutes";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
const App: React.FC = () => {
  return (
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Router>
          <AppRoutes />
        </Router>
      </LocalizationProvider>
    </AuthProvider>
  );
};

export default App;
