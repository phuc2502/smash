import { useState, useMemo } from 'react';
import { X, UserPlus, Trash2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../../context/AppContext';

interface ManageStudentsModalProps {
  classId: string;
  className: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageStudentsModal({ classId, className, isOpen, onClose }: ManageStudentsModalProps) {
  const { users, classStudentMap, addStudentToClass, removeStudentFromClass, appendActivity } = useAppContext();
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const currentStudentIds = classStudentMap[classId] ?? [];

  // Students currently in class (resolve names)
  const currentStudents = useMemo(
    () => currentStudentIds.map(id => users.find(u => u.id === id)).filter(Boolean) as typeof users,
    [currentStudentIds, users]
  );

  // Students NOT in class (available to add), role = Học viên
  const availableStudents = useMemo(
    () => users.filter(u => u.role === 'Học viên' && !currentStudentIds.includes(u.id)),
    [users, currentStudentIds]
  );

  const handleAdd = () => {
    if (!selectedStudentId) return;
    addStudentToClass(classId, selectedStudentId);
    const student = users.find(u => u.id === selectedStudentId);
    appendActivity(
      `Thêm học viên vào lớp ${className}`,
      `${student?.name ?? selectedStudentId} đã được xếp vào lớp ${className}`,
      'mint'
    );
    setSelectedStudentId('');
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
        {/* Header */}
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
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Add student */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em]">Thêm học viên vào lớp</label>
            <div className="flex gap-2">
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
              >
                <option value="">-- Chọn học viên --</option>
                {availableStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!selectedStudentId}
                className="px-4 py-3 bg-mint-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-mint-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-mint-100"
              >
                <UserPlus className="w-4 h-4" />
                Thêm
              </button>
            </div>
          </div>

          {/* Current students list */}
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
                  {currentStudents.map(student => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://picsum.photos/seed/${student.id}/40/40`}
                          className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                          alt={student.name}
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-800">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{student.id}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStudentFromClass(classId, student.id)}
                        className="p-1.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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
