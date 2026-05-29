import { X, CheckCircle2, XCircle, Clock, FileText, Users, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo } from "react";
import { useAppContext, AttendanceStatus, AttendanceSession, AttendanceRecord } from "../../context/AppContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; icon: typeof CheckCircle2; color: string }[] = [
  { value: 'present', label: 'Có mặt', icon: CheckCircle2, color: 'mint' },
  { value: 'absent', label: 'Vắng KP', icon: XCircle, color: 'rose' },
  { value: 'late', label: 'Đi muộn', icon: Clock, color: 'amber' },
  { value: 'excused', label: 'Vắng CP', icon: FileText, color: 'blue' },
];

interface StudentRow {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  note: string;
}

export default function AttendanceModal({ isOpen, onClose }: Props) {
  const { classes, users, currentAccount, markAttendance, appendActivity, classStudentMap, leaveRequests } = useAppContext();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [step, setStep] = useState<'select' | 'mark'>('select');
  const [errorMsg, setErrorMsg] = useState('');

  const activeClasses = useMemo(() => classes.filter(c => c.status !== 'Đã kết thúc'), [classes]);

  const loadStudents = () => {
    if (!selectedClassId) return;
    const studentIds = classStudentMap[selectedClassId] ?? [];
    const studentRows: StudentRow[] = studentIds.map(sid => {
      const user = users.find(u => u.id === sid);
      
      const approvedLeave = leaveRequests?.find(lr => 
        lr.studentId === sid && 
        lr.classId === selectedClassId && 
        lr.date === selectedDate && 
        lr.status === 'approved'
      );

      if (approvedLeave) {
        return { 
          studentId: sid, 
          studentName: user?.name ?? sid, 
          status: 'excused' as AttendanceStatus, 
          note: `Vắng có phép: ${approvedLeave.reason}` 
        };
      }


      return { studentId: sid, studentName: user?.name ?? sid, status: 'present' as AttendanceStatus, note: '' };
    });
    setRows(studentRows);
    setStep('mark');
  };

  const updateRow = (idx: number, data: Partial<StudentRow>) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, ...data } : r));
  };

  const markAllPresent = () => {
    setRows(prev => prev.map(r => ({ ...r, status: 'present' as AttendanceStatus })));
  };

  const handleSubmit = () => {
    if (!currentAccount) return;

    // Enforce reasons for excused absences
    const invalidRows = rows.filter(r => r.status === 'excused' && (!r.note || r.note.trim() === ''));
    if (invalidRows.length > 0) {
      setErrorMsg(`Vui lòng nhập lý do vắng có phép cho học viên: ${invalidRows.map(r => r.studentName).join(', ')}`);
      return;
    }
    setErrorMsg('');

    const cls = classes.find(c => c.id === selectedClassId);
    const now = new Date().toISOString();
    const records: AttendanceRecord[] = rows.map((r, i) => ({
      id: `ATR-${Date.now()}-${i}`,
      classId: selectedClassId,
      studentId: r.studentId,
      studentName: r.studentName,
      date: selectedDate,
      status: r.status,
      note: r.note || undefined,
      markedBy: currentAccount.id,
      markedAt: now,
    }));

    const session: AttendanceSession = {
      id: `ATT-${Date.now()}`,
      classId: selectedClassId,
      className: cls?.title ?? selectedClassId,
      date: selectedDate,
      totalStudents: rows.length,
      presentCount: rows.filter(r => r.status === 'present').length,
      absentCount: rows.filter(r => r.status === 'absent').length,
      lateCount: rows.filter(r => r.status === 'late').length,
      excusedCount: rows.filter(r => r.status === 'excused').length,
      records,
      isFinalized: false,
    };
    markAttendance(session);
    appendActivity(
      `Điểm danh lớp ${cls?.title ?? selectedClassId}`,
      `Ngày ${selectedDate} — ${records.filter(r => r.status === 'present').length}/${records.length} có mặt`,
      'mint'
    );
    handleClose();
  };

  const handleClose = () => {
    setStep('select');
    setSelectedClassId('');
    setRows([]);
    setErrorMsg('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Điểm danh mới</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {step === 'select' ? 'Chọn lớp và ngày' : 'Đánh dấu trạng thái'}
                </p>
              </div>
              <button onClick={handleClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {step === 'select' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Chọn lớp học</label>
                    <select
                      value={selectedClassId}
                      onChange={e => setSelectedClassId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none"
                    >
                      <option value="">-- Chọn lớp --</option>
                      {activeClasses.map(c => (
                        <option key={c.id} value={c.id}>{c.title} ({c.id})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Ngày điểm danh</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none"
                    />
                  </div>
                  {selectedClassId && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                      <Users className="w-4 h-4" />
                      <span>{classStudentMap[selectedClassId]?.length ?? 0} học viên trong lớp</span>
                    </div>
                  )}
                </>
              )}

              {step === 'mark' && (
                <>
                  {errorMsg && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-xs text-rose-600 font-bold mb-4">
                      <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-slate-600">
                      {rows.length} học viên · {classes.find(c => c.id === selectedClassId)?.title}
                    </p>
                    <button onClick={markAllPresent} className="text-xs font-black text-mint-600 uppercase tracking-widest hover:text-mint-700 transition-colors">
                      ✅ Tất cả có mặt
                    </button>
                  </div>

                  <div className="space-y-3">
                    {rows.map((row, idx) => (
                      <div key={row.studentId} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-mint-100 text-mint-700 flex items-center justify-center text-xs font-black">{idx + 1}</span>
                            <span className="font-bold text-sm text-slate-800">{row.studentName}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.studentId}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          {STATUS_OPTIONS.map(opt => {
                            const active = row.status === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => updateRow(idx, { status: opt.value })}
                                className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 ${
                                  active
                                    ? opt.color === 'mint' ? 'bg-mint-600 text-white shadow-lg shadow-mint-100'
                                    : opt.color === 'rose' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100'
                                    : opt.color === 'amber' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100'
                                    : 'bg-blue-500 text-white shadow-lg shadow-blue-100'
                                    : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <opt.icon className="w-3 h-3" />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                        {(row.status === 'absent' || row.status === 'late' || row.status === 'excused') && (
                          <input
                            type="text"
                            placeholder={row.status === 'excused' ? "Lý do vắng có phép (Bắt buộc)..." : "Ghi chú (lý do)..."}
                            value={row.note}
                            onChange={e => updateRow(idx, { note: e.target.value })}
                            className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-medium focus:ring-2 outline-none mt-1 transition-all ${
                              row.status === 'excused' && !row.note.trim()
                                ? 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500'
                                : 'border-slate-200 focus:ring-mint-500/10 focus:border-mint-500'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              {step === 'mark' && (
                <button onClick={() => setStep('select')} className="px-5 py-3 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                  ← Quay lại
                </button>
              )}
              <button onClick={handleClose} className="px-5 py-3 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                Hủy
              </button>
              {step === 'select' ? (
                <button
                  onClick={loadStudents}
                  disabled={!selectedClassId}
                  className="px-6 py-3 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-full font-bold text-sm hover:shadow-xl hover:shadow-mint-200 transition-all shadow-lg shadow-mint-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Tiếp tục →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-full font-bold text-sm hover:shadow-xl hover:shadow-mint-200 transition-all shadow-lg shadow-mint-100"
                >
                  Hoàn tất điểm danh
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
