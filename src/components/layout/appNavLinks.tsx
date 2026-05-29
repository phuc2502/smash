import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  School,
  FileText,
  GraduationCap,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  CheckCircle2,
  Megaphone,
  Settings,
  Clock,
} from "lucide-react";
import type { PermissionKey } from "../../context/AppContext";

export type NavCountKey = "totalUsers" | "activeClasses" | "pendingGrading";

export interface AppNavLinkItem {
  type?: "link";
  path: string;
  label: string;
  icon: LucideIcon;
  countKey?: NavCountKey;
  requiredPermission?: PermissionKey;
}

export interface AppNavGroupChild {
  path: string;
  label: string;
  icon: LucideIcon;
  requiredPermission?: PermissionKey;
}

export interface AppNavGroupItem {
  type: "group";
  id: string;
  label: string;
  icon: LucideIcon;
  countKey?: NavCountKey;
  requiredPermission?: PermissionKey;
  children: AppNavGroupChild[];
}

export type AppNavEntry = AppNavLinkItem | AppNavGroupItem;

export function isNavGroup(entry: AppNavEntry): entry is AppNavGroupItem {
  return entry.type === "group";
}

/** Các path con thuộc nhóm Quản lý lớp học */
export const CLASS_NAV_PATHS = ["/classes", "/class-report", "/classes/schedule"] as const;

export function isClassNavPath(pathname: string): boolean {
  return CLASS_NAV_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Các path con thuộc nhóm Điểm danh */
export const ATTENDANCE_NAV_PATHS = ["/attendance", "/attendance/leave-requests"] as const;

export function isAttendanceNavPath(pathname: string): boolean {
  return ATTENDANCE_NAV_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export const APP_NAV_LINKS: AppNavEntry[] = [
  { path: "/dashboard", label: "Trang chủ", icon: LayoutDashboard },
  { path: "/users", label: "Người dùng", icon: Users, countKey: "totalUsers", requiredPermission: "manage_users" },
  {
    type: "group",
    id: "classes",
    label: "Quản lý lớp học",
    icon: School,
    countKey: "activeClasses",
    requiredPermission: "view_classes",
    children: [
      { path: "/classes", label: "Danh sách lớp học", icon: School },
      { path: "/class-report", label: "Báo cáo lớp học", icon: BarChart3, requiredPermission: "grade_assignments" },
      { path: "/classes/schedule", label: "Quản lý lịch học", icon: CalendarDays, requiredPermission: "manage_classes" },
    ],
  },
  {
    type: "group",
    id: "attendance",
    label: "Điểm danh",
    icon: ClipboardCheck,
    requiredPermission: "view_attendance",
    children: [
      { path: "/attendance", label: "Quản lý điểm danh", icon: ClipboardCheck },
      { path: "/attendance/leave-requests", label: "Yêu cầu nghỉ phép", icon: CalendarDays },
    ],
  },
  { path: "/materials", label: "Tài liệu", icon: FileText, requiredPermission: "view_materials" },
  { path: "/assignments", label: "Bài tập", icon: GraduationCap, countKey: "pendingGrading", requiredPermission: "view_assignments" },
  { path: "/grading", label: "Chấm điểm", icon: CheckCircle2, requiredPermission: "grade_assignments" },
  { path: "/announcements", label: "Thông báo", icon: Megaphone },
  { path: "/settings", label: "Cài đặt", icon: Settings },
];
