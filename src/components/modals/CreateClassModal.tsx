import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, School, User, Calendar, Users, Palette, CheckCircle2 } from "lucide-react";
import { Class } from "../../context/AppContext";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cls: Class) => void;
}

export default function CreateClassModal({ isOpen, onClose, onSubmit }: CreateClassModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    instructor: "",
    role: "Giáo viên",
    schedule: "",
    maxStudents: 20,
    status: "Sắp bắt đầu" as Class['status'],
    color: "mint"
  });

  const colors = [
    { name: 'Sky', value: 'mint', bgClass: 'bg-mint-500' },
    { name: 'Indigo', value: 'mint', bgClass: 'bg-mint-500' },
    { name: 'Emerald', value: 'mint', bgClass: 'bg-mint-500' },
    { name: 'Amber', value: 'mint', bgClass: 'bg-mint-500' },
    { name: 'Rose', value: 'rose', bgClass: 'bg-rose-500' },
    { name: 'Slate', value: 'slate', bgClass: 'bg-slate-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `MATH-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;
    onSubmit({
      ...formData,
      id,
      studentsCount: 0,
    });
    onClose();
    // Reset form
    setFormData({
      title: "",
      instructor: "",
      role: "Giáo viên",
      schedule: "",
      maxStudents: 20,
      status: "Sắp bắt đầu",
      color: "mint"
    });
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
          ></motion.div>

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
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Mở Lớp Học Mới</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Xây dựng tương lai tri thức</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <School className="w-3 h-3" />
                    Tên lớp học
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="VD: Toán 6 - Nâng cao"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                  />
                </div>

                {/* Instructor & Role */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <User className="w-3 h-3" />
                      Giáo viên
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="VD: Thầy Nguyễn Văn A"
                      value={formData.instructor}
                      onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Palette className="w-3 h-3" />
                      Chức danh
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Giảng viên chính"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Schedule & Max Students */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Lịch học
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="VD: Thứ 2, 4 (18h-20h)"
                      value={formData.schedule}
                      onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      Sĩ số tối đa
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={formData.maxStudents}
                      onChange={e => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Màu sắc định danh</label>
                  <div className="flex gap-3">
                    {colors.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`w-10 h-10 rounded-xl transition-all relative ${formData.color === color.value ? 'ring-4 ring-mint-500/20 scale-110 shadow-lg' : 'hover:scale-105'
                          } ${color.bgClass}`}
                      >
                        {formData.color === color.value && <CheckCircle2 className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-5 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-mint-100 hover:shadow-2xl hover:shadow-mint-200 transition-all flex items-center justify-center gap-3"
                >
                  <School className="w-5 h-5 text-mint-200" />
                  Kích hoạt Mở Lớp Học
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}