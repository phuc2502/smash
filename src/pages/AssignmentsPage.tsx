import React, { useState } from "react";
import {
  Plus,
  Grid2X2,
  LayoutList,
  LibraryBig,
  LockOpen,
  FileEdit,
  Clock,
  MoreVertical,
  History,
  CheckCircle2,
  Zap,
  X,
  BookOpen,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";

export default function AssignmentsPage() {
  const { assignments, addAssignment } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    classId: "Toán 6",
    type: "Trắc nghiệm" as "Trắc nghiệm" | "Tự luận",
    deadline: "",
    total: "30",
    isUrgent: false
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `ASG-${Math.floor(Math.random() * 1000)}`;
    addAssignment({
      id,
      title: formData.title || "Bài tập mới",
      type: formData.type,
      typeColor: formData.type === "Trắc nghiệm" ? "mint" : "mint",
      status: "Đang mở",
      classId: formData.classId,
      className: formData.classId,
      progress: 0,
      total: parseInt(formData.total) || 30,
      deadline: formData.deadline || "23:59, Hôm nay",
      isUrgent: formData.isUrgent
    });
    setIsModalOpen(false);
    setFormData({ title: "", classId: "Toán 6", type: "Trắc nghiệm", deadline: "", total: "30", isUrgent: false });
  };

  const stats = [
    { label: "Tổng số bài tập", value: assignments.length.toString(), icon: LibraryBig, color: "mint" as const, trend: "+12% so với tháng trước" },
    { label: "Bài tập đang mở", value: assignments.filter(a => a.status === 'Đang mở').length.toString(), icon: LockOpen, color: "mint" as const, sub: "Tiến độ đạt 65%", progress: true },
    { label: "Cần chấm điểm", value: assignments.filter(a => a.status === 'Chờ chấm điểm').length.toString(), icon: FileEdit, color: "mint" as const, sub: "Ưu tiên cao", alert: true }
  ];

  const colorMap = {
    mint: { bgLight: 'bg-mint-50', text: 'text-mint-500' },
    rose: { bgLight: 'bg-rose-50', text: 'text-rose-500' },
    slate: { bgLight: 'bg-slate-50', text: 'text-slate-500' },
  } as const;

  return (
    <div className="space-y-10 pb-20">
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[20px] bg-mint-500 text-white flex items-center justify-center shadow-lg shadow-mint-100">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Tạo Bài tập Mới</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Hệ thống quản lý SMASH Math</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">Tiêu đề bài tập</label>
                  <input
                    required
                    type="text"
                    placeholder="VD: Ôn tập Chương 1 - Số học 6"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 focus:bg-white transition-all outline-none"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">Lớp học</label>
                    <select
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 focus:bg-white transition-all outline-none"
                      value={formData.classId}
                      onChange={e => setFormData({ ...formData, classId: e.target.value })}
                    >
                      <option>Toán 6</option>
                      <option>Toán 7</option>
                      <option>Toán 8</option>
                      <option>Toán 9</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">Hình thức</label>
                    <select
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 focus:bg-white transition-all outline-none"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option>Trắc nghiệm</option>
                      <option>Tự luận</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">Hạn nộp bài</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="text"
                        placeholder="23:59, 25/12"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 focus:bg-white transition-all outline-none"
                        value={formData.deadline}
                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">Tổng số câu hỏi</label>
                    <input
                      type="number"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 focus:bg-white transition-all outline-none"
                      value={formData.total}
                      onChange={e => setFormData({ ...formData, total: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.isUrgent}
                        onChange={e => setFormData({ ...formData, isUrgent: e.target.checked })}
                      />
                      <div className={`w-12 h-6 rounded-full transition-colors ${formData.isUrgent ? 'bg-mint-500' : 'bg-slate-200'}`}></div>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isUrgent ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-mint-600 transition-colors">Đánh dấu khẩn cấp</span>
                  </label>
                  {formData.isUrgent && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-[10px] font-black text-mint-600 bg-mint-50 px-2 py-0.5 rounded-full border border-mint-100">
                      <AlertTriangle className="w-3 h-3" />
                      QUAN TRỌNG
                    </motion.div>
                  )}
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-mint-100 hover:shadow-2xl hover:shadow-mint-200 hover:-translate-y-0.5 transition-all"
                  >
                    Phát hành Bài tập
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filters & Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/80 backdrop-blur-xl p-5 rounded-[24px] border border-slate-100 shadow-sm shadow-slate-200/50">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <select className="appearance-none bg-slate-50 text-slate-800 text-sm font-black py-3 pl-5 pr-12 rounded-2xl border-none focus:ring-2 focus:ring-mint-500/10 cursor-pointer italic">
              <option>Tất cả lớp Toán</option>
              <option>Toán 6</option>
              <option>Toán 7</option>
              <option>Toán 8</option>
              <option>Toán 9</option>
            </select>
            <Zap className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-mint-500 transition-colors" />
          </div>
          <div className="relative group">
            <select className="appearance-none bg-slate-50 text-slate-800 text-sm font-black py-3 pl-5 pr-12 rounded-2xl border-none focus:ring-2 focus:ring-mint-500/10 cursor-pointer italic">
              <option>Tất cả trạng thái</option>
              <option>Đang mở</option>
              <option>Chờ chấm</option>
            </select>
            <History className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-mint-500 transition-colors" />
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-full py-3.5 px-8 font-black text-sm shadow-xl shadow-mint-100 flex items-center justify-center gap-3 transition-all"
        >
          <Plus className="w-5 h-5" />
          Tạo bài tập mới
        </motion.button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/80 backdrop-blur-xl p-7 rounded-[32px] border border-slate-100 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className={`text-4xl font-black ${stat.alert ? 'text-mint-500' : 'text-slate-900'} leading-none`}>{stat.value}</h3>
              </div>
              <div className={`w-11 h-11 rounded-2xl ${colorMap[stat.color].bgLight} ${colorMap[stat.color].text} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            {stat.progress ? (
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-mint-500 h-full rounded-full" style={{ width: '65%' }}></div>
              </div>
            ) : (
              <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${stat.alert ? 'bg-mint-500 animate-pulse' : 'bg-mint-500'}`}></span>
                <span className={stat.alert ? 'text-mint-600' : 'text-mint-600'}>{stat.trend || stat.sub}</span>
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Assignment Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Danh sách Bài tập</h2>
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
            <button className="w-8 h-8 rounded-lg bg-white text-mint-600 shadow-sm flex items-center justify-center transition-all">
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all">
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {assignments.map((asgn, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-[32px] p-7 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col group min-h-[360px]"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:bg-mint-50 group-hover:text-mint-600 transition-colors`}>
                  {asgn.type === "Trắc nghiệm" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                  {asgn.type}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm transition-all duration-300
                  ${asgn.status === 'Đang mở'
                    ? 'bg-mint-50 text-mint-600 border-mint-200/50'
                    : asgn.status === 'Chờ chấm điểm'
                      ? 'bg-mint-50 text-mint-600 border-mint-200/50'
                      : 'bg-slate-50 text-slate-500 border-slate-200/50'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${asgn.status === 'Đang mở' ? 'bg-mint-500 animate-pulse' : 'bg-mint-500'}`}></span>
                  {asgn.status}
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-mint-600 transition-colors line-clamp-2">
                {asgn.title}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Lớp: {asgn.className}</p>

              <div className="bg-slate-50/50 rounded-[20px] p-5 mb-6 mt-auto border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến độ nộp bài</span>
                  <span className="text-sm font-black text-slate-900">{asgn.progress}/{asgn.total}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(asgn.progress / asgn.total) * 100}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className={`h-full rounded-full ${asgn.isUrgent ? 'bg-mint-500' : 'bg-mint-500'}`}
                  ></motion.div>
                </div>
              </div>

              <div className={`flex items-center gap-3 text-xs font-black uppercase tracking-widest mb-8 ${asgn.isUrgent ? 'text-mint-600' : 'text-slate-400'}`}>
                <Clock className="w-4 h-4" />
                {asgn.deadline}
              </div>

              <div className="flex gap-2 pt-6 border-t border-slate-100">
                <button
                  className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${asgn.status === 'Chờ chấm điểm'
                      ? 'bg-gradient-to-r from-mint-600 to-mint-400 text-white shadow-lg shadow-mint-100 hover:brightness-110'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  {asgn.status === 'Chờ chấm điểm' ? 'Chấm điểm ngay' : 'Xem kết quả'}
                </button>
                <button className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-300 hover:text-slate-900 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
