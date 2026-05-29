import type { ReactElement } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ClassManagementPage from "./pages/ClassManagementPage";
import ClassReportPage from "./pages/ClassReportPage";
import ClassSchedulePage from "./pages/ClassSchedulePage";
import UserManagementPage from "./pages/UserManagementPage";
import MaterialsPage from "./pages/MaterialsPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import GradingPage from "./pages/GradingPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import AttendancePage from "./pages/AttendancePage";
import LeaveRequestsPage from "./pages/LeaveRequestsPage";

import OnlineQuizPage from "./pages/OnlineQuizPage";
import SettingsPage from "./pages/SettingsPage";
import { AppProvider, useAppContext } from "./context/AppContext";
import { PermissionRoute } from "./components/auth/PermissionRoute";

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
          <Route path="/register" element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />
          <Route path="/forgot-password" element={<GuestOnlyRoute><ForgotPasswordPage /></GuestOnlyRoute>} />

          <Route element={<ProtectedAppRoute><AppLayout /></ProtectedAppRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/users" element={
              <PermissionRoute permission="manage_users">
                <UserManagementPage />
              </PermissionRoute>
            } />

            <Route path="/classes" element={
              <PermissionRoute permission="view_classes">
                <ClassManagementPage />
              </PermissionRoute>
            } />
            <Route path="/class-report" element={
              <PermissionRoute permission="grade_assignments">
                <ClassReportPage />
              </PermissionRoute>
            } />
            <Route path="/classes/schedule" element={
              <PermissionRoute permission="manage_classes">
                <ClassSchedulePage />
              </PermissionRoute>
            } />
            <Route path="/attendance" element={
              <PermissionRoute permission="view_attendance">
                <AttendancePage />
              </PermissionRoute>
            } />
            <Route path="/attendance/leave-requests" element={
              <PermissionRoute permission="view_attendance">
                <LeaveRequestsPage />
              </PermissionRoute>
            } />


            <Route path="/materials" element={
              <PermissionRoute permission="view_materials">
                <MaterialsPage />
              </PermissionRoute>
            } />

            <Route path="/assignments" element={
              <PermissionRoute permission="view_assignments">
                <AssignmentsPage />
              </PermissionRoute>
            } />

            <Route path="/assignments/take/:assignmentId" element={
              <PermissionRoute permission="submit_assignment" redirectTo="/assignments">
                <OnlineQuizPage />
              </PermissionRoute>
            } />

            <Route path="/grading" element={
              <PermissionRoute permission="view_own_grades">
                <GradingPage />
              </PermissionRoute>
            } />

            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
