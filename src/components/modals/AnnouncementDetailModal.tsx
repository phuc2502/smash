import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pin, AlertCircle, Info, Clock, User, Megaphone } from 'lucide-react';
import type { Announcement } from '../../context/AppContext';

interface AnnouncementDetailModalProps {
  isOpen: boolean;
  announcement: Announcement | null;
  onClose: () => void;
}

type AnnouncementTarget = 'all' | 'teacher' | 'student' | 'parent' | 'admin_staff';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

function exactDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function targetLabel(targets: AnnouncementTarget[]): string {
  if (targets.includes('all')) return 'Tất cả';
  return targets
    .map(t =>
      t === 'teacher' ? 'Giáo viên' :
      t === 'student' ? 'Học viên' :
      t === 'parent' ? 'Phụ huynh' : 'Hành chính',
    )
    .join(', ');
}

function targetBadgeStyle(targets: AnnouncementTarget[]): string {
  if (targets.includes('all')) return 'bg-slate-100 text-slate-600';
  if (targets.includes('teacher')) return 'bg-blue-50 text-blue-600 border-blue-100';
  if (targets.includes('student')) return 'bg-mint-50 text-mint-700 border-mint-100';
  return 'bg-purple-50 text-purple-600 border-purple-100';
}

function priorityConfig(priority: string) {
  if (priority === 'action') return {
    icon: <AlertCircle className="w-5 h-5" />,
    label: 'Khẩn cấp',
    badge: 'bg-rose-50 text-rose-600 border-rose-200/50 shadow-sm shadow-rose-50/20',
    border: 'border-rose-200',
    headerBg: 'bg-rose-50/30',
  };
  if (priority === 'reminder') return {
    icon: <Clock className="w-5 h-5" />,
    label: 'Nhắc nhở',
    badge: 'bg-amber-50 text-amber-600 border-amber-200/50 shadow-sm shadow-amber-50/20',
    border: 'border-amber-200',
    headerBg: 'bg-amber-50/30',
  };
  return {
    icon: <Info className="w-5 h-5" />,
    label: 'Thông tin',
    badge: 'bg-slate-100 text-slate-600 border-slate-200 shadow-sm shadow-slate-50',
    border: 'border-slate-200',
    headerBg: 'bg-slate-50/30',
  };
}

export default function AnnouncementDetailModal({ isOpen, announcement, onClose }: AnnouncementDetailModalProps) {
  if (!announcement) return null;
  const cfg = priorityConfig(announcement.priority);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative bg-white w-full max-w-xl rounded-[36px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
          >
            {/* Header / Banner */}
            <div className={`p-6 border-b border-slate-100 flex justify-between items-center ${cfg.headerBg}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[20px] bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-950/20">
                  <Megaphone className="w-5 h-5 text-mint-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Chi tiết thông báo</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {announcement.isPinned && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Pin className="w-2.5 h-2.5" /> Đã ghim
                      </span>
                    )}
                    <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${cfg.badge}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm border border-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Announcement Title */}
              <h4 className="text-xl font-black text-slate-900 leading-tight">
                {announcement.title}
              </h4>

              {/* Targets info */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gửi đến:</span>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${targetBadgeStyle(announcement.targets as AnnouncementTarget[])}`}>
                  {targetLabel(announcement.targets as AnnouncementTarget[])}
                </span>
              </div>

              {/* Main Content Body */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 leading-relaxed text-sm text-slate-700 font-medium whitespace-pre-line">
                {announcement.body}
              </div>

              {/* Exact time metadata */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Clock className="w-4 h-4 text-slate-300" />
                <span>Thời gian: {exactDateTime(announcement.createdAt)} ({relativeTime(announcement.createdAt)})</span>
              </div>
            </div>

            {/* Footer / Author Info */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-mint-100 flex items-center justify-center text-mint-600 font-black shadow-sm">
                  {announcement.authorName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Người gửi</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-sm font-black text-slate-900">{announcement.authorName}</span>
                    <span className="text-[10px] font-bold text-slate-400">({announcement.authorRole})</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
