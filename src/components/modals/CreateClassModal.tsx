import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, School, User, Calendar, Users, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Class, useAppContext } from "../../context/AppContext";

const WEEKDAY_OPTIONS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"] as const;

type ScheduleSlot = { id: string; weekday: string; start: string; end: string };

function newSlotId() {
  return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatScheduleFromSlots(slots: ScheduleSlot[]) {
  return slots
    .filter(s => s.weekday.trim() && s.start && s.end)
    .map(s => `${s.weekday} (${s.start}–${s.end})`)
    .join(" · ");
}

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cls: Class) => void;
  classToEdit?: Class | null;
}

const GRADE_OPTIONS = [
  { label: 'Lớp 6', prefix: 'Toán 6' },
  { label: 'Lớp 7', prefix: 'Toán 7' },
  { label: 'Lớp 8', prefix: 'Toán 8' },
  { label: 'Lớp 9', prefix: 'Toán 9' },
];

const LEVEL_OPTIONS = ['Cơ bản', 'Nâng cao', 'Luyện thi', 'Chuyên đề'];

export default function CreateClassModal({ isOpen, onClose, onSubmit, classToEdit }: CreateClassModalProps) {
  const { users } = useAppContext();

  // Lấy danh sách giáo viên từ users
  const teachers = users.filter(u => u.role === 'Giáo viên');

  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    grade: "",
    level: "",
    instructorId: "",
    role: "Giáo viên",
    maxStudents: 20,
    status: "Sắp bắt đầu" as Class['status'],
    color: "mint",
    location: "",
  });

  useEffect(() => {
    if (classToEdit) {
      const inst = users.find(u => u.name === classToEdit.instructor);
      const slots: ScheduleSlot[] = [];
      const parts = classToEdit.schedule.split(" · ");
      parts.forEach(p => {
        const match = p.match(/(Thứ \d|Chủ nhật)\s*\((.*?)\s*[-–\s]+\s*(.*?)\)/);
        if (match) {
          slots.push({
            id: newSlotId(),
            weekday: match[1],
            start: match[2].trim(),
            end: match[3].trim()
          });
        }
      });

      if (slots.length === 0) {
        slots.push({ id: newSlotId(), weekday: "", start: "", end: "" });
      }

      setScheduleSlots(slots);
      setFormData({
        title: classToEdit.title,
        grade: "",
        level: "",
        instructorId: classToEdit.instructorId || inst?.id || "",
        role: classToEdit.role || "Giáo viên",
        maxStudents: classToEdit.maxStudents,
        status: classToEdit.status,
        color: classToEdit.color,
        location: classToEdit.location || "",
      });
    } else {
      setScheduleSlots([{ id: newSlotId(), weekday: "", start: "", end: "" }]);
      setFormData({
        title: "", grade: "", level: "",
        instructorId: "", role: "Giáo viên",
        maxStudents: 20, status: "Sắp bắt đầu",
        color: "mint", location: "",
      });
    }
  }, [isOpen, classToEdit, users]);

  const colors = [
    { value: 'mint', bgClass: 'bg-mint-500' },
    { value: 'rose', bgClass: 'bg-rose-500' },
    { value: 'slate', bgClass: 'bg-slate-500' },
  ];

  const selectedTeacher = teachers.find(t => t.id === formData.instructorId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const schedule = formatScheduleFromSlots(scheduleSlots);
    if (!schedule) return;
    if (!formData.instructorId) return;

    const titleFinal = formData.title.trim() ||
      `${formData.grade} - ${formData.level}`.trim() ||
      'Lớp học mới';

    const id = classToEdit ? classToEdit.id : `MATH-${Date.now().toString().slice(-5)}`;
    onSubmit({
      id,
      title: titleFinal,
      instructor: selectedTeacher?.name ?? formData.instructorId,
      instructorId: formData.instructorId,
      role: formData.role,
      schedule,
      location: formData.location || undefined,
      studentsCount: classToEdit ? classToEdit.studentsCount : 0,
      maxStudents: formData.maxStudents,
      status: formData.status,
      color: formData.color,
    });
    onClose();
  };

  const addScheduleSlot = () => {
    setScheduleSlots(prev => [...prev, { id: newSlotId(), weekday: "", start: "", end: "" }]);
  };

  const removeScheduleSlot = (slotId: string) => {
    setScheduleSlots(prev => (prev.length <= 1 ? prev : prev.filter(s => s.id !== slotId)));
  };

  const updateScheduleSlot = (slotId: string, patch: Partial<Omit<ScheduleSlot, "id">>) => {
    setScheduleSlots(prev => prev.map(s => (s.id === slotId ? { ...s, ...patch } : s)));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[20px] bg-mint-500 text-white flex items-center justify-center shadow-lg shadow-mint-100">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {classToEdit ? "Chỉnh Sửa Lớp Học" : "Mở Lớp Học Mới"}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Phân công giáo viên tự động</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[70vh]">

              {/* Tên lớp tự động hoặc tùy chỉnh */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Khối lớp</label>
                  <select
                    value={formData.grade}
                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 transition-all"
                  >
                    <option value="">Chọn khối</option>
                    {GRADE_OPTIONS.map(g => <option key={g.label} value={g.prefix}>{g.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cấp độ</label>
                  <select
                    value={formData.level}
                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 transition-all"
                  >
                    <option value="">Chọn cấp độ</option>
                    {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên lớp (tùy chỉnh, để trống sẽ tự tạo)</label>
                <input
                  type="text"
                  placeholder={formData.grade && formData.level ? `${formData.grade} - ${formData.level}` : "VD: Toán 6 - Nâng cao"}
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 transition-all"
                />
              </div>

              {/* Giáo viên — dropdown từ danh sách thực */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <User className="w-3 h-3" />
                  Phân công Giáo viên
                </label>
                {teachers.length === 0 ? (
                  <p className="text-sm text-slate-400 italic px-1">Chưa có giáo viên nào trong hệ thống.</p>
                ) : (
                  <select
                    required
                    value={formData.instructorId}
                    onChange={e => setFormData({ ...formData, instructorId: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 transition-all"
                  >
                    <option value="">-- Chọn giáo viên --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                    ))}
                  </select>
                )}
                {selectedTeacher && (
                  <p className="text-xs text-mint-600 font-semibold px-1">
                    ✓ Lớp sẽ tự động hiển thị trong dashboard của {selectedTeacher.name}
                  </p>
                )}
              </div>

              {/* Phòng học */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phòng học (tùy chọn)</label>
                <input
                  type="text"
                  placeholder="VD: Phòng A101"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 transition-all"
                />
              </div>

              {/* Lịch học */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Lịch học
                  </label>
                  <button
                    type="button"
                    onClick={addScheduleSlot}
                    className="text-[10px] font-black uppercase tracking-widest text-mint-600 hover:text-mint-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-mint-50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm buổi
                  </button>
                </div>
                <div className="space-y-3">
                  {scheduleSlots.map((slot) => (
                    <div key={slot.id} className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/80">
                      <div className="flex-1 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thứ</span>
                        <select
                          required
                          value={slot.weekday}
                          onChange={e => updateScheduleSlot(slot.id, { weekday: e.target.value })}
                          className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 transition-all"
                        >
                          <option value="">Chọn thứ</option>
                          {WEEKDAY_OPTIONS.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2 flex-1">
                        <div className="flex-1 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bắt đầu</span>
                          <input required type="time" value={slot.start}
                            onChange={e => updateScheduleSlot(slot.id, { start: e.target.value })}
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 px-3 text-sm font-bold outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 transition-all"
                          />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kết thúc</span>
                          <input required type="time" value={slot.end}
                            onChange={e => updateScheduleSlot(slot.id, { end: e.target.value })}
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 px-3 text-sm font-bold outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 transition-all"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeScheduleSlot(slot.id)}
                        disabled={scheduleSlots.length <= 1}
                        className="shrink-0 p-3 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sĩ số + Màu */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Sĩ số tối đa
                  </label>
                  <input
                    required type="number" min="1"
                    value={formData.maxStudents}
                    onChange={e => setFormData({ ...formData, maxStudents: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Màu sắc</label>
                  <div className="flex gap-3 pt-1">
                    {colors.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`w-10 h-10 rounded-xl transition-all relative ${formData.color === color.value ? 'ring-4 ring-offset-2 ring-mint-400 scale-110' : 'hover:scale-105'} ${color.bgClass}`}
                      >
                        {formData.color === color.value && <CheckCircle2 className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-mint-100 hover:shadow-2xl hover:shadow-mint-200 transition-all flex items-center justify-center gap-3"
                >
                  <School className="w-5 h-5 text-mint-200" />
                  {classToEdit ? "Lưu thay đổi" : "Kích hoạt Mở Lớp Học"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
