import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, MapPin, Clock, Save, School } from "lucide-react";
import { Class } from "../../context/AppContext";

interface ManageScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetClass: Class | null;
  onUpdate: (id: string, updates: Partial<Class>) => void;
}

export default function ManageScheduleModal({ isOpen, onClose, targetClass, onUpdate }: ManageScheduleModalProps) {
  const [formData, setFormData] = useState({
    location: ""
  });
  const [presetDays, setPresetDays] = useState("Thứ 2, 4");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("20:00");

  const dayOptions = [
    "Thứ 2, 4",
    "Thứ 3, 5",
    "Thứ 4, 6",
    "Thứ 7, CN",
    "Thứ 2, 4, 6",
    "Thứ 3, 5, 7",
  ];

  useEffect(() => {
    if (targetClass) {
      setFormData({
        location: targetClass.location || ""
      });
      setPresetDays("Thứ 2, 4");
      setStartTime("18:00");
      setEndTime("20:00");
    }
  }, [targetClass]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetClass) {
      const normalizedSchedule = `${presetDays} (${startTime} - ${endTime})`;

      onUpdate(targetClass.id, {
        ...formData,
        schedule: normalizedSchedule,
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && targetClass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          ></motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
          >
            {/* Header */}
            <div className={`p-8 border-b border-slate-50 flex justify-between items-center bg-mint-50/30`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-[20px] bg-mint-500 text-white flex items-center justify-center shadow-lg shadow-mint-100`}>
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Quản lý Lịch học</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{targetClass.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-mint-500" />
                    Thời gian & Ngày học
                  </label>
                  <div className="space-y-3">
                    <select
                      value={presetDays}
                      onChange={e => setPresetDays(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                    >
                      {dayOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        required
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                      />
                      <input
                        required
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    Địa điểm / Phòng học
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="VD: Phòng A101"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className={`flex-[2] py-4 bg-mint-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-mint-100 hover:bg-mint-700 transition-all flex items-center justify-center gap-2`}
                >
                  <Save className="w-4 h-4" />
                  Cập nhật lịch
                </button>
              </div>
            </form>

            <div className="p-6 bg-slate-50/50 border-t border-slate-50">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-mint-500">
                  <School className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Hệ thống sẽ tự động cập nhật lịch trình này đến tài khoản của tất cả học sinh và giáo viên trong lớp.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
