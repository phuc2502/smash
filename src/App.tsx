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
import { AppProvider } from "./context/AppContext";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<AppLayout />}>
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