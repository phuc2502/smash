import { useEffect, useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useAppContext } from "../../context/AppContext";
import {
  APP_NAV_LINKS,
  isClassNavPath,
  isAttendanceNavPath,
  isNavGroup,
  type AppNavEntry,
} from "./appNavLinks";

type NavMenuProps = {
  onNavigate?: () => void;
  className?: string;
};

function NavCountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto shrink-0 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5 shadow-[0_2px_8px_rgba(239,68,68,0.25)] scale-105">
      {count > 99 ? '99+' : count}
    </span>
  );
}

function resolveCount(
  entry: AppNavEntry,
  stats: { totalUsers: number; activeClasses: number; pendingGrading: number },
  unreadAnnouncementsCount: number
) {
  if ("path" in entry && entry.path === "/announcements") {
    return unreadAnnouncementsCount;
  }
  return 0;
}

export default function NavMenu({ onNavigate, className = "" }: NavMenuProps) {
  const location = useLocation();
  const { stats, canAccess, currentAccount, notifications, readNotificationIds } = useAppContext();

  const unreadAnnouncementsCount = useMemo(() => {
    return (notifications ?? []).filter(
      n => n.type === 'announcement' && !(readNotificationIds ?? []).includes(n.id)
    ).length;
  }, [notifications, readNotificationIds]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => ({
    classes: isClassNavPath(location.pathname),
    attendance: isAttendanceNavPath(location.pathname),
  }));

  useEffect(() => {
    if (isClassNavPath(location.pathname)) {
      setOpenGroups((prev) => ({ ...prev, classes: true }));
    }
    if (isAttendanceNavPath(location.pathname)) {
      setOpenGroups((prev) => ({ ...prev, attendance: true }));
    }
  }, [location.pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative
    ${isActive
      ? "bg-white text-mint-600 shadow-sm shadow-mint-100/50 font-semibold"
      : "text-mint-600 hover:bg-white/40 hover:translate-x-1"
    }`;

  const childLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 pl-11 pr-4 py-2.5 rounded-xl transition-all duration-300 text-sm
    ${isActive
      ? "bg-white text-slate-700 shadow-sm font-semibold"
      : "text-slate-500 hover:bg-slate-200/30"
    }`;

  // Filter top-level entries by permission
  const visibleLinks = APP_NAV_LINKS.filter(entry => {
    if (!isNavGroup(entry) && entry.path === "/grading") {
      return canAccess("grade_assignments") || canAccess("view_own_grades");
    }
    if (!entry.requiredPermission) return true;
    return canAccess(entry.requiredPermission);
  }).map(entry => {
    if (!isNavGroup(entry) && entry.path === "/grading") {
      const isStudent = currentAccount?.role === "Học viên";
      const isParent = currentAccount?.role === "Phụ huynh";
      const isAdmin = currentAccount?.role === "Admin";
      if (isStudent || isParent || isAdmin) {
        return { ...entry, label: "Bảng điểm" };
      }
    }
    return entry;
  });

  return (
    <nav className={`space-y-1 \${className}`}>
      {visibleLinks.map((entry) => {
        if (isNavGroup(entry)) {
          // Filter children by permission
          const visibleChildren = entry.children.filter(child =>
            !child.requiredPermission || canAccess(child.requiredPermission)
          );
          // Hide group if no visible children
          if (visibleChildren.length === 0) return null;

          const isOpen = openGroups[entry.id] ?? false;
          const groupActive =
            (isClassNavPath(location.pathname) && entry.id === "classes") ||
            (isAttendanceNavPath(location.pathname) && entry.id === "attendance");

          return (
            <motion.div key={entry.id} layout className="space-y-0.5">
              <button
                type="button"
                onClick={() => toggleGroup(entry.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group text-left
                  ${groupActive
                    ? "bg-white/80 text-mint-600 shadow-sm shadow-mint-100/40 font-semibold"
                    : "text-mint-600 hover:bg-white/40"
                  }`}
                aria-expanded={isOpen}
              >
                <entry.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110 duration-300" />
                <span className="text-sm font-medium flex-1">{entry.label}</span>
                <NavCountBadge count={resolveCount(entry, stats, unreadAnnouncementsCount)} />
                <ChevronDown
                  className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden space-y-0.5"
                  >
                    {visibleChildren.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onNavigate}
                        className={childLinkClass}
                        end
                      >
                        <child.icon className="w-4 h-4 shrink-0 opacity-80" />
                        <span className="font-medium">{child.label}</span>
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        }

        const count = resolveCount(entry, stats, unreadAnnouncementsCount);
        const labelText = count > 0 && entry.path === "/announcements"
          ? `${entry.label} (${count})`
          : entry.label;

        return (
          <NavLink
            key={entry.path}
            to={entry.path}
            onClick={onNavigate}
            className={linkClass}
            end
          >
            <entry.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110 duration-300" />
            <span className="text-sm font-medium flex-1">{labelText}</span>
            <NavCountBadge count={count} />
          </NavLink>
        );
      })}
    </nav>
  );
}
