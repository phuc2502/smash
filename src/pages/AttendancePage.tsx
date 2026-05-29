import {
  ClipboardCheck, CalendarDays, CheckCircle2, XCircle, Clock, FileText,
  Filter, Plus, Users, Lock, ChevronLeft, ChevronRight, Search, AlertCircle, Send, Unlock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  useAppContext, AttendanceStatus, AttendanceSession,
  ROLE_LABELS
} from "../context/AppContext";
import AttendanceModal from "../components/modals/AttendanceModal";
import SMSNotificationPopup from "../components/modals/SMSNotificationPopup";

type TabKey = 'by_class' | 'by_student' | 'history';

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; icon: typeof CheckCircle2; bg: string; text: string }> = {
  present: { label: 'Có mặt', icon: CheckCircle2, bg: 'bg-mint-100', text: 'text-mint-600' },
  absent: { label: 'Vắng KP', icon: XCircle, bg: 'bg-rose-100', text: 'text-rose-600' },
  late: { label: 'Đi muộn', icon: Clock, bg: 'bg-amber-100', text: 'text-amber-600' },
  excused: { label: 'Vắng CP', icon: FileText, bg: 'bg-blue-100', text: 'text-blue-600' },
};

export default function AttendancePage() {
  const {
    canAccess, currentAccount, classes, users, attendanceSessions,
    updateAttendanceRecord, finalizeAttendanceSession, unfinalizeAttendanceSession,
    classStudentMap, parentChildMap,
  } = useAppContext();

  // Bulletproof safety fallbacks for context state
  const safeClasses = classes ?? [];
  const safeUsers = users ?? [];
  const safeAttendanceSessions = attendanceSessions ?? [];
  const safeClassStudentMap = classStudentMap ?? {};
  const safeParentChildMap = parentChildMap ?? {};

  const canView = canAccess('view_attendance');
  const canManage = canAccess('manage_attendance');

  // Student cannot view → redirect
  if (!canView) return <Navigate to="/dashboard" replace />;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('by_class');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSMSOpen, setIsSMSOpen] = useState(false);
  const [smsStudentData, setSmsStudentData] = useState<{ studentId: string; studentName: string; status: AttendanceStatus; reason?: string } | null>(null);

  // Determine role
  const isParent = currentAccount?.role === ROLE_LABELS.parent;
  const isStudent = currentAccount?.role === ROLE_LABELS.student;
  const parentChildIds = isParent && currentAccount ? (safeParentChildMap[currentAccount.id] ?? []) : [];
  const studentId = isStudent && currentAccount ? currentAccount.id : null;

  const [selectedChildId, setSelectedChildId] = useState<string>('all');

  const parentChildren = useMemo(() => {
    return safeUsers.filter(u => u && parentChildIds.includes(u.id));
  }, [safeUsers, parentChildIds]);

  const activeParentChildIds = useMemo(() => {
    if (!isParent) return [];
    if (selectedChildId === 'all') return parentChildIds;
    return [selectedChildId];
  }, [isParent, selectedChildId, parentChildIds]);

  // Filter classes based on role
  const availableClasses = useMemo(() => {
    if (isParent) {
      return safeClasses.filter(c => {
        if (!c) return false;
        const studentIds = safeClassStudentMap[c.id] ?? [];
        return activeParentChildIds.some(pid => studentIds.includes(pid));
      });
    }
    if (isStudent && studentId) {
      return safeClasses.filter(c => {
        if (!c) return false;
        const studentIds = safeClassStudentMap[c.id] ?? [];
        return studentIds.includes(studentId);
      });
    }
    return safeClasses;
  }, [safeClasses, safeClassStudentMap, isParent, activeParentChildIds, isStudent, studentId]);

  // All sessions, filtered for parent/student
  const filteredSessions = useMemo(() => {
    const sessions = safeAttendanceSessions.filter(Boolean);
    if (isParent) {
      return sessions
        .filter(s => {
          const studentIds = safeClassStudentMap[s.classId] ?? [];
          return activeParentChildIds.some(pid => studentIds.includes(pid));
        })
        .map(s => {
          const childRecords = (s.records ?? []).filter(r => r && activeParentChildIds.includes(r.studentId));
          return {
            ...s,
            records: childRecords,
            totalStudents: childRecords.length,
            presentCount: childRecords.filter(r => r.status === 'present').length,
            absentCount: childRecords.filter(r => r.status === 'absent').length,
            lateCount: childRecords.filter(r => r.status === 'late').length,
            excusedCount: childRecords.filter(r => r.status === 'excused').length,
          } as AttendanceSession;
        });
    }
    if (isStudent && studentId) {
      // For student: only show sessions where they have a record, filter records to own
      return sessions
        .filter(s => s.records && s.records.some(r => r && r.studentId === studentId))
        .map(s => {
          const ownRecords = (s.records ?? []).filter(r => r && r.studentId === studentId);
          return {
            ...s,
            records: ownRecords,
            totalStudents: ownRecords.length,
            presentCount: ownRecords.filter(r => r.status === 'present').length,
            absentCount: ownRecords.filter(r => r.status === 'absent').length,
            lateCount: ownRecords.filter(r => r.status === 'late').length,
            excusedCount: ownRecords.filter(r => r.status === 'excused').length,
          } as AttendanceSession;
        });
    }
    return sessions;
  }, [safeAttendanceSessions, safeClassStudentMap, isParent, activeParentChildIds, isStudent, studentId]);

  // Stats
  const totalSessions = filteredSessions.length;
  const allRecords = filteredSessions.flatMap(s => s.records ?? []);
  const totalRecords = allRecords.length;
  const presentRate = totalRecords > 0 ? Math.round((allRecords.filter(r => r && r.status === 'present').length / totalRecords) * 100) : 0;
  const absentRate = totalRecords > 0 ? Math.round((allRecords.filter(r => r && r.status === 'absent').length / totalRecords) * 100) : 0;
  const lateRate = totalRecords > 0 ? Math.round((allRecords.filter(r => r && r.status === 'late').length / totalRecords) * 100) : 0;

  // Current session for "by_class" tab
  const currentSession = useMemo(() => {
    if (!selectedClassId) return null;
    return filteredSessions.find(s => s.classId === selectedClassId && s.date === selectedDate) ?? null;
  }, [filteredSessions, selectedClassId, selectedDate]);

  const isLocked24h = useMemo(() => {
    if (!currentSession) return false;
    if (currentAccount?.role === ROLE_LABELS.admin) return false;
    
    const LIMIT_MS = 24 * 60 * 60 * 1000;
    const sessionTime = new Date(currentSession.date).getTime();
    if (isNaN(sessionTime)) return false;
    const elapsed = Date.now() - sessionTime;
    if (elapsed > LIMIT_MS) return true;
    
    const firstRecordMarkedAt = currentSession.records?.[0]?.markedAt;
    if (firstRecordMarkedAt) {
      const recordTime = new Date(firstRecordMarkedAt).getTime();
      if (!isNaN(recordTime)) {
        const recordElapsed = Date.now() - recordTime;
        if (recordElapsed > LIMIT_MS) return true;
      }
    }
    
    return false;
  }, [currentSession, currentAccount]);

  // Students for "by_student" tab
  const studentList = useMemo(() => {
    const studentUsers = safeUsers.filter(u => u && u.role === ROLE_LABELS.student);
    if (isParent) return studentUsers.filter(u => parentChildIds.includes(u.id));
    if (isStudent && studentId) return studentUsers.filter(u => u.id === studentId);
    return studentUsers;
  }, [safeUsers, isParent, parentChildIds, isStudent, studentId]);

  const selectedStudentRecords = useMemo(() => {
    if (!selectedStudentId) return [];
    return filteredSessions.flatMap(s => s.records.filter(r => r.studentId === selectedStudentId));
  }, [filteredSessions, selectedStudentId]);

  // History
  const historySessions = useMemo(() => {
    let sessions = [...filteredSessions].sort((a, b) => b.date.localeCompare(a.date));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      sessions = sessions.filter(s => s.className.toLowerCase().includes(q) || s.classId.toLowerCase().includes(q));
    }
    return sessions;
  }, [filteredSessions, searchQuery]);

  const navigateDate = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formatDateVN = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const stats = [
    { label: 'Tổng buổi', value: totalSessions.toString(), icon: CalendarDays, color: 'mint' },
    { label: 'Có mặt', value: `${presentRate}%`, icon: CheckCircle2, color: 'mint' },
    { label: 'Vắng', value: `${absentRate}%`, icon: XCircle, color: 'rose' },
    { label: 'Đi trễ', value: `${lateRate}%`, icon: Clock, color: 'amber' },
  ];

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'by_class', label: 'Theo lớp' },
    { key: 'by_student', label: 'Theo học viên' },
    { key: 'history', label: 'Lịch sử' },
  ];

  const handleStatusChange = (sessionId: string, studentId: string, newStatus: AttendanceStatus) => {
    if (isLocked24h) return;
    setErrorMsg('');
    updateAttendanceRecord(sessionId, studentId, newStatus);
  };

  const handleNoteChange = (sessionId: string, studentId: string, status: AttendanceStatus, note: string) => {
    if (isLocked24h) return;
    setErrorMsg('');
    updateAttendanceRecord(sessionId, studentId, status, note);
  };

  const handleFinalizeSession = (sessionId: string) => {
    if (!currentSession) return;
    const invalid = currentSession.records.filter(r => r.status === 'excused' && (!r.note || !r.note.trim()));
    if (invalid.length > 0) {
      setErrorMsg(`Không thể khóa sổ! Vui lòng nhập lý do vắng có phép cho học viên: ${invalid.map(r => r.studentName).join(', ')}`);
      return;
    }
    setErrorMsg('');
    finalizeAttendanceSession(sessionId);
  };

  const handleUnfinalizeSession = (sessionId: string) => {
    if (!currentSession) return;
    setErrorMsg('');
    unfinalizeAttendanceSession(sessionId);
  };

  const handleOpenSMSPopup = (record: { studentId: string; studentName: string; status: AttendanceStatus; note?: string }) => {
    setSmsStudentData({
      studentId: record.studentId,
      studentName: record.studentName,
      status: record.status,
      reason: record.note,
    });
    setIsSMSOpen(true);
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-black text-slate-900 tracking-tight">
            Điểm danh
          </motion.h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">
            {isParent ? 'Theo dõi tình hình đi học của con em bạn.' : 'Quản lý điểm danh học viên theo từng buổi học, theo dõi tỷ lệ chuyên cần.'}
          </p>
        </div>
        {canManage ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-xl hover:shadow-mint-200 hover:-translate-y-0.5 transition-all shadow-lg shadow-mint-100 whitespace-nowrap w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Điểm danh mới
          </button>
        ) : (
          (isStudent || isParent) && (
            <Link
              to="/attendance/leave-requests"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-100 whitespace-nowrap w-full sm:w-auto justify-center"
            >
              <CalendarDays className="w-5 h-5" />
              Gửi đơn nghỉ phép
            </Link>
          )
        )}
      </div>

      {isParent && parentChildren.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-mint-50 text-mint-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">Xem điểm danh của con em</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Tài khoản Phụ huynh</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedChildId}
              onChange={e => {
                const childId = e.target.value;
                setSelectedChildId(childId);
                setSelectedClassId('');
                setSelectedStudentId(childId === 'all' ? '' : childId);
              }}
              className="w-full sm:w-64 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50"
            >
              <option value="all">Tất cả con em ({parentChildren.length})</option>
              {parentChildren.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
              ))}
            </select>
          </div>
        </motion.div>
      )}

      {canManage && <AttendanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}

      {smsStudentData && (
        <SMSNotificationPopup
          isOpen={isSMSOpen}
          onClose={() => {
            setIsSMSOpen(false);
            setSmsStudentData(null);
          }}
          studentId={smsStudentData.studentId}
          studentName={smsStudentData.studentName}
          classId={selectedClassId}
          className={safeClasses.find(c => c && c.id === selectedClassId)?.title ?? ""}
          date={selectedDate}
          status={smsStudentData.status}
          reason={smsStudentData.reason}
          isCorrection={currentSession?.isFinalized ?? false}
        />
      )}

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
            className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-500 cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
              stat.color === 'mint' ? 'bg-mint-50 text-mint-600' : stat.color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-4xl font-black text-slate-900 leading-none">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-mint-600" />
            Bảng điểm danh
          </h3>
          <div className="flex items-center gap-2">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.key ? 'bg-mint-600 text-white shadow-lg shadow-mint-100 scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* ══ TAB: BY CLASS ══ */}
            {activeTab === 'by_class' && (
              <motion.div key="by_class" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none"
                  >
                    <option value="">-- Chọn lớp --</option>
                    {availableClasses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.id})</option>)}
                  </select>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigateDate(-1)} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
                      <ChevronLeft className="w-4 h-4 text-slate-500" />
                    </button>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                      className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none"
                    />
                    <button onClick={() => navigateDate(1)} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>

                {selectedClassId && (
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formatDateVN(selectedDate)}</p>
                )}

                {selectedClassId && !currentSession && (
                  <div className="py-16 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                      <CalendarDays className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">Chưa có dữ liệu điểm danh</h4>
                      <p className="text-sm text-slate-500 font-medium">Ngày này chưa có phiên điểm danh nào cho lớp đã chọn.</p>
                    </div>
                    {canManage && (
                      <button onClick={() => setIsModalOpen(true)}
                        className="mt-2 px-5 py-2.5 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-full font-bold text-xs hover:shadow-lg transition-all"
                      >
                        + Tạo điểm danh
                      </button>
                    )}
                  </div>
                )}

                {!selectedClassId && (
                  <div className="py-16 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-mint-50 rounded-full flex items-center justify-center text-mint-400">
                      <Users className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Vui lòng chọn lớp học để xem điểm danh.</p>
                  </div>
                )}

                {currentSession && (
                  <div className="space-y-6">
                    {/* Attendance Mini Dashboard */}
                    <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                      <div className="md:col-span-1 border-r border-slate-200/60 pr-4 flex flex-col items-center md:items-start">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chuyên cần hôm nay</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-4xl font-black text-slate-900">
                            {currentSession.totalStudents > 0
                              ? Math.round(((currentSession.presentCount + currentSession.lateCount) / currentSession.totalStudents) * 100)
                              : 0}%
                          </span>
                          <span className="text-xs font-bold text-mint-600">Đạt yêu cầu</span>
                        </div>
                        {/* Simple progress bar */}
                        <div className="w-full bg-slate-200/60 rounded-full h-2 mt-3 overflow-hidden">
                          <div
                            className="bg-mint-500 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                currentSession.totalStudents > 0
                                  ? Math.round(((currentSession.presentCount + currentSession.lateCount) / currentSession.totalStudents) * 100)
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded-2xl border border-slate-100/80 flex flex-col items-center justify-center shadow-sm">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Có mặt</span>
                          <span className="text-xl font-black text-mint-600 mt-1">{currentSession.presentCount}</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-slate-100/80 flex flex-col items-center justify-center shadow-sm">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vắng KP</span>
                          <span className="text-xl font-black text-rose-600 mt-1">{currentSession.absentCount}</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-slate-100/80 flex flex-col items-center justify-center shadow-sm">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vắng CP</span>
                          <span className="text-xl font-black text-blue-600 mt-1">{currentSession.excusedCount}</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-slate-100/80 flex flex-col items-center justify-center shadow-sm">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Đi muộn</span>
                          <span className="text-xl font-black text-amber-600 mt-1">{currentSession.lateCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Locking state banner */}
                    {isLocked24h && (
                      <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-sm">
                        <Lock className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                        <span>Hệ thống đã tự động khóa chỉnh sửa điểm danh quá hạn 24 giờ.</span>
                        {currentAccount?.role === ROLE_LABELS.admin && (
                          <span className="ml-auto px-2 py-1 bg-amber-200/50 rounded-lg text-[9px] text-amber-900 uppercase font-black tracking-widest flex items-center gap-1">
                            <Unlock className="w-3 h-3" /> Admin Bypassed
                          </span>
                        )}
                      </div>
                    )}

                    {/* Error message banner */}
                    {errorMsg && (
                      <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-xs text-rose-600 font-bold">
                        <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500 mt-0.5" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50/80">
                            <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">STT</th>
                            <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Học viên</th>
                            <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[320px]">Trạng thái</th>
                            <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ghi chú lý do</th>
                            <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-36">Thông báo SMS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentSession.records.map((record, idx) => {
                            const cfg = STATUS_CONFIG[record.status];
                            const canEditThisRecord = canManage && !currentSession.isFinalized && !isLocked24h;
                            
                            return (
                              <tr key={record.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-4 font-bold text-slate-400">{idx + 1}</td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <img src={`https://picsum.photos/seed/${record.studentId}/100/100`} className="w-8 h-8 rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
                                    <div>
                                      <p className="font-bold text-slate-800">{record.studentName}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{record.studentId}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  {canEditThisRecord ? (
                                    <div className="flex flex-wrap gap-1">
                                      {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, typeof cfg][]).map(([statusVal, opt]) => {
                                        const active = record.status === statusVal;
                                        return (
                                          <button
                                            key={statusVal}
                                            onClick={() => handleStatusChange(currentSession.id, record.studentId, statusVal)}
                                            className={`px-2.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                                              active
                                                ? statusVal === 'present' ? 'bg-mint-600 text-white shadow-lg shadow-mint-100/50'
                                                  : statusVal === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100/50'
                                                  : statusVal === 'late' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100/50'
                                                  : 'bg-blue-500 text-white shadow-lg shadow-blue-100/50'
                                                : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                                            }`}
                                          >
                                            <opt.icon className="w-3 h-3" />
                                            {statusVal === 'present' ? 'Có mặt' : statusVal === 'absent' ? 'Vắng KP' : statusVal === 'late' ? 'Đi muộn' : 'Vắng CP'}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-black ${cfg.bg} ${cfg.text} inline-flex items-center gap-1`}>
                                      <cfg.icon className="w-3 h-3" /> {cfg.label}
                                    </span>
                                  )}
                                </td>
                                <td className="px-5 py-4">
                                  {canEditThisRecord ? (
                                    <input
                                      type="text"
                                      placeholder={record.status === 'excused' ? "Lý do vắng có phép (Bắt buộc)..." : "Ghi chú lý do..."}
                                      value={record.note ?? ''}
                                      onChange={e => handleNoteChange(currentSession.id, record.studentId, record.status, e.target.value)}
                                      className={`w-full px-3 py-1.5 bg-white border rounded-xl text-xs font-medium focus:ring-2 outline-none transition-all ${
                                        record.status === 'excused' && (!record.note || !record.note.trim())
                                          ? 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500'
                                          : 'border-slate-200 focus:ring-mint-500/10 focus:border-mint-500'
                                      }`}
                                    />
                                  ) : (
                                    <span className="text-xs text-slate-600 font-medium">{record.note ?? '—'}</span>
                                  )}
                                </td>
                                <td className="px-5 py-4">
                                  {record.status !== 'present' ? (
                                    <button
                                      onClick={() => handleOpenSMSPopup(record)}
                                      className="px-3 py-1.5 bg-mint-50 text-mint-600 hover:bg-mint-100 border border-mint-200 rounded-full font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                                    >
                                      <Send className="w-3 h-3" /> Gửi SMS
                                    </button>
                                  ) : (
                                    <span className="text-xs text-slate-300 font-bold">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Actions */}
                    {canManage && (
                      <div className="flex justify-end gap-3">
                        {!currentSession.isFinalized ? (
                          <button
                            onClick={() => handleFinalizeSession(currentSession.id)}
                            className="px-6 py-3 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                          >
                            <Lock className="w-4 h-4" /> Khóa sổ điểm danh
                          </button>
                        ) : (
                          currentAccount?.role === ROLE_LABELS.admin && (
                            <button
                              onClick={() => handleUnfinalizeSession(currentSession.id)}
                              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-400 text-white rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:shadow-xl hover:shadow-amber-200 hover:-translate-y-0.5 transition-all shadow-lg shadow-amber-100"
                            >
                              <Unlock className="w-4 h-4" /> Mở khóa sổ điểm danh
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ TAB: BY STUDENT ══ */}
            {activeTab === 'by_student' && (
              <motion.div key="by_student" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <select
                  value={selectedStudentId}
                  onChange={e => {
                    const val = e.target.value;
                    setSelectedStudentId(val);
                    if (isParent) {
                      setSelectedChildId(val || 'all');
                    }
                  }}
                  className="w-full sm:w-80 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none"
                >
                  <option value="">-- Chọn học viên --</option>
                  {studentList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                </select>

                {selectedStudentId && selectedStudentRecords.length === 0 && (
                  <div className="py-12 text-center text-sm text-slate-500 font-medium">Chưa có dữ liệu điểm danh cho học viên này.</div>
                )}

                {selectedStudentId && selectedStudentRecords.length > 0 && (
                  <>
                    {/* Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map(s => {
                        const count = selectedStudentRecords.filter(r => r.status === s).length;
                        const cfg = STATUS_CONFIG[s];
                        return (
                          <div key={s} className={`p-4 rounded-2xl ${cfg.bg} flex flex-col items-center gap-1`}>
                            <cfg.icon className={`w-5 h-5 ${cfg.text}`} />
                            <span className={`text-2xl font-black ${cfg.text}`}>{count}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.text}`}>{cfg.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Records list */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50/80">
                            <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày</th>
                            <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lớp</th>
                            <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                            <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudentRecords.map(r => {
                            const cfg = STATUS_CONFIG[r.status];
                            const session = filteredSessions.find(s => s.records.some(rec => rec.id === r.id));
                            return (
                              <tr key={r.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-4 font-bold text-slate-700">{formatDateVN(r.date)}</td>
                                <td className="px-5 py-4 font-medium text-slate-600">{session?.className ?? r.classId}</td>
                                <td className="px-5 py-4">
                                  <span className={`px-3 py-1.5 rounded-full text-xs font-black ${cfg.bg} ${cfg.text} inline-flex items-center gap-1`}>
                                    <cfg.icon className="w-3 h-3" /> {cfg.label}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-xs text-slate-500 font-medium">{r.note ?? '—'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {!selectedStudentId && (
                  <div className="py-16 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-mint-50 rounded-full flex items-center justify-center text-mint-400">
                      <Users className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Vui lòng chọn học viên để xem lịch sử điểm danh.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ TAB: HISTORY ══ */}
            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="relative group w-full sm:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-mint-600 transition-colors" />
                  <input type="text" placeholder="Tìm theo tên lớp..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full font-bold text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                  />
                </div>

                {historySessions.length === 0 && (
                  <div className="py-12 text-center text-sm text-slate-500 font-medium">Không có phiên điểm danh nào.</div>
                )}

                <div className="space-y-4">
                  {historySessions.map((session) => {
                    // Check if locked after 24h
                    const isSessionLocked24h = (() => {
                      if (currentAccount?.role === ROLE_LABELS.admin) return false;
                      const LIMIT_MS = 24 * 60 * 60 * 1000;
                      const sessionTime = new Date(session.date).getTime();
                      const elapsed = Date.now() - sessionTime;
                      if (elapsed > LIMIT_MS) return true;
                      
                      const firstRecordMarkedAt = session.records[0]?.markedAt;
                      if (firstRecordMarkedAt) {
                        const recordElapsed = Date.now() - new Date(firstRecordMarkedAt).getTime();
                        if (recordElapsed > LIMIT_MS) return true;
                      }
                      return false;
                    })();

                    return (
                      <motion.div
                        key={session.id}
                        layout
                        onClick={() => {
                          setSelectedClassId(session.classId);
                          setSelectedDate(session.date);
                          setActiveTab('by_class');
                          setErrorMsg('');
                        }}
                        className="bg-slate-50/50 rounded-[24px] border border-slate-100 p-6 hover:bg-white hover:shadow-xl hover:-translate-y-0.5 cursor-pointer transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-base font-black text-slate-900 group-hover:text-mint-600 transition-colors">{session.className}</h4>
                              {session.isFinalized ? (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Đã khóa sổ
                                </span>
                              ) : isSessionLocked24h ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Khóa 24h
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-mint-50 text-mint-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                  <Unlock className="w-2.5 h-2.5" /> Đang mở
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formatDateVN(session.date)} · {session.classId}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
                            <span className="px-2.5 py-1 rounded-full bg-mint-100 text-mint-600">✅ {session.presentCount}</span>
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-600">❌ {session.absentCount}</span>
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-600">⏰ {session.lateCount}</span>
                            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-600">📝 {session.excusedCount}</span>
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">👥 {session.totalStudents}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
