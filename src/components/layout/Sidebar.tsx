import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  GraduationCap,
  School,
  LogOut,
  Zap,
  Divide,
  Settings
} from "lucide-react";
import { motion } from "motion/react";
import { useAppContext } from "../../context/AppContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { stats, logout } = useAppContext();

  const menuItems = [
    { icon: LayoutDashboard, label: "Bảng điều khiển", path: "/dashboard" },
    { icon: Users, label: "Người dùng", path: "/users", count: stats.totalUsers },
    { icon: School, label: "Quản lý lớp học", path: "/classes", count: stats.activeClasses },
    { icon: FileText, label: "Tài liệu", path: "/materials" },
    { icon: GraduationCap, label: "Bài tập", path: "/assignments", count: stats.pendingGrading },
    { icon: School, label: "Chấm điểm", path: "/grading" },
    { icon: Settings, label: "Cài đặt", path: "/settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200/50 bg-slate-50/80 backdrop-blur-2xl flex flex-col py-8 z-40 hidden md:flex">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-mint-600 to-mint-400 flex items-center justify-center text-white shadow-lg shadow-mint-200">
          <Zap className="w-6 h-6" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-lg font-black text-mint-700 tracking-tight leading-none">SMASH Math</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 px-0.5">Education Center</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative
              ${isActive
                ? "bg-white text-mint-600 shadow-sm shadow-mint-100/50 font-semibold"
                : "text-slate-500 hover:bg-slate-200/30 hover:translate-x-1"
              }
            `}
          >
            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 duration-300`} />
            <span className="text-sm font-medium">{item.label}</span>

          </NavLink>
        ))}
      </nav>

      <div className="px-4 mt-auto">
        <button
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
