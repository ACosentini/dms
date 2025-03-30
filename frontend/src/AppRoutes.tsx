import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { AUTH_EVENTS } from "./services/api.service";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import LoadingSpinner from "./components/common/LoadingSpinner";

const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const DocumentList = React.lazy(() => import("./pages/DocumentList"));
const TagManagement = React.lazy(() => import("./pages/TagManagement"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      navigate("/login", { replace: true });
    };

    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized);
    };
  }, [navigate]);

  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DocumentList />} />
            <Route path="/documents" element={<DocumentList />} />
            <Route path="/tags" element={<TagManagement />} />
          </Route>
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
