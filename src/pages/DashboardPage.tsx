import {
  Users,
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Clock,
  AlertTriangle,
  FileEdit,
  Mail,
  MoreVertical,
  X,
  Check,
  School,
  UserPlus,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import CreateClassModal from "../components/modals/CreateClassModal";
import CreateUserModal from "../components/modals/CreateUserModal";
import ApproveUsersModal from "../components/modals/ApproveUsersModal";

export default function DashboardPage() {
  const { stats: globalStats, users, assignments, classes, materials, addClass, addUser } = useAppContext();
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const stats = [
    { label: "Tổng số Học viên", value: globalStats.totalUsers.toLocaleString(), trend: "+12%", up: true, subtitle: "so với tháng trước", color: "mint", icon: Users },
    { label: "Tổng số Giáo viên", value: globalStats.totalTeachers.toLocaleString(), trend: "+3", up: true, subtitle: "giáo viên mới", color: "mint", icon: GraduationCap },
    { label: "Lớp học Đang diễn ra", value: globalStats.activeClasses.toLocaleString(), trend: "", up: null, subtitle: "Phân bổ trên các khối", color: "mint", icon: CalendarDays },
    { label: "Bài tập Chờ chấm", value: globalStats.pendingGrading.toLocaleString(), trend: "-0.5%", up: false, subtitle: "cần xử lý ngay", color: "rose", icon: CheckCircle2 },
  ];

  // Derive recent activities from context
  const recentActivities = [
    ...(users.slice(0, 2).map(u => ({
      type: 'user',
      title: 'Tài khoản mới',
      detail: `${u.name} (${u.role}) vừa tham gia hệ thống SMASH.`,
      time: u.activity,
      color: u.role === 'Giáo viên' ? 'mint' : 'mint'
    }))),
    ...(assignments.filter(a => a.status === 'Chờ chấm điểm').map(a => ({
      type: 'score',
      title: 'Cần chấm điểm',
      detail: `Bài "${a.title}" thuộc ${a.className} đã đủ bài nộp.`,
      time: 'Vừa xong',
      color: 'mint'
    }))),
    ...(materials.slice(0, 1).map(m => ({
      type: 'alert',
      title: 'Tài liệu cập nhật',
      detail: `Tài liệu "${m.title}" đã được thêm tệp mới.`,
      time: m.updated,
      color: 'mint'
    })))
  ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);

  // Derive classroom tasks (formerly approvals)
  const pendingTasks = [
    ...assignments.filter(a => a.status === 'Chờ chấm điểm').map(a => ({
      title: `Chấm bài: ${a.title}`,
      sender: `Phụ trách: ${a.className}`,
      icon: FileEdit,
      count: `${a.progress}/${a.total}`
    })),
    ...classes.filter(c => c.studentsCount < (c.maxStudents * 0.5)).map(c => ({
      title: `Tuyển sinh: ${c.title}`,
      sender: `GV: ${c.instructor}`,
      icon: Plus,
      count: `Thiếu ${c.maxStudents - c.studentsCount}`
    }))
  ].slice(0, 4);

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-black text-slate-900 tracking-tight"
          >
            Tổng quan SMASH Math
          </motion.h2>
          <p className="text-slate-500 font-medium mt-1">Hệ thống quản lý dựa trên dữ liệu thực tế</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-mint-600 to-mint-400 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-mint-100 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Xuất báo cáo dữ liệu
        </motion.button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/80 backdrop-blur-xl p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-10 group-hover:scale-125 transition-transform duration-700 bg-${stat.color}-500`}></div>

            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
            </div>

            <div className="space-y-1">
              <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
              <div className="flex items-center gap-2 pt-2">
                {stat.up !== null && (
                  <div className={`flex items-center gap-0.5 text-xs font-bold ${stat.up ? 'text-mint-600' : 'text-rose-600'}`}>
                    {stat.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {stat.trend}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-400">{stat.subtitle}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Class Capacity Distribution */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Phân bổ Học sinh theo Lớp</h3>
              <p className="text-sm text-slate-500 font-medium">So sánh tỷ lệ lấp đầy giữa các lớp hiện tại</p>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-around gap-4 h-64 group">
            {classes.map((cls, i) => {
              const percentage = (cls.studentsCount / cls.maxStudents) * 100;
              return (
                <div key={cls.id} className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full relative h-64 flex items-end px-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${percentage}%` }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className={`w-full rounded-t-2xl transition-all duration-300 relative group/bar ${percentage > 90 ? 'bg-mint-700' : percentage > 70 ? 'bg-mint-500' : 'bg-mint-300'}`}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                        {cls.studentsCount} / {cls.maxStudents} HS
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 text-center uppercase tracking-tighter truncate w-full" title={cls.title}>
                    {cls.title.split(' - ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Hoạt động hệ thống</h3>
            <button className="text-xs font-bold text-mint-600 uppercase tracking-widest hover:text-mint-700 transition-colors">Xem nhật ký</button>
          </div>

          <div className="flex-1 space-y-8">
            {recentActivities.length > 0 ? recentActivities.map((activity, i) => (
              <div key={i} className="flex gap-4 group">
                <div className={`shrink-0 w-9 h-9 rounded-full bg-${activity.color}-50 flex items-center justify-center text-${activity.color}-500 transition-transform group-hover:scale-110`}>
                  {activity.type === 'user' && <Users className="w-5 h-5" />}
                  {activity.type === 'score' && <CheckCircle2 className="w-5 h-5" />}
                  {activity.type === 'alert' && <AlertTriangle className="w-5 h-5" />}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">{activity.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{activity.detail}</p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 italic">Chưa có dữ liệu hoạt động</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 tracking-tight mb-8">Điều phối nhanh</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => setIsApproveModalOpen(true)}
              className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-mint-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 text-slate-600 group-hover:scale-110 group-hover:text-mint-600 transition-all relative">
                <UserCheck className="w-6 h-6" />
                {globalStats.pendingRequests > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {globalStats.pendingRequests}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-600 text-center leading-tight group-hover:text-slate-900"><span className="block">Duyệt</span><span className="block">Yêu</span><span className="block">cầu</span></span>
            </button>

            <button
              onClick={() => setIsClassModalOpen(true)}
              className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-mint-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 text-slate-600 group-hover:scale-110 group-hover:text-mint-600 transition-all">
                <School className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-600 text-center leading-tight group-hover:text-slate-900"><span className="block">Mở</span><span className="block">lớp</span><span className="block">Mới</span></span>
            </button>

            <button className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group overflow-hidden relative">
              <div className="absolute inset-0 bg-mint-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 text-slate-600 group-hover:scale-110 group-hover:text-mint-600 transition-all">
                <FileEdit className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-600 text-center leading-tight group-hover:text-slate-900"><span className="block">Cấp</span><span className="block">tài</span><span className="block">liệu</span></span>
            </button>

            <button className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group overflow-hidden relative">
              <div className="absolute inset-0 bg-slate-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 text-slate-600 group-hover:scale-110 group-hover:text-mint-600 transition-all">
                <Mail className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-600 text-center leading-tight group-hover:text-slate-900"><span className="block">Gửi</span><span className="block">Thông</span><span className="block">báo</span></span>
            </button>
          </div>
        </div>

        <CreateClassModal
          isOpen={isClassModalOpen}
          onClose={() => setIsClassModalOpen(false)}
          onSubmit={addClass}
        />

        <CreateUserModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          onSubmit={addUser}
        />

        <ApproveUsersModal
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
        />

        {/* Dynamic Critical Tasks */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Hành động ưu tiên</h3>
            <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{pendingTasks.length} tác vụ</span>
          </div>
          <div className="space-y-4">
            {/* Approval request notification if any */}
            {globalStats.pendingRequests > 0 && (
              <div
                onClick={() => setIsApproveModalOpen(true)}
                className="flex items-center justify-between p-4 rounded-[20px] bg-mint-50 border border-mint-100 hover:bg-white hover:shadow-lg hover:shadow-mint-100 transition-all duration-300 group cursor-pointer animate-pulse-slow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-mint-500 shadow-sm">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Yêu cầu đăng ký mới</p>
                    <p className="text-[10px] text-mint-400 font-bold uppercase tracking-widest mt-0.5">{globalStats.pendingRequests} tài khoản chờ duyệt</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-mint-300 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
            {pendingTasks.map((task, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-[20px] bg-slate-50 border border-transparent hover:border-mint-100 hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-mint-500 transition-colors">
                    <task.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{task.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{task.sender}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                    {task.count}
                  </span>
                  <div className="flex gap-1">
                    <button className="p-2 rounded-xl text-slate-300 hover:bg-mint-50 hover:text-mint-500 transition-all">
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <div className="text-center py-8 text-slate-400 italic text-sm">Tất cả bài tập đã được chấm điểm!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
