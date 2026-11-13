import { useState, useMemo } from 'react';
import { X, UserPlus, Trash2, Users, AlertTriangle, ArrowRightLeft, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../../context/AppContext';

interface ManageStudentsModalProps {
  classId: string;
  className: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageStudentsModal({ classId, className, isOpen, onClose }: ManageStudentsModalProps) {
  const {
    users,
    classes,
    classStudentMap,
    gradeEntries,
    attendanceSessions,
    addStudentToClass,
    removeStudentFromClass,
    updateUserStatus,
    appendActivity,
  } = useAppContext();

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [removalStudentId, setRemovalStudentId] = useState('');
  const [transferTargetId, setTransferTargetId] = useState('');
  const [message, setMessage] = useState('');

  const currentStudentIds = classStudentMap[classId] ?? [];
  const classInfo = classes.find(cls => cls.id === classId);
  const isClassFull = Boolean(classInfo && classInfo.studentsCount >= classInfo.maxStudents);

  const currentStudents = useMemo(
    () => currentStudentIds.map(id => users.find(u => u.id === id)).filter(Boolean) as typeof users,
    [currentStudentIds, users]
  );

  const availableStudents = useMemo(
    () => users.filter(u => u.role === 'Học viên' && !currentStudentIds.includes(u.id)),
    [users, currentStudentIds]
  );

  const transferTargets = useMemo(
    () => classes.filter(cls =>
      cls.id !== classId &&
      !(classStudentMap[cls.id] ?? []).includes(removalStudentId) &&
      cls.studentsCount < cls.maxStudents
    ),
    [classes, classId, classStudentMap, removalStudentId]
  );

  const studentHasRecords = (studentId: string) =>
    gradeEntries.some(entry => entry.classId === classId && entry.studentId === studentId)
    || attendanceSessions.some(session =>
      session.classId === classId && session.records.some(record => record.studentId === studentId)
    );

  const handleAdd = () => {
    if (!selectedStudentId) return;
    if (isClassFull) {
      setMessage('Lớp đã đủ sĩ số, không thể thêm học viên.');
      return;
    }
    if (currentStudentIds.includes(selectedStudentId)) {
      setMessage('Học viên đã có trong lớp.');
      return;
    }

    addStudentToClass(classId, selectedStudentId);
    const student = users.find(u => u.id === selectedStudentId);
    appendActivity(
      `Thêm học viên vào lớp ${className}`,
      `${student?.name ?? selectedStudentId} đã được xếp vào lớp ${className}`,
      'mint'
    );
    setSelectedStudentId('');
    setMessage('');
  };

  const handleRemove = (studentId: string) => {
    if (studentHasRecords(studentId)) {
      setRemovalStudentId(studentId);
      setTransferTargetId('');
      setMessage('Học viên đã có điểm hoặc điểm danh. Không thể xóa khỏi lớp; hãy chuyển lớp hoặc chuyển sang Thôi học để giữ nguyên dữ liệu.');
      return;
    }

    removeStudentFromClass(classId, studentId);
    setRemovalStudentId('');
    setMessage('');
  };

  const handleWithdraw = (studentId: string) => {
    const student = users.find(u => u.id === studentId);
    updateUserStatus(studentId, 'Thôi học');
    removeStudentFromClass(classId, studentId);
    appendActivity(
      'Chuyển học viên sang Thôi học',
      `${student?.name ?? studentId} đã thôi học lớp ${className}; dữ liệu học tập được giữ nguyên.`,
      'slate'
    );
    setRemovalStudentId('');
    setTransferTargetId('');
    setMessage('Đã chuyển học viên sang Thôi học và giữ nguyên dữ liệu điểm, điểm danh.');
  };

  const handleTransfer = (studentId: string) => {
    const target = classes.find(cls => cls.id === transferTargetId);
    if (!target) {
      setMessage('Vui lòng chọn lớp chuyển đến.');
      return;
    }
    if (target.studentsCount >= target.maxStudents) {
      setMessage(`Lớp ${target.title} đã đủ sĩ số.`);
      return;
    }
    if ((classStudentMap[target.id] ?? []).includes(studentId)) {
      setMessage(`Học viên đã có trong lớp ${target.title}.`);
      return;
    }

    const student = users.find(u => u.id === studentId);
    removeStudentFromClass(classId, studentId);
    addStudentToClass(target.id, studentId);
    appendActivity(
      'Chuyển lớp học viên',
      `${student?.name ?? studentId} được chuyển từ ${className} sang ${target.title}; dữ liệu cũ được giữ nguyên.`,
      'mint'
    );
    setRemovalStudentId('');
    setTransferTargetId('');
    setMessage(`Đã chuyển học viên sang ${target.title}. Dữ liệu điểm và điểm danh lớp cũ được giữ nguyên.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[16px] bg-mint-500 text-white flex items-center justify-center shadow-lg shadow-mint-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Quản lý học viên</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{className}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors" aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em]">Thêm học viên vào lớp</label>
            <div className="flex gap-2">
              <select
                value={selectedStudentId}
                onChange={e => {
                  setSelectedStudentId(e.target.value);
                  setMessage('');
                }}
                disabled={isClassFull || availableStudents.length === 0}
                className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-colors disabled:opacity-50"
              >
                <option value="">{isClassFull ? '-- Lớp đã đủ sĩ số --' : '-- Chọn học viên --'}</option>
                {availableStudents.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!selectedStudentId || isClassFull}
                className="px-4 py-3 bg-mint-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-mint-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Thêm
              </button>
            </div>
            {isClassFull && (
              <p className="text-xs font-semibold text-rose-600">
                Lớp đã đủ sĩ số ({classInfo?.studentsCount}/{classInfo?.maxStudents}).
              </p>
            )}
          </div>

          {message && (
            <div role="status" className="flex gap-2 rounded-2xl bg-amber-50 border border-amber-100 p-3 text-xs font-semibold text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Danh sách hiện tại</label>
              <span className="text-[10px] font-black text-mint-600 bg-mint-50 px-2 py-0.5 rounded-full">{currentStudents.length} học viên</span>
            </div>

            {currentStudents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm font-medium">Chưa có học viên nào trong lớp</div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {currentStudents.map(student => {
                    const hasRecords = studentHasRecords(student.id);
                    const isRemovalSelected = removalStudentId === student.id;

                    return (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-100"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={`https://picsum.photos/seed/${student.id}/40/40`}
                              className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                              alt={student.name}
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{student.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{student.id}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(student.id)}
                            className="p-1.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                            aria-label={hasRecords ? `Chọn phương án cho ${student.name}` : `Xóa ${student.name} khỏi lớp`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {isRemovalSelected && hasRecords && (
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                            <p className="text-xs font-bold text-slate-700">
                              Không thể xóa vì học viên đã có dữ liệu học tập.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleWithdraw(student.id)}
                              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700"
                            >
                              <GraduationCap className="w-4 h-4" />
                              Chuyển sang Thôi học, giữ dữ liệu
                            </button>

                            <div className="flex gap-2">
                              <select
                                value={transferTargetId}
                                onChange={event => setTransferTargetId(event.target.value)}
                                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                              >
                                <option value="">-- Chọn lớp chuyển đến --</option>
                                {transferTargets.map(target => (
                                  <option key={target.id} value={target.id}>
                                    {target.title} ({target.studentsCount}/{target.maxStudents})
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleTransfer(student.id)}
                                disabled={!transferTargetId}
                                className="flex items-center gap-1 rounded-xl bg-mint-500 px-3 py-2 text-xs font-bold text-white hover:bg-mint-600 disabled:opacity-40"
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                                Chuyển lớp
                              </button>
                            </div>

                            {transferTargets.length === 0 && (
                              <p className="text-[11px] text-slate-500">Hiện không có lớp nào còn chỗ để chuyển.</p>
                            )}

                            <button
                              type="button"
                              onClick={() => setRemovalStudentId('')}
                              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                            >
                              Hủy
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-50 bg-slate-50/30">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
}
