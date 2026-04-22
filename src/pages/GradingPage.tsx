import React, { useState } from "react";
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  TrendingUp,
  Filter,
  Search,
  Download,
  Plus,
  Edit3,
  Eye,
  User,
  Calendar,
  MoreVertical,
  Zap,
  Star,
  ChevronDown,
  BookOpen,
  PieChart,
  Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";

export default function GradingPage() {
  const { stats: globalStats } = useAppContext();
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const stats = [
    { label: "Điểm trung bình hệ thống", value: "8.4", detail: "Tăng 0.2% so với kỳ trước", color: "mint" as const, icon: GraduationCap },
    { label: "Đã hoàn thành chấm điểm", value: "92%", color: "mint" as const, icon: CheckCircle2 },
    { label: "Bài tập Chờ chấm", value: globalStats.pendingGrading.toString(), color: "rose" as const, icon: Clock },
    { label: "Học sinh xuất sắc", value: "128", color: "mint" as const, icon: Star },
  ];

  const colorMap = {
    mint: { bg20: 'bg-mint-500/20', bgLight: 'bg-mint-50', text: 'text-mint-500' },
    rose: { bg20: 'bg-rose-500/20', bgLight: 'bg-rose-50', text: 'text-rose-500' },
    slate: { bg20: 'bg-slate-500/20', bgLight: 'bg-slate-50', text: 'text-slate-500' },
  } as const;

  const students = [
    {
      id: "S-1002",
      name: "Trần Thế Vinh",
      middle: "8.5",
      final: "9.0",
      gpa: "8.75",
      status: "Hoàn thành",
      color: "mint",
      details: [
        { name: "Đại số 9 - Chương 1", score: 9.0, type: "Kiểm tra miệng" },
        { name: "Hình học 9 - Đường tròn", score: 8.5, type: "15 Phút" },
        { name: "Bài tập về nhà tuần 4", score: 10, type: "BTVN" },
      ]
    },
    {
      id: "S-1024",
      name: "Nguyễn Lê Bảo An",
      middle: "9.0",
      final: "N/A",
      gpa: "9.0",
      status: "Chờ thi cuối kỳ",
      color: "mint",
      details: [
        { name: "Giải toán bằng cách lập PT", score: 9.5, type: "1 Tiết" },
        { name: "Lý thuyết Hình học", score: 8.5, type: "15 Phút" },
        { name: "Sổ bài tập tháng 10", score: 9.0, type: "BTVN" },
      ]
    },
    {
      id: "S-1056",
      name: "Lê Minh Tuấn",
      middle: "7.0",
      final: "6.5",
      gpa: "6.75",
      status: "Hoàn thành",
      color: "mint",
      details: [
        { name: "Các hệ thức trong TG vuông", score: 6.5, type: "1 Tiết" },
        { name: "Căn bậc hai", score: 7.5, type: "1 Tiết" },
        { name: "Trắc nghiệm tổng hợp", score: 6.8, type: "15 Phút" },
      ]
    },
    {
      id: "S-1078",
      name: "Phạm Hồng Nhung",
      middle: "4.5",
      final: "N/A",
      gpa: "4.5",
      status: "Cảnh báo học tập",
      color: "rose",
      details: [
        { name: "Rút gọn biểu thức", score: 4.0, type: "1 Tiết" },
        { name: "Hằng đẳng thức đáng nhớ", score: 5.0, type: "15 Phút" },
        { name: "Vẽ đồ thị hàm số", score: 4.5, type: "1 Tiết" },
      ]
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedStudentId(expandedStudentId === id ? null : id);
  };

  return (
    <div className="space-y-10 pb-10 pt-4">
      {/* ... previous header and stats ... */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-slate-900 tracking-tight"
          >
            Quản lý Điểm số
          </motion.h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">
            Theo dõi tiến trình học tập, quản lý điểm thành phần và tổng kết kỳ học cho học sinh.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white text-slate-600 rounded-full font-bold text-sm hover:bg-slate-50 transition-all shadow-sm border border-slate-200">
            <Download className="w-5 h-5" />
            Báo cáo kỳ học
          </button>
          <button className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-full font-bold text-sm shadow-xl shadow-mint-100 hover:shadow-2xl hover:shadow-mint-200 transition-all duration-300 transform hover:-translate-y-0.5">
            <Zap className="w-5 h-5" />
            Nhập nhanh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/80 backdrop-blur-xl p-7 rounded-[32px] border border-slate-100 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden relative"
          >
            <div className={`absolute top-0 left-0 w-2 h-full ${colorMap[stat.color].bg20}`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-11 h-11 rounded-[14px] ${colorMap[stat.color].bgLight} ${colorMap[stat.color].text} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-3xl font-black text-slate-900 leading-none mb-2">{stat.value}</p>
            {stat.detail && <p className="text-[10px] font-bold text-mint-600 uppercase tracking-widest leading-relaxed">{stat.detail}</p>}
          </motion.div>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            <h3 className="text-xl font-black text-slate-900 tracking-tight whitespace-nowrap">Danh sách Bảng điểm</h3>
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-mint-600 transition-colors z-10" />
              <input
                type="text"
                placeholder="Tìm tên hoặc ID học sinh..."
                className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
              <Calendar className="w-4 h-4" />
              Học kỳ 1 • 2024
            </button>
            <button className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:bg-white hover:text-mint-600 hover:shadow-xl transition-all border border-transparent hover:border-mint-100">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100 italic">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Học sinh</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Giữa kỳ</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cuối kỳ</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">GPA Hiện tại</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((student, i) => (
                <React.Fragment key={student.id}>
                  <motion.tr
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className={`group transition-all duration-300 ${expandedStudentId === student.id ? 'bg-mint-50/30' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-mint-50 text-mint-600 flex items-center justify-center font-black text-xs shadow-sm shadow-mint-100">
                          {student.id.split('-')[1].charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 group-hover:text-mint-600 transition-colors uppercase tracking-tight">{student.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-0.5">ID: {student.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-900 italic text-lg">{student.middle}</td>
                    <td className="px-8 py-6 font-black text-slate-900 italic text-lg">{student.final}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <p className="text-2xl font-black text-mint-600 leading-none">{student.gpa}</p>
                        {parseFloat(student.gpa) >= 8.5 && <TrendingUp className="w-4 h-4 text-mint-500" />}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${student.color === 'rose' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-mint-50 text-mint-600 border border-mint-100'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => toggleExpand(student.id)}
                          className={`p-2.5 rounded-xl transition-all ${expandedStudentId === student.id ? 'bg-mint-600 text-white shadow-lg shadow-mint-200' : 'text-slate-400 bg-white border border-slate-100 hover:text-mint-600 hover:shadow-lg hover:shadow-slate-100'}`}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-2.5 rounded-xl text-slate-400 bg-white border border-slate-100 hover:text-mint-600 hover:shadow-lg hover:shadow-mint-100 transition-all">
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button className="p-2.5 rounded-xl text-slate-400 bg-white border border-slate-100 hover:text-slate-900 hover:shadow-lg hover:shadow-slate-100 transition-all">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>

                  {/* Expanded Detail Row */}
                  <AnimatePresence>
                    {expandedStudentId === student.id && (
                      <tr className="bg-mint-50/20 border-l-4 border-l-mint-500">
                        <td colSpan={6} className="px-8 py-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                              {/* Detail Card 1: Score Breakdown */}
                              <div className="bg-white p-6 rounded-3xl border border-mint-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2 rounded-xl bg-mint-50 text-mint-600">
                                    <BookOpen className="w-5 h-5" />
                                  </div>
                                  <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">Điểm thành phần</h4>
                                </div>
                                <div className="space-y-4">
                                  {student.details.map((detail, idx) => (
                                    <div key={idx} className="flex justify-between items-center group/item">
                                      <div>
                                        <p className="text-xs font-bold text-slate-900 group-hover/item:text-mint-600 transition-colors">{detail.name}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{detail.type}</p>
                                      </div>
                                      <span className="text-lg font-black text-slate-900 italic">{detail.score}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Detail Card 2: Visual Chart (Simplified) */}
                              <div className="bg-white p-6 rounded-3xl border border-mint-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2 rounded-xl bg-mint-50 text-mint-600">
                                    <PieChart className="w-5 h-5" />
                                  </div>
                                  <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">Phân tích học tập</h4>
                                </div>
                                <div className="space-y-6">
                                  <div className="flex items-center gap-4">
                                    <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "85%" }}
                                        className="h-full bg-mint-500 rounded-full"
                                      />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Đại số 85%</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "95%" }}
                                        className="h-full bg-mint-500 rounded-full"
                                      />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hình học 95%</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "70%" }}
                                        className="h-full bg-mint-500 rounded-full"
                                      />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Luyện đề 70%</span>
                                  </div>
                                </div>
                              </div>

                              {/* Detail Card 3: Ranking/Trophy */}
                              <div className="bg-gradient-to-br from-mint-600 to-mint-500 p-6 rounded-3xl text-white shadow-xl shadow-mint-100">
                                <div className="flex items-start justify-between mb-8">
                                  <div>
                                    <h4 className="text-xs font-black text-mint-100 uppercase tracking-widest mb-1">Xếp hạng lớp</h4>
                                    <p className="text-3xl font-black italic">TOP 3</p>
                                  </div>
                                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                    <Trophy className="w-8 h-8 text-mint-300" />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-mint-100 leading-relaxed italic">
                                    "Học sinh có tiến bộ vượt bậc ở mảng Hình học không gian. Cần đẩy mạnh ôn luyện các dạng toán thực tế."
                                  </p>
                                  <div className="pt-4">
                                    <button className="w-full py-2 bg-white text-mint-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-mint-50 transition-colors">
                                      Gửi nhận xét phụ huynh
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-100 flex justify-center bg-slate-50/20">
          <button className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-mint-600 transition-colors flex items-center gap-3">
            Tải thêm danh sách
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}