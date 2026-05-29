import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, X, CheckCheck, Users, ShieldAlert, BookOpen,
  ClipboardCheck, AlertCircle, BookMarked, School, Megaphone,
  FileText, Inbox, ArrowRight,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import type { AppNotification, Announcement } from '../../context/AppContext';
import AnnouncementDetailModal from '../modals/AnnouncementDetailModal';

// ── Helper: relative time ─────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

// ── Helper: icon theo type ─────────────────────────────────────
function NotifIcon({ type }: { type: AppNotification['type'] }) {
  const cls = 'w-5 h-5';
  switch (type) {
    case 'user_request':    return <Users className={cls} />;
    case 'support_request': return <Inbox className={cls} />;
    case 'security':        return <ShieldAlert className={cls} />;
    case 'class_full':      return <School className={cls} />;
    case 'class_change':    return <School className={cls} />;
    case 'grading':         return <ClipboardCheck className={cls} />;
    case 'assignment_urgent': return <AlertCircle className={cls} />;
    case 'assignment_new':  return <BookOpen className={cls} />;
    case 'material':        return <FileText className={cls} />;
    case 'announcement':    return <Megaphone className={cls} />;
    default:                return <BookMarked className={cls} />;
  }
}

// ── Helper: icon bg + text color theo priority ─────────────────
function iconStyle(priority: AppNotification['priority']) {
  if (priority === 'action')   return 'bg-rose-50 text-rose-500';
  if (priority === 'reminder') return 'bg-amber-50 text-amber-500';
  return 'bg-slate-50 text-slate-400';
}

function leftBorder(priority: AppNotification['priority']) {
  if (priority === 'action')   return 'border-l-2 border-rose-400';
  if (priority === 'reminder') return 'border-l-2 border-amber-400';
  return 'border-l-2 border-transparent';
}

// ── Notification Item ──────────────────────────────────────────
function NotifItem({
  notif,
  isRead,
  onRead,
}: {
  notif: AppNotification;
  isRead: boolean;
  onRead: () => void;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    onRead();
    navigate(notif.href);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50/80 transition-colors text-left group ${leftBorder(notif.priority)} ${!isRead ? 'bg-mint-50/20' : ''}`}
    >
      <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 ${iconStyle(notif.priority)}`}>
        <NotifIcon type={notif.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${isRead ? 'text-slate-700 font-normal' : 'text-slate-900 font-medium'}`}>
          {notif.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.body}</p>
        <p className="text-[10px] text-slate-400 mt-1">{relativeTime(notif.createdAt)}</p>
      </div>
      {!isRead && (
        <div className="shrink-0 w-2 h-2 rounded-full bg-mint-500 mt-2" />
      )}
    </button>
  );
}

// ── Announcement Item (Tab Liên lạc) ──────────────────────────
function AnnouncementItem({ ann, onClick }: { ann: Announcement; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer px-4 py-3.5 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors ${ann.isPinned ? 'bg-amber-50/30' : ''}`}
    >
      {ann.isPinned && (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mb-1.5">
          📌 Ghim
        </span>
      )}
      <p className={`text-sm font-medium text-slate-900 ${ann.priority === 'action' ? 'text-rose-700' : ''}`}>
        {ann.title}
      </p>
      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ann.body}</p>
      <div className="flex items-center justify-between mt-1.5">
        <p className="text-[10px] text-slate-400">{ann.authorName} · {relativeTime(ann.createdAt)}</p>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
          ann.targets.includes('all') ? 'bg-slate-100 text-slate-500' :
          ann.targets.includes('teacher') ? 'bg-blue-50 text-blue-500' :
          'bg-mint-50 text-mint-600'
        }`}>
          {ann.targets.includes('all') ? 'Tất cả' :
           ann.targets.includes('teacher') ? 'Giáo viên' :
           ann.targets.includes('student') ? 'Học viên' : 'Phụ huynh'}
        </span>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────
function EmptyState({ tab }: { tab: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
        <Bell className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">
        {tab === 'action' ? 'Không có việc cần xử lý' :
         tab === 'messages' ? 'Chưa có thông báo nào' :
         'Bạn đã cập nhật hết rồi!'}
      </p>
      <p className="text-xs text-slate-400 mt-1">Khi có nội dung mới sẽ hiển thị ở đây.</p>
      <button
        onClick={() => navigate('/settings')}
        className="mt-4 text-xs text-mint-600 hover:text-mint-700 font-medium"
      >
        Cài đặt thông báo →
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
type Tab = 'all' | 'action' | 'messages';

export default function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    readNotificationIds,
    markAsRead,
    markAllAsRead,
    announcements,
    accountPreferences,
    canAccess,
  } = useAppContext();

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const canManageAnnouncements = canAccess('manage_classes');

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sound notification on new unread action items
  useEffect(() => {
    if (!accountPreferences.soundNotifications) return;
    const hasAction = notifications.some(
      n => n.priority === 'action' && !(readNotificationIds ?? []).includes(n.id)
    );
    if (!hasAction) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* ignore */ }
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actionNotifs = notifications.filter(n => n.priority === 'action');
  const unreadActionCount = actionNotifs.filter(n => !(readNotificationIds ?? []).includes(n.id)).length;

  // Badge color: red if has action, mint if only reminder/info
  const badgeColor = unreadActionCount > 0 ? 'bg-rose-500' : 'bg-mint-500';

  // Filtered list for current tab
  const displayedNotifs =
    activeTab === 'all' ? notifications :
    activeTab === 'action' ? actionNotifs : [];

  // Announcements for tab messages (pinned first)
  const sortedAnnouncements = [...announcements].sort((a, b) =>
    (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)
  );

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'all', label: 'Tất cả', badge: unreadCount > 0 ? unreadCount : undefined },
    { key: 'action', label: 'Cần xử lý', badge: unreadActionCount > 0 ? unreadActionCount : undefined },
    { key: 'messages', label: 'Liên lạc', badge: announcements.length > 0 ? announcements.length : undefined },
  ];

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Trigger ── */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className={`relative w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-xl transition-colors ${isOpen ? 'bg-slate-100' : ''}`}
      >
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] ${badgeColor} text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1 border-2 border-white`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
            className="absolute right-0 mt-4 w-[400px] bg-white rounded-2xl shadow-[0_8px_40px_rgb(0,0,0,0.1)] border border-slate-900/5 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Thông báo</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-[11px] text-mint-600 hover:text-mint-700 font-medium transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Đọc tất cả
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-0.5 border-b border-slate-100">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'text-slate-900 border-b-2 border-slate-900 -mb-px'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                    {tab.badge !== undefined && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        tab.key === 'action' ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[380px] overflow-y-auto">
              {activeTab !== 'messages' ? (
                displayedNotifs.length === 0 ? (
                  <EmptyState tab={activeTab} />
                ) : (
                  <div className="divide-y divide-slate-50 py-1">
                    {displayedNotifs.map(notif => (
                      <React.Fragment key={notif.id}>
                        <NotifItem
                          notif={notif}
                          isRead={(readNotificationIds ?? []).includes(notif.id)}
                          onRead={() => { markAsRead(notif.id); setIsOpen(false); }}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                )
              ) : (
                sortedAnnouncements.length === 0 ? (
                  <EmptyState tab="messages" />
                ) : (
                  <div className="divide-y divide-slate-50 py-1">
                    {sortedAnnouncements.map(ann => (
                      <React.Fragment key={ann.id}>
                        <AnnouncementItem
                          ann={ann}
                          onClick={() => setSelectedAnn(ann)}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
              <span className="text-[11px] text-slate-400">
                {notifications.length} thông báo · {unreadCount} chưa đọc
              </span>
              {canManageAnnouncements ? (
                <button
                  onClick={() => { setIsOpen(false); navigate('/announcements'); }}
                  className="flex items-center gap-1 text-[11px] text-mint-600 hover:text-mint-700 font-semibold transition-colors"
                >
                  Xem tất cả <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => { setIsOpen(false); }}
                  className="text-[11px] text-slate-400 hover:text-slate-600 font-medium"
                >
                  Đóng
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnnouncementDetailModal
        isOpen={selectedAnn !== null}
        announcement={selectedAnn}
        onClose={() => setSelectedAnn(null)}
      />
    </div>
  );
}
