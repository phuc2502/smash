import React, { useState } from "react";
import {
  Users,
  BadgeCheck,
  School,
  Heart,
  Search,
  Download,
  Plus,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Eye,
  Activity,
  LogIn,
  CheckSquare,
  RefreshCw,
  Clock,
  History,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext, User } from "../context/AppContext";
import CreateUserModal from "../components/modals/CreateUserModal";
import ApproveUsersModal from "../components/modals/ApproveUsersModal";

export default function UserManagementPage() {
  const { users, userRequests, deleteUser, addUser, approveRequest, stats: globalStats } = useAppContext();
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const stats = [
    { label: "Tổng số", value: users.length.toLocaleString(), detail: "Toán học", color: "mint", icon: Users },
    { label: "Giáo viên", value: users.filter(u => u.role === 'Giáo viên').length.toLocaleString(), color: "slate", icon: BadgeCheck },
    { label: "Học sinh", value: users.filter(u => u.role === 'Học sinh').length.toLocaleString(), color: "mint", icon: School },
    { label: "Bị khóa", value: users.filter(u => u.status === 'Khóa').length.toLocaleString(), color: "rose", icon: Heart },
  ];

  const handleAddRandomUser = () => {
    const id = `ST-${Math.floor(Math.random() * 10000)}`;
    const newUser: User = {
      id,
      name: "Người dùng Mới " + Math.floor(Math.random() * 100),
      role: "Học sinh",
      roleColor: "mint",
      email: `${id}@student.edu.vn`,
      phone: "0900 000 000",
      status: "Đang học",
      statusColor: "mint",
      activity: "Vừa xong"
    };
    addUser(newUser);
  };

  const toggleExpand = (id: string) => {
    setExpandedUserId(expandedUserId === id ? null : id);
  };

  // Mock activity logs for each user type
  const getActivityLogs = (user: User) => {
    if (user.role === 'Giáo viên') {
      return [
        { type: 'login', label: 'Đăng nhập hệ thống', time: '10 phút trước', icon: LogIn, color: 'mint' },
        { type: 'grade', label: 'Cập nhật điểm lớp Toán 9', time: '1 giờ trước', icon: RefreshCw, color: 'mint' },
        { type: 'assignment', label: 'Phát hành bài tập mới', time: 'Hôm qua', icon: CheckSquare, color: 'mint' },
      ];
    }
    return [
      { type: 'login', label: 'Đăng nhập hệ thống', time: '2 giờ trước', icon: LogIn, color: 'mint' },
      { type: 'assignment', label: 'Đã nộp bài tập Số học', time: '3 giờ trước', icon: CheckSquare, color: 'mint' },
      { type: 'grade', label: 'Xem bảng điểm kỳ 1', time: '5 giờ trước', icon: Eye, color: 'mint' },
    ];
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-slate-900 tracking-tight"
          >
            Quản lý Người dùng
          </motion.h2>
          <p className="text-slate-500 font-medium mt-2">
            Xem, thêm, chỉnh sửa và quản lý tất cả tài khoản trong hệ thống bảo mật SMASH.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-mint-50 text-mint-700 rounded-full font-bold text-sm hover:bg-mint-100 transition-all shadow-sm">
            <Download className="w-5 h-5" />
            Xuất danh sách
          </button>
          <button
            onClick={() => setIsApproveModalOpen(true)}
            className="relative flex items-center gap-2 px-6 py-3 bg-mint-50 text-mint-700 rounded-full font-bold text-sm shadow-sm hover:bg-mint-100 transition-all duration-300"
          >
            <UserCheck className="w-5 h-5" />
            Duyệt yêu cầu
            {userRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {userRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-full font-bold text-sm shadow-xl shadow-mint-100 hover:shadow-2xl hover:shadow-mint-200 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-5 h-5" />
            Thêm trực tiếp
          </button>
        </div>
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addUser}
      />

      <ApproveUsersModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
      />

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500"
          >
            <div className={`absolute -right-4 -top-4 w-28 h-28 rounded-full blur-2xl opacity-10 group-hover:opacity-20 bg-${stat.color}-500 transition-opacity`}></div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="relative z-10 flex items-baseline gap-3">
              <span className="text-4xl font-black text-slate-900 leading-none">{stat.value}</span>
              {stat.detail && <span className="text-[10px] font-bold text-mint-500 uppercase tracking-widest">{stat.detail}</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Table Content */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative w-full sm:w-80 group mr-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-mint-600 transition-colors z-10" />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh, GV..."
                className="w-full bg-white border-2 border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all placeholder:text-slate-400 font-medium shadow-sm"
              />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 lg:block hidden">Lọc:</span>
            {["Tất cả", "Giáo viên", "Học sinh", "Phụ huynh"].map((f, i) => (
              <button
                key={f}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${i === 0 ? "bg-mint-600 text-white shadow-lg shadow-mint-100" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 text-slate-400 hover:text-mint-600 hover:bg-white rounded-2xl transition-all"><Filter className="w-5 h-5" /></button>
            <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Table Head */}
        <div className="hidden lg:grid lg:grid-cols-[60px_2.5fr_1fr_2fr_1.5fr_1fr_120px] gap-4 px-8 py-4 bg-slate-50/30 border-b border-slate-100 italic">
          <div className="flex items-center justify-center"><input type="checkbox" className="rounded border-slate-300" /></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center">Họ và Tên</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center">Vai trò</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center">Liên hệ</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center">Trạng thái</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center">Hoạt động log</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center justify-end">Thao tác</p>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100">
          {users.map((user, i) => (
            <React.Fragment key={user.id}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className={`grid grid-cols-1 lg:grid-cols-[60px_2.5fr_1fr_2fr_1.5fr_1fr_120px] gap-4 px-8 py-6 items-center group transition-all duration-300 ${expandedUserId === user.id ? 'bg-mint-50/30' : 'hover:bg-slate-50/80'}`}
              >
                <div className="flex items-center justify-center lg:block hidden"><input type="checkbox" className="rounded border-slate-300 text-mint-600 focus:ring-mint-500/20" /></div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-2 ring-slate-100 group-hover:ring-mint-200 transition-all">
                    <img src={`https://picsum.photos/seed/${user.id}/100/100`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 leading-tight group-hover:text-mint-600 transition-colors uppercase tracking-tight">{user.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-0.5">ID: {user.id}</p>
                  </div>
                </div>

                <div className="lg:block hidden">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-${user.roleColor}-50 text-${user.roleColor}-600`}>{user.role}</span>
                </div>

                <div className="text-[13px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  <p className="italic">{user.email}</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1">{user.phone}</p>
                </div>

                <div className="lg:block hidden">
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent ${user.status === 'Khóa' ? 'bg-red-50 text-red-600' :
                      user.status === 'Nghỉ học' ? 'bg-slate-100 text-slate-500' :
                        'bg-mint-50 text-mint-600'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Khóa' ? 'bg-red-500' :
                        user.status === 'Nghỉ học' ? 'bg-slate-400' :
                          'bg-mint-500 animate-pulse'
                      }`}></span>
                    {user.status}
                  </span>
                </div>

                <div className="lg:block hidden">
                  <button
                    onClick={() => toggleExpand(user.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${expandedUserId === user.id ? 'bg-mint-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Nhật ký
                  </button>
                </div>

                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <button className="p-2.5 text-slate-400 hover:text-mint-600 hover:bg-white rounded-xl transition-all shadow-sm"><Edit3 className="w-4.5 h-4.5" /></button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                  <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm"><MoreVertical className="w-4.5 h-4.5" /></button>
                </div>
              </motion.div>

              <AnimatePresence>
                {expandedUserId === user.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-slate-50/50 border-b border-slate-100 overflow-hidden"
                  >
                    <div className="px-20 py-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                          <History className="w-4 h-4 text-mint-600" />
                          Hoạt động gần đây
                        </h4>
                        <div className="space-y-4">
                          {getActivityLogs(user).map((log, idx) => (
                            <div key={idx} className="flex items-start gap-4 group/log">
                              <div className={`mt-1 p-2 rounded-lg bg-${log.color}-50 text-${log.color}-600`}>
                                <log.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800 group-hover/log:text-mint-600 transition-colors">{log.label}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {log.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Tóm tắt tài khoản</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đăng nhập cuối</p>
                            <p className="text-sm font-bold text-slate-900 italic">23:04, 20/04</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Địa chỉ IP</p>
                            <p className="text-sm font-bold text-slate-900">113.190.231.54</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thiết bị</p>
                            <p className="text-sm font-bold text-slate-900">Chrome / Windows</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 hover:border-mint-300 transition-colors cursor-pointer group/btn">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/btn:text-mint-600">+ Xem thêm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </div>

        {/* Pagination */}
        <div className="p-8 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50/20">
          <div>Hiển thị 1-10 của 1,248</div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl hover:bg-white hover:text-mint-600 hover:shadow-sm transition-all disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
            <button className="w-10 h-10 rounded-xl bg-mint-600 text-white shadow-lg shadow-mint-100 flex items-center justify-center font-black">1</button>
            <button className="w-10 h-10 rounded-xl hover:bg-white hover:text-mint-600 transition-all flex items-center justify-center">2</button>
            <button className="w-10 h-10 rounded-xl hover:bg-white hover:text-mint-600 transition-all flex items-center justify-center">3</button>
            <span className="px-2">...</span>
            <button className="w-10 h-10 rounded-xl hover:bg-white hover:text-mint-600 transition-all flex items-center justify-center">125</button>
            <button className="p-2.5 rounded-xl hover:bg-white hover:text-mint-600 hover:shadow-sm transition-all"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}