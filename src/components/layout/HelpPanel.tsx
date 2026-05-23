import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  HelpCircle,
  X,
  LayoutDashboard,
  Users,
  School,
  GraduationCap,
  ClipboardCheck,
  FileText,
  Megaphone,
  BarChart3,
  CalendarDays,
  Keyboard,
} from "lucide-react";

const QUICK_LINKS: {
  href: string;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { href: "/dashboard", label: "Trang chủ", detail: "Tổng quan, số liệu và tác vụ nổi bật", icon: LayoutDashboard },
  { href: "/users", label: "Người dùng", detail: "Xem danh sách và duyệt tài khoản chờ", icon: Users },
  { href: "/classes", label: "Danh sách lớp học", detail: "Tạo lớp, phân công GV và sĩ số", icon: School },
  { href: "/class-report", label: "Báo cáo lớp học", detail: "Điểm, tỷ lệ nộp bài và tham gia buổi học", icon: BarChart3 },
  { href: "/classes/schedule", label: "Quản lý lịch học", detail: "Cập nhật lịch giảng dạy từng lớp", icon: CalendarDays },
  { href: "/assignments", label: "Bài tập", detail: "Giao bài, hạn nộp và tiến độ", icon: GraduationCap },
  { href: "/grading", label: "Chấm điểm", detail: "Bài chờ chấm và nhập điểm", icon: ClipboardCheck },
  { href: "/materials", label: "Tài liệu", detail: "Tệp và tài nguyên cho lớp", icon: FileText },
  { href: "/announcements", label: "Thông báo chung", detail: "Tin và liên lạc trong trung tâm", icon: Megaphone },
];

export default function HelpPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const go = (href: string) => {
    navigate(href);
    setIsOpen(false);
  };

  return (
    <div className="relative hidden sm:block" ref={panelRef}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Trợ giúp và liên kết nhanh"
        onClick={() => setIsOpen(v => !v)}
        className={`relative w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-xl transition-colors ${isOpen ? "bg-slate-100" : ""}`}
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="Trợ giúp nhanh"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
            className="absolute right-0 mt-4 w-[min(100vw-2rem,380px)] bg-white rounded-2xl shadow-[0_8px_40px_rgb(0,0,0,0.1)] border border-slate-900/5 overflow-hidden z-50"
          >
            <div className="px-4 pt-4 pb-3 border-b border-slate-50 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Trợ giúp nhanh</h3>
                <p className="text-xs text-slate-500 mt-0.5">Đi tới màn hình thường dùng trong SMASH.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[min(60vh,360px)] overflow-y-auto py-1">
              {QUICK_LINKS.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => go(item.href)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 transition-colors text-left group"
                >
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-mint-50 text-mint-600 flex items-center justify-center group-hover:bg-mint-100 transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 group-hover:text-mint-700 transition-colors">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.detail}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-slate-50 bg-slate-50/50 flex items-start gap-2">
              <Keyboard className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ô tìm kiếm phía trên hỗ trợ tìm tài liệu và học viên. Mở <span className="font-medium text-slate-700">Cài đặt hệ thống</span> từ menu tài khoản để chỉnh thông báo và giao diện.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
