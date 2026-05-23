import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Megaphone, Pin, Trash2, Plus, X, Bell,
  Users, GraduationCap, School, BookOpen,
  AlertCircle, Info, Clock, Send,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { Announcement } from '../context/AppContext';

type AnnouncementTarget = 'all' | 'teacher' | 'student' | 'parent' | 'admin_staff';

const TARGET_OPTIONS: { value: AnnouncementTarget; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'Tất cả', icon: <Users className="w-4 h-4" /> },
  { value: 'teacher', label: 'Giáo viên', icon: <School className="w-4 h-4" /> },
  { value: 'student', label: 'Học viên', icon: <BookOpen className="w-4 h-4" /> },
  { value: 'parent', label: 'Phụ huynh', icon: <GraduationCap className="w-4 h-4" /> },
];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
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
  if (targets.includes('teacher')) return 'bg-blue-50 text-blue-600';
  if (targets.includes('student')) return 'bg-mint-50 text-mint-700';
  return 'bg-purple-50 text-purple-600';
}

function priorityConfig(priority: string) {
  if (priority === 'action') return {
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Khẩn cấp',
    badge: 'bg-rose-50 text-rose-600 border-rose-200/50',
    border: 'border-l-rose-400',
    bg: 'bg-rose-50/20',
  };
  if (priority === 'reminder') return {
    icon: <Clock className="w-4 h-4" />,
    label: 'Nhắc nhở',
    badge: 'bg-amber-50 text-amber-600 border-amber-200/50',
    border: 'border-l-amber-400',
    bg: 'bg-amber-50/10',
  };
  return {
    icon: <Info className="w-4 h-4" />,
    label: 'Thông tin',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    border: 'border-l-slate-300',
    bg: '',
  };
}

// ── Compose Form (chỉ cho Teacher/Admin) ──────────────────────
function ComposeForm({ onClose }: { onClose: () => void }) {
  const { createAnnouncement, currentAccount } = useAppContext();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targets, setTargets] = useState<AnnouncementTarget[]>(['all']);
  const [priority, setPriority] = useState<'action' | 'reminder' | 'info'>('reminder');
  const [isSending, setIsSending] = useState(false);

  const toggleTarget = (t: AnnouncementTarget) => {
    if (t === 'all') { setTargets(['all']); return; }
    setTargets(prev => {
      const without = prev.filter(x => x !== 'all' && x !== t);
      if (prev.includes(t)) return without.length ? without : ['all'];
      return [...without, t];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !currentAccount) return;
    setIsSending(true);
    setTimeout(() => {
      createAnnouncement({
        authorId: currentAccount.id,
        authorName: currentAccount.name,
        authorRole: currentAccount.role,
        title: title.trim(),
        body: body.trim(),
        targets,
        priority,
        isPinned: false,
      });
      setIsSending(false);
      onClose();
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
      className="bg-white border border-slate-900/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-8 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-mint-500 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(20,184,166,0.3)]">
            <Send className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Soạn thông báo mới</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-slate-600 ml-1 block mb-2">Tiêu đề thông báo</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề thông báo..."
            className="w-full border border-slate-900/10 rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-mint-500/20 focus:border-mint-500/40 outline-none transition-all bg-slate-50/50 placeholder:text-slate-400"
            required
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-xs font-semibold text-slate-600 ml-1 block mb-2">Nội dung</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Soạn nội dung thông báo chi tiết..."
            rows={4}
            className="w-full border border-slate-900/10 rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-mint-500/20 focus:border-mint-500/40 outline-none transition-all bg-slate-50/50 placeholder:text-slate-400 resize-none"
            required
          />
          <p className="text-xs text-slate-400 mt-1 ml-1">{body.length} ký tự</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Targets */}
          <div>
            <label className="text-xs font-semibold text-slate-600 ml-1 block mb-2">Gửi đến</label>
            <div className="flex flex-wrap gap-2">
              {TARGET_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleTarget(opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    targets.includes(opt.value)
                      ? 'bg-mint-50 border-mint-400/50 text-mint-700 shadow-sm'
                      : 'bg-white border-slate-900/10 text-slate-500 hover:border-slate-900/20'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-semibold text-slate-600 ml-1 block mb-2">Mức độ</label>
            <div className="flex flex-col gap-1.5">
              {(['action', 'reminder', 'info'] as const).map(p => {
                const cfg = priorityConfig(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                      priority === p
                        ? cfg.badge
                        : 'bg-white border-slate-900/10 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cfg.icon}</span>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 bg-white border border-slate-900/10 text-slate-600 rounded-2xl text-sm font-semibold hover:bg-slate-50 transition-all">
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSending || !title.trim() || !body.trim()}
            className="flex-[2] py-3 bg-mint-600 text-white rounded-2xl text-sm font-semibold hover:bg-mint-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gửi thông báo
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ── Announcement Card ──────────────────────────────────────────
function AnnouncementCard({
  ann,
  canManage,
  onPin,
  onDelete,
}: {
  ann: Announcement;
  canManage: boolean;
  onPin: () => void;
  onDelete: () => void;
}) {
  const cfg = priorityConfig(ann.priority);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
      className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border-l-4 ${cfg.border} ${cfg.bg} ${
        ann.isPinned ? 'border-amber-200/60' : 'border-slate-900/5'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {ann.isPinned && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200/50 px-2.5 py-1 rounded-full">
              <Pin className="w-3 h-3" /> Đã ghim
            </span>
          )}
          <span className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
            {cfg.icon}
            {cfg.label}
          </span>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${targetBadgeStyle(ann.targets as AnnouncementTarget[])}`}>
            {targetLabel(ann.targets as AnnouncementTarget[])}
          </span>
        </div>
        {canManage && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onPin}
              title={ann.isPinned ? 'Bỏ ghim' : 'Ghim thông báo'}
              className={`p-2 rounded-xl transition-colors ${ann.isPinned ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className={`text-base font-semibold text-slate-900 mb-2 ${ann.priority === 'action' ? 'text-rose-700' : ''}`}>
        {ann.title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed">{ann.body}</p>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
        <div className="w-6 h-6 rounded-full bg-mint-100 flex items-center justify-center text-mint-600 text-[10px] font-bold shrink-0">
          {ann.authorName.charAt(0)}
        </div>
        <span className="text-xs font-medium text-slate-600">{ann.authorName}</span>
        <span className="text-slate-300">·</span>
        <span className="text-xs text-slate-400">{ann.authorRole}</span>
        <span className="text-slate-300">·</span>
        <span className="text-xs text-slate-400 ml-auto">{relativeTime(ann.createdAt)}</span>
      </div>
    </motion.div>
  );
}

// ── Read-only View for Student/Parent ─────────────────────────
function ViewerEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
        <Bell className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-sm font-semibold text-slate-500">Chưa có thông báo mới</p>
      <p className="text-xs text-slate-400 mt-1">Các thông báo từ nhà trường sẽ xuất hiện ở đây.</p>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function AnnouncementsPage() {
  const { announcements, deleteAnnouncement, pinAnnouncement, canAccess, currentAccount } = useAppContext();
  const [showCompose, setShowCompose] = useState(false);
  const [filterTarget, setFilterTarget] = useState<AnnouncementTarget | 'all'>('all');

  const canManage = canAccess('manage_classes');

  // Determine what announcements this user can see
  const myRole = currentAccount?.role ?? '';
  const relevantAnnouncements = useMemo(() => {
    if (canManage) return announcements; // Admin/Teacher sees all
    // Parent/Student sees only announcements targeted to them or 'all'
    return announcements.filter(a => {
      if (a.targets.includes('all')) return true;
      if (myRole === 'Học viên' && a.targets.includes('student')) return true;
      if (myRole === 'Phụ huynh' && a.targets.includes('parent')) return true;
      return false;
    });
  }, [announcements, canManage, myRole]);

  // Sort: pinned first, then createdAt desc
  const sorted = useMemo(() => [...relevantAnnouncements].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }), [relevantAnnouncements]);

  const filtered = useMemo(() => filterTarget === 'all'
    ? sorted
    : sorted.filter(a => a.targets.includes('all') || a.targets.includes(filterTarget))
  , [sorted, filterTarget]);

  return (
    <div className="space-y-8 pb-10 pt-4">
      {/* ── Page Header ── */}
      <div className="flex items-end justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-slate-900 tracking-tight"
          >
            {canManage ? 'Thông báo & Liên lạc' : 'Thông báo'}
          </motion.h1>
          <p className="text-slate-500 mt-1 text-sm">
            {canManage
              ? 'Tạo và quản lý thông báo gửi đến học viên, phụ huynh và giáo viên.'
              : 'Cập nhật thông báo mới nhất từ trung tâm.'}
          </p>
        </div>

        {canManage && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCompose(v => !v)}
            className="flex items-center gap-2 px-6 py-3 bg-mint-600 text-white rounded-full text-sm font-bold hover:bg-mint-700 transition-all shadow-sm shadow-mint-200 shrink-0"
          >
            {showCompose ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCompose ? 'Đóng' : 'Tạo thông báo'}
          </motion.button>
        )}
      </div>

      {/* ── Compose Form (Teacher/Admin only) ── */}
      <AnimatePresence>
        {showCompose && canManage && (
          <ComposeForm onClose={() => setShowCompose(false)} />
        )}
      </AnimatePresence>

      {/* ── Stats Bar (Admin/Teacher only) ── */}
      {canManage && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Tổng thông báo', value: announcements.length, color: 'bg-slate-50 text-slate-700' },
            { label: 'Khẩn cấp', value: announcements.filter(a => a.priority === 'action').length, color: 'bg-rose-50 text-rose-700' },
            { label: 'Nhắc nhở', value: announcements.filter(a => a.priority === 'reminder').length, color: 'bg-amber-50 text-amber-700' },
            { label: 'Đã ghim', value: announcements.filter(a => a.isPinned).length, color: 'bg-amber-50 text-amber-700' },
          ].map((stat, i) => (
            <div key={i} className={`rounded-2xl border border-slate-100 ${stat.color} p-4`}>
              <p className="text-2xl font-black tabular-nums">{stat.value}</p>
              <p className="text-xs font-semibold mt-0.5 opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter Bar (Admin/Teacher only) ── */}
      {canManage && (
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'teacher', 'student', 'parent'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterTarget(t)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all ${
                filterTarget === t
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {t === 'all' ? 'Tất cả' : t === 'teacher' ? 'Giáo viên' : t === 'student' ? 'Học viên' : 'Phụ huynh'}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 font-medium">{filtered.length} thông báo</span>
        </div>
      )}

      {/* ── Announcement List ── */}
      {filtered.length === 0 ? (
        canManage ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
              <Megaphone className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Chưa có thông báo nào</p>
            <button
              onClick={() => setShowCompose(true)}
              className="mt-4 text-sm text-mint-600 hover:text-mint-700 font-semibold"
            >
              + Tạo thông báo đầu tiên
            </button>
          </div>
        ) : (
          <ViewerEmptyState />
        )
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map(ann => (
              <React.Fragment key={ann.id}>
                <AnnouncementCard
                  ann={ann}
                  canManage={canManage}
                  onPin={() => pinAnnouncement(ann.id)}
                  onDelete={() => deleteAnnouncement(ann.id)}
                />
              </React.Fragment>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
