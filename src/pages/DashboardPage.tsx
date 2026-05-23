import { useAppContext, RoleKey } from "../context/AppContext";
import { getRoleKey } from "../components/dashboard/dashboardUtils";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import TeacherDashboard from "../components/dashboard/TeacherDashboard";
import StudentParentDashboard from "../components/dashboard/StudentParentDashboard";

const ADMIN_ROLES: RoleKey[] = ['owner', 'manager', 'admin_staff', 'admin'];

export default function DashboardPage() {
  const { currentAccount } = useAppContext();
  
  // Lấy roleKey chuẩn hóa từ chuỗi tiếng Việt
  const roleKey = getRoleKey(currentAccount?.role);

  if (ADMIN_ROLES.includes(roleKey)) {
    return <AdminDashboard />;
  }
  
  if (roleKey === 'teacher') {
    return <TeacherDashboard />;
  }
  
  // Fallback hoặc default cho student / parent
  return <StudentParentDashboard />;
}
