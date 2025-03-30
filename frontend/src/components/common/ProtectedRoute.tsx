import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CircularProgress from "@mui/material/CircularProgress";

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = "/login",
}) => {
  const { authState } = useAuth();

  if (authState.loading) {
    return <CircularProgress />;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
