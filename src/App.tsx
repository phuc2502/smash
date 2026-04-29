import type { ReactElement } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ClassManagementPage from "./pages/ClassManagementPage";
import UserManagementPage from "./pages/UserManagementPage";
import MaterialsPage from "./pages/MaterialsPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import GradingPage from "./pages/GradingPage";
import { AppProvider, useAppContext } from "./context/AppContext";

function ProtectedAppRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAppContext();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestOnlyRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAppContext();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
          <Route path="/forgot-password" element={<GuestOnlyRoute><ForgotPasswordPage /></GuestOnlyRoute>} />

          <Route element={<ProtectedAppRoute><AppLayout /></ProtectedAppRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/classes" element={<ClassManagementPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/grading" element={<GradingPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
