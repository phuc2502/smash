import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Settings2, Users, Plus, Trash2, AlertTriangle, CheckCircle, Clock, CalendarDays, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext, type Class, type ScheduleSlot } from "../context/AppContext";
import ManageScheduleModal from "../components/modals/ManageScheduleModal";
import ScheduleMonthCalendar from "../components/schedule/ScheduleMonthCalendar";
import { parseScheduleWeekdays, parseScheduleTimeRange } from "../utils/scheduleCalendar";

export default function ClassSchedulePage() {
  const { classes, updateClass, classScheduleSlots, updateClassSchedule, currentAccount } = useAppContext();
  const isTeacher = currentAccount?.role === "Giáo viên";
  const myClasses = isTeacher
    ? classes.filter(cls => {
        if (cls.instructorId && currentAccount?.id) {
          return cls.instructorId === currentAccount.id;
        }
        return cls.instructor === currentAccount?.name;
      })
    : classes;
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // States for Dynamic Schedule Builder
  const [builderClassId, setBuilderClassId] = useState<string>("");
  const [effectiveDate, setEffectiveDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [builderSlots, setBuilderSlots] = useState<ScheduleSlot[]>([]);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);
  
  // Conflict warning overlay state
  const [pendingSaveSlots, setPendingSaveSlots] = useState<ScheduleSlot[] | null>(null);
  const [activeConflicts, setActiveConflicts] = useState<{ otherClassTitle: string; dayOfWeek: number; timeRange: string }[]>([]);

  // Filter State (Lọc lịch học Ngày/Tháng/Năm)
  const [filterDate, setFilterDate] = useState<string>("");

  const weekdayLabels: Record<number, string> = {
    1: "Thứ 2",
    2: "Thứ 3",
    3: "Thứ 4",
    4: "Thứ 5",
    5: "Thứ 6",
    6: "Thứ 7",
    7: "Chủ nhật",
  };

  // Pre-populate builder slots when class selection changes
  useEffect(() => {
    if (!builderClassId) {
      setBuilderSlots([]);
      return;
    }

    const cls = myClasses.find(c => c.id === builderClassId);
    if (!cls) return;

    const savedSlots = classScheduleSlots[builderClassId];
    if (savedSlots && savedSlots.length > 0) {
      setBuilderSlots(savedSlots);
    } else {
      // Parse from traditional class schedule string
      const cDays = parseScheduleWeekdays(cls.schedule);
      const cTime = parseScheduleTimeRange(cls.schedule);
      if (cDays.length > 0 && cTime) {
        setBuilderSlots(
          cDays.map(d => ({
            dayOfWeek: (d === 0 ? 7 : d) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
            startTime: cTime.start,
            endTime: cTime.end,
          }))
        );
      } else {
        setBuilderSlots([{ dayOfWeek: 1, startTime: "18:00", endTime: "20:00" }]);
      }
    }
    setNotification(null);
  }, [builderClassId, classScheduleSlots, classes]);

  const openSchedule = (cls: Class) => {
    setSelectedClass(cls);
    setIsScheduleModalOpen(true);
  };

  // Actions for builder slots
  const addSlotRow = () => {
    setBuilderSlots(prev => [...prev, { dayOfWeek: 1, startTime: "18:00", endTime: "20:00" }]);
  };

  const removeSlotRow = (index: number) => {
    setBuilderSlots(prev => prev.filter((_, i) => i !== index));
  };

  const updateSlotField = (index: number, field: keyof ScheduleSlot, value: any) => {
    setBuilderSlots(prev => prev.map((slot, i) => i === index ? { ...slot, [field]: value } : slot));
  };

  // Helper to format slots to readable string
  const formatSlotsToScheduleString = (slots: ScheduleSlot[]): string => {
    if (slots.length === 0) return "Chưa thiết lập lịch";
    
    // Group slots by time range
    const groups: Record<string, number[]> = {};
    slots.forEach(slot => {
      const timeKey = `${slot.startTime} - ${slot.endTime}`;
      if (!groups[timeKey]) groups[timeKey] = [];
      groups[timeKey].push(slot.dayOfWeek);
    });
    
    return Object.entries(groups).map(([timeLabel, days]) => {
      const sortedDays = [...days].sort((a, b) => a - b);
      const dayLabels = sortedDays.map(d => weekdayLabels[d]).join(", ");
      return `${dayLabels} (${timeLabel})`;
    }).join("; ");
  };

  // Conflict checking service
  const checkConflicts = (classId: string, proposedSlots: ScheduleSlot[]) => {
    const targetClass = myClasses.find(c => c.id === classId);
    if (!targetClass) return [];
    
    const conflicts: { otherClassTitle: string; dayOfWeek: number; timeRange: string }[] = [];
    
    // Get other active classes taught by the same teacher
    const otherClasses = myClasses.filter(
      c => c.id !== classId && 
      c.status !== "Đã kết thúc" && 
      c.status !== "Đã lưu trữ" &&
      (c.instructor === targetClass.instructor || 
       (c.instructorId && targetClass.instructorId && c.instructorId === targetClass.instructorId))
    );
    
    for (const c of otherClasses) {
      let cSlots: ScheduleSlot[] = [];
      const customSlots = classScheduleSlots[c.id];
      if (customSlots && customSlots.length > 0) {
        cSlots = customSlots;
      } else {
        const cDays = parseScheduleWeekdays(c.schedule);
        const cTime = parseScheduleTimeRange(c.schedule);
        if (cDays.length > 0 && cTime) {
          cSlots = cDays.map(d => ({
            dayOfWeek: (d === 0 ? 7 : d) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
            startTime: cTime.start,
            endTime: cTime.end,
          }));
        }
      }
      
      for (const proposed of proposedSlots) {
        for (const otherSlot of cSlots) {
          if (proposed.dayOfWeek === otherSlot.dayOfWeek) {
            // Check overlapping: startA < endB && startB < endA
            if (proposed.startTime < otherSlot.endTime && otherSlot.startTime < proposed.endTime) {
              conflicts.push({
                otherClassTitle: c.title,
                dayOfWeek: proposed.dayOfWeek,
                timeRange: `${otherSlot.startTime} - ${otherSlot.endTime}`,
              });
            }
          }
        }
      }
    }
    
    return conflicts;
  };

  // Save with conflict validation
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderClassId) return;

    if (builderSlots.length === 0) {
      setNotification({ type: "error", message: "Vui lòng thêm ít nhất một buổi học." });
      return;
    }

    // Check conflict
    const conflicts = checkConflicts(builderClassId, builderSlots);
    if (conflicts.length > 0) {
      setActiveConflicts(conflicts);
      setPendingSaveSlots(builderSlots);
      return;
    }

    // Save directly if no conflicts
    executeSaveSchedule(builderClassId, builderSlots);
  };

  const executeSaveSchedule = (classId: string, slots: ScheduleSlot[]) => {
    updateClassSchedule(classId, slots);
    
    // Auto sync formatted schedule text to class schedule property
    const formattedText = formatSlotsToScheduleString(slots);
    updateClass(classId, { schedule: formattedText });

    setNotification({
      type: "success",
      message: `Đã cập nhật lịch học thành công cho lớp. Lịch học mới: ${formattedText}`
    });
    setPendingSaveSlots(null);
    setActiveConflicts([]);
  };

  // Filter logic: Filter classes taught on a specific date
  const filteredClasses = myClasses.filter(cls => {
    // Hide archived
    if (cls.status === "Đã lưu trữ") return false;

    if (!filterDate) return true;

    // Determine weekday of filterDate
    const dateObj = new Date(filterDate);
    const day = dateObj.getDay(); // 0 is Sunday, 1 is Monday...
    const targetSlotDay = day === 0 ? 7 : day;

    // Check if class has slot on this day
    const customSlots = classScheduleSlots[cls.id];
    if (customSlots && customSlots.length > 0) {
      return customSlots.some(s => s.dayOfWeek === targetSlotDay);
    } else {
      const weekdays = parseScheduleWeekdays(cls.schedule);
      return weekdays.includes(day);
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-16"
    >
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Quản lý lịch học</h1>
          <p className="text-sm text-slate-500 font-semibold mt-0.5">Xây dựng thời khóa biểu thông minh và phát hiện trùng lịch giáo viên tự động.</p>
        </div>

        {/* Date Filter (Lọc lịch học Ngày/Tháng/Năm) */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-slate-100 p-2.5 rounded-2xl shadow-sm shrink-0">
          <CalendarDays className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Lọc ngày học</span>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none mt-1 border-none focus:ring-0 p-0"
            />
          </div>
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-500 font-bold rounded-lg transition-colors"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </header>

      {/* DYNAMIC SCHEDULE BUILDER */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white/90 backdrop-blur-xl rounded-[28px] border border-slate-100 shadow-xl shadow-slate-100/40 p-6 md:p-8 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-mint-500 flex items-center justify-center text-white shadow-md shadow-mint-100 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Thiết lập lịch học động</h2>
            <p className="text-xs text-slate-500 font-semibold">Tự động phát hiện trùng lặp lịch dạy của giáo viên trong toàn hệ thống.</p>
          </div>
        </div>

        <form onSubmit={handleSaveSchedule} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chọn lớp học cần cấu hình</label>
              <select
                value={builderClassId}
                onChange={e => setBuilderClassId(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
              >
                <option value="">-- Chọn lớp học --</option>
                {myClasses.filter(c => c.status !== "Đã lưu trữ").map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.title} ({cls.id}) - {cls.instructor}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày áp dụng hiệu lực</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={e => setEffectiveDate(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
              />
            </div>
          </div>

          {builderClassId ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1 border-b border-slate-50 pb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh sách buổi học trong tuần</span>
                <button
                  type="button"
                  onClick={addSlotRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-mint-50 text-mint-700 hover:bg-mint-100 text-xs font-bold rounded-xl transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm ngày học
                </button>
              </div>

              <div className="space-y-3">
                {builderSlots.map((slot, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl"
                  >
                    <div className="w-full sm:flex-[2] space-y-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block ml-1 sm:hidden">Thứ</span>
                      <select
                        value={slot.dayOfWeek}
                        onChange={e => updateSlotField(index, "dayOfWeek", parseInt(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-none"
                      >
                        <option value={1}>Thứ 2</option>
                        <option value={2}>Thứ 3</option>
                        <option value={3}>Thứ 4</option>
                        <option value={4}>Thứ 5</option>
                        <option value={5}>Thứ 6</option>
                        <option value={6}>Thứ 7</option>
                        <option value={7}>Chủ nhật</option>
                      </select>
                    </div>

                    <div className="w-full sm:flex-[2] space-y-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block ml-1 sm:hidden">Bắt đầu</span>
                      <div className="relative flex items-center">
                        <Clock className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={e => updateSlotField(index, "startTime", e.target.value)}
                          className="w-full pl-9 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-none"
                        />
                      </div>
                    </div>

                    <div className="w-full sm:flex-[2] space-y-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block ml-1 sm:hidden">Kết thúc</span>
                      <div className="relative flex items-center">
                        <Clock className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={e => updateSlotField(index, "endTime", e.target.value)}
                          className="w-full pl-9 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={builderSlots.length <= 1}
                      onClick={() => removeSlotRow(index)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Xóa buổi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                >
                  Áp dụng lịch học
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-semibold">
              Vui lòng chọn một lớp học để bắt đầu lập lịch học động.
            </div>
          )}
        </form>

        {/* Dynamic Builder Notifications */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-2xl flex items-start gap-3 ${
                notification.type === "success"
                  ? "bg-mint-50 border border-mint-100 text-mint-800"
                  : "bg-rose-50 border border-rose-100 text-rose-800"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-mint-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div className="text-xs font-semibold leading-relaxed">
                {notification.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* CONFLICT OVERLAY WARNING MODAL */}
      <AnimatePresence>
        {pendingSaveSlots && activeConflicts.length > 0 && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setPendingSaveSlots(null);
                setActiveConflicts([]);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[36px] shadow-2xl overflow-hidden border border-slate-100 p-8 space-y-6"
            >
              <div className="flex items-center gap-4 text-rose-500">
                <div className="w-12 h-12 rounded-[20px] bg-rose-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Cảnh Báo Trùng Lịch Giáo Viên!</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Phát hiện trùng thời gian đứng lớp của giáo viên phụ trách.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                <p className="text-xs text-slate-700 font-bold">
                  Hệ thống phát hiện lịch học đề xuất trùng với lịch giảng dạy khác của giáo viên:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeConflicts.map((c, i) => (
                    <div key={i} className="text-xs font-semibold text-rose-700 bg-rose-50/50 border border-rose-100 p-2.5 rounded-xl flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>
                        Trùng với lớp <strong className="text-rose-800">{c.otherClassTitle}</strong> vào <strong className="text-rose-800">{weekdayLabels[c.dayOfWeek]} ({c.timeRange})</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Bạn có chắc chắn muốn ghi đè lên các ca dạy này không? Giáo viên phụ trách sẽ được sắp xếp dạy đồng thời hai lớp tại thời điểm trùng lặp.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPendingSaveSlots(null);
                    setActiveConflicts([]);
                  }}
                  className="flex-1 py-3.5 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Hủy và sửa lịch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (builderClassId && pendingSaveSlots) {
                      executeSaveSchedule(builderClassId, pendingSaveSlots);
                    }
                  }}
                  className="flex-1 py-3.5 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all"
                >
                  Tiếp tục ghi đè
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ManageScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        targetClass={selectedClass}
        onUpdate={updateClass}
      />

      {/* ACTIVE SCHEDULES LIST */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Danh sách lịch dạy của các lớp</h2>
            {filterDate && (
              <p className="text-xs text-mint-600 mt-0.5 font-bold">
                Đang lọc các lớp hoạt động vào ngày: {new Date(filterDate).toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/95 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="py-4 px-5">Lớp học</th>
                <th className="py-4 px-3">Giáo viên</th>
                <th className="py-4 px-3">Lịch học chi tiết</th>
                <th className="py-4 px-3">Phòng</th>
                <th className="py-4 px-3">Sĩ số</th>
                <th className="py-4 px-5 text-right">Cấu hình</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                    Không tìm thấy lớp học nào khớp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-mint-50/10 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900">{cls.title}</p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{cls.id}</p>
                    </td>
                    <td className="py-4 px-3 font-medium text-slate-700">{cls.instructor}</td>
                    <td className="py-4 px-3">
                      <div className="flex items-start gap-2 text-slate-700 max-w-xs">
                        <Calendar className="w-4 h-4 text-mint-600 shrink-0 mt-0.5" />
                        <span className="font-semibold text-xs leading-relaxed">{cls.schedule}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      {cls.location ? (
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          {cls.location}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {cls.studentsCount}/{cls.maxStudents}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setBuilderClassId(cls.id);
                            // Scroll builder into view smoothly
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wide text-slate-600 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Lập lịch động
                        </button>
                        <button
                          type="button"
                          onClick={() => openSchedule(cls)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-mint-500 text-white text-xs font-black uppercase tracking-wide hover:bg-mint-600 transition-colors shadow-sm shadow-mint-200/60"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                          Cấu hình phòng
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MONTHLY CALENDAR VIEW */}
      <ScheduleMonthCalendar classes={myClasses} onSelectClass={openSchedule} />
    </motion.div>
  );
}
