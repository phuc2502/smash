import {
  School,
  PlayCircle,
  Clock,
  CheckCircle2,
  Filter,
  Plus,
  Grid2X2,
  List,
  MoreVertical,
  Calendar,
  Users,
  MapPin,
  Settings2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useAppContext, Class } from "../context/AppContext";
import CreateClassModal from "../components/modals/CreateClassModal";
import ManageScheduleModal from "../components/modals/ManageScheduleModal";

export default function ClassManagementPage() {
  const { classes, addClass, updateClass } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");

  const handleManageSchedule = (cls: Class) => {
    setSelectedClass(cls);
    setIsScheduleModalOpen(true);
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch =
      cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "Tất cả" || cls.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Tổng số lớp học", value: classes.length.toString(), icon: School, color: "mint" as const },
    { label: "Đang diễn ra", value: classes.filter(c => c.status === 'Đang diễn ra').length.toString(), icon: PlayCircle, color: "mint" as const },
    { label: "Sắp bắt đầu", value: classes.filter(c => c.status === 'Sắp bắt đầu').length.toString(), icon: Clock, color: "mint" as const },
    { label: "Đã hoàn thành", value: classes.filter(c => c.status === 'Đã kết thúc').length.toString(), icon: CheckCircle2, color: "slate" as const },
  ];

  const statuses = ["Tất cả", "Đang diễn ra", "Sắp bắt đầu", "Đã kết thúc"];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'mint': return {
        bg: 'bg-mint-500',
        bgLight: 'bg-mint-50',
        text: 'text-mint-600',
        border: 'border-mint-100',
        hoverBg: 'hover:bg-mint-500',
        shadow: 'shadow-mint-100',
        ring: 'ring-mint-500'
      };
      case 'rose': return {
        bg: 'bg-rose-500',
        bgLight: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-100',
        hoverBg: 'hover:bg-rose-500',
        shadow: 'shadow-rose-100',
        ring: 'ring-rose-500'
      };
      default: return {
        bg: 'bg-slate-500',
        bgLight: 'bg-slate-50',
        text: 'text-slate-600',
        border: 'border-slate-100',
        hoverBg: 'hover:bg-slate-500',
        shadow: 'shadow-slate-100',
        ring: 'ring-slate-500'
      };
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-slate-900 tracking-tight"
          >
            Quản lý Lớp & Lịch học
          </motion.h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">
            Điều phối danh sách lớp học, phân công giáo viên và tối ưu hóa lịch trình giảng dạy hàng tuần.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative group w-full sm:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-mint-600 transition-colors" />
            <input
              type="text"
              placeholder="Tìm tên lớp, GV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-full font-bold text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-xl hover:shadow-mint-200 hover:-translate-y-0.5 transition-all shadow-lg shadow-mint-100 whitespace-nowrap w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Tạo lớp mới
          </button>
        </div>
      </div>

      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addClass}
      />

      <ManageScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        targetClass={selectedClass}
        onUpdate={updateClass}
      />

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const colors = getColorClasses(stat.color);
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-500 cursor-pointer ${statusFilter === stat.label.replace('Tổng số lớp học', 'Tất cả') || (stat.label === 'Tổng số lớp học' && statusFilter === 'Tất cả') ? `ring-2 ${colors.ring}` : ''}`}
              onClick={() => setStatusFilter(stat.label === 'Tổng số lớp học' ? 'Tất cả' : stat.label)}
            >
              <div className={`w-12 h-12 rounded-[16px] ${colors.bgLight} flex items-center justify-center mb-6 ${colors.text} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-4xl font-black text-slate-900 leading-none">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Class List Table/Grid container */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Danh sách Lớp học hiện tại</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hiển thị {filteredClasses.length} kết quả</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full sm:w-auto justify-end">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === status
                    ? 'bg-mint-600 text-white shadow-lg shadow-mint-100 scale-105'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredClasses.map((cls, i) => {
                const colors = getColorClasses(cls.color);
                return (
                  <motion.div
                    key={cls.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group bg-slate-50/50 rounded-[32px] border border-slate-200/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden flex flex-col"
                  >
                    <div className={`h-2.5 w-full ${colors.bg} absolute top-0 left-0`}></div>

                    <div className="p-7 flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${cls.status === 'Đang diễn ra' ? 'bg-mint-100 text-mint-600' :
                            cls.status === 'Sắp bắt đầu' ? 'bg-mint-100 text-mint-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cls.status === 'Đang diễn ra' ? 'bg-mint-500' :
                              cls.status === 'Sắp bắt đầu' ? 'bg-mint-500' : 'bg-slate-500'
                            } ${cls.status !== 'Đã kết thúc' ? 'animate-pulse' : ''}`}></span>
                          {cls.status}
                        </span>
                        <button className="text-slate-300 hover:text-mint-600 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>

                      <h4 className="text-[22px] font-black text-slate-900 mb-1 leading-tight group-hover:text-mint-600 transition-colors">{cls.title}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Mã lớp: {cls.id}</p>

                      <div className="flex items-center gap-4 p-4 bg-white/50 rounded-[20px] border border-slate-100">
                        <img
                          src={`https://picsum.photos/seed/${cls.instructor}/100/100`}
                          className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                          alt="Instructor"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-sm font-black text-slate-800">{cls.instructor}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{cls.role}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-100/30 border-t border-slate-100 space-y-3">
                      <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-800 transition-colors line-clamp-1">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-xs font-bold">{cls.schedule}</span>
                      </div>
                      {cls.location && (
                        <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-800 transition-colors">
                          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="text-xs font-bold">{cls.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-800 transition-colors pb-2">
                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-xs font-bold">{cls.studentsCount}/{cls.maxStudents} Học sinh</span>
                      </div>

                      <button
                        onClick={() => handleManageSchedule(cls)}
                        className={`w-full py-2.5 rounded-xl border-2 ${colors.border} ${colors.text} font-black text-[10px] uppercase tracking-widest ${colors.hoverBg} hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2 mt-2`}
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        Thiết lập lịch
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filteredClasses.length === 0 && (
              <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Filter className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">Không tìm thấy kết quả</h4>
                  <p className="text-sm text-slate-500 font-medium">Thử thay đổi từ khóa hoặc bộ lọc để tìm thấy điều bạn cần.</p>
                </div>
                <button
                  onClick={() => { setSearchQuery(""); setStatusFilter("Tất cả"); }}
                  className="mt-2 text-mint-600 font-black text-xs uppercase tracking-widest border-b-2 border-mint-600 pb-1 hover:text-mint-700 hover:border-mint-700 transition-all"
                >
                  Xóa các bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
