import React, { useMemo, useState } from "react";
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
  UserCheck,
  Link2,
  Link2Off,
  ChevronDown,
  KeyRound,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext, User } from "../context/AppContext";
import CreateUserModal from "../components/modals/CreateUserModal";
import ApproveUsersModal from "../components/modals/ApproveUsersModal";
import ForgotPasswordRequestsModal from "../components/modals/ForgotPasswordRequestsModal";
import EditUserModal from "../components/modals/EditUserModal";
import ActionColumn from "../components/common/ActionColumn";
import PaginatedList from "../components/common/PaginatedList";

export default function UserManagementPage() {
  const { users, userRequests, forgotPasswordRequests, deleteUser, addUser, updateUser, approveRequest, resetUserPassword, stats: globalStats, canAccess, parentChildMap, linkParentToStudent, unlinkParentFromStudent, appendActivity } = useAppContext();
  const canManageUsers = canAccess('manage_users');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<User | null>(null);

  // Success Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetPassword = (userId: string, userName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn khôi phục mật khẩu cho người dùng ${userName}?`)) {
      const res = resetUserPassword(userId);
      if (res.success && res.tempPassword) {
        setResetPasswords(prev => ({ ...prev, [userId]: res.tempPassword! }));
        triggerToast(`Đã reset mật khẩu cho ${userName} thành công!`);
      } else {
        alert(res.message);
      }
    }
  };

  // Search & filter state
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tất cả');

  // Parent-child link state
  const [selectedChildId, setSelectedChildId] = useState<Record<string, string>>({});

  const displayedUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !searchText ||
        u.name.toLowerCase().includes(searchText.toLowerCase()) ||
        u.email.toLowerCase().includes(searchText.toLowerCase());
      const matchRole = roleFilter === 'Tất cả' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchText, roleFilter]);

  const studentUsers = useMemo(() => users.filter(u => u.role === 'Học viên'), [users]);

  const stats = [
    { label: "Tổng số", value: users.length.toLocaleString(), detail: "Toán học", color: "mint" as const, icon: Users },
    { label: "Giáo viên", value: users.filter(u => u.role === 'Giáo viên').length.toLocaleString(), color: "slate" as const, icon: BadgeCheck },
    { label: "Học sinh", value: users.filter(u => u.role === 'Học sinh').length.toLocaleString(), color: "mint" as const, icon: School },
    { label: "Bị khóa", value: users.filter(u => u.status === 'Khóa').length.toLocaleString(), color: "rose" as const, icon: Heart },
  ];

  const colorMap = {
    mint: { bg: 'bg-mint-500', bgLight: 'bg-mint-50', text: 'text-mint-600' },
    rose: { bg: 'bg-rose-500', bgLight: 'bg-rose-50', text: 'text-rose-600' },
    slate: { bg: 'bg-slate-500', bgLight: 'bg-slate-50', text: 'text-slate-600' },
  } as const;

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
    <div className="space-y-10 pb-10 relative">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white border border-mint-500/30 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 z-[9999]"
          >
            <div className="w-5 h-5 rounded-full bg-mint-500 text-white flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-slate-900 tracking-tight"
          >
            Quản lý Người dùng
          </motion.h2>
          {roleFilter && (
            <p className="text-slate-500 font-medium mt-2">
              Đang lọc theo vai trò: {roleFilter} ({displayedUsers.length} tài khoản).
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-mint-50 text-mint-700 rounded-full font-bold text-sm hover:bg-mint-100 transition-all shadow-sm">
            <Download className="w-5 h-5" />
            Xuất danh sách
          </button>
          {canManageUsers && (
            <>
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
                onClick={() => setIsForgotPasswordModalOpen(true)}
                className="relative flex items-center gap-2 px-6 py-3 bg-violet-50 text-violet-700 rounded-full font-bold text-sm shadow-sm hover:bg-violet-100 transition-all duration-300"
              >
                <KeyRound className="w-5 h-5" />
                Yêu cầu khôi phục
                {forgotPasswordRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {forgotPasswordRequests.filter(r => r.status === 'pending').length}
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
            </>
          )}
        </div>
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(newUser) => {
          const res = addUser(newUser);
          if (res && res.success) {
            triggerToast("Thêm mới thành viên thành công!");
          }
          return res;
        }}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUserToEdit(null);
        }}
        user={selectedUserToEdit}
        onSubmit={(id, updatedFields) => {
          const res = updateUser(id, updatedFields);
          if (res && res.success) {
            triggerToast("Cập nhật thông tin thành công!");
          }
          return res;
        }}
      />

      <ApproveUsersModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
      />

      <ForgotPasswordRequestsModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
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
            <div className={`absolute -right-4 -top-4 w-28 h-28 rounded-full blur-2xl opacity-10 group-hover:opacity-20 ${colorMap[stat.color].bg} transition-opacity`}></div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${colorMap[stat.color].bgLight} flex items-center justify-center ${colorMap[stat.color].text}`}>
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
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Tìm kiếm theo tên, email..."
                className="w-full bg-white border-2 border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all placeholder:text-slate-400 font-medium shadow-sm"
              />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 lg:block hidden">Lọc:</span>
            {["Tất cả", "Giáo viên", "Học viên", "Phụ huynh"].map((f) => (
              <button
                key={f}
                onClick={() => setRoleFilter(f)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  roleFilter === f ? "bg-mint-600 text-white shadow-lg shadow-mint-100" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
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
        <div className="hidden lg:grid lg:grid-cols-[60px_2.5fr_1fr_2fr_1.5fr_1fr_120px] gap-4 px-8 py-4 bg-slate-50/30 border-b border-slate-100">
          <div className="flex items-center justify-center"><input type="checkbox" className="rounded border-slate-300" /></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center">Họ và Tên</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center">Vai trò</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center">Liên hệ</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center">Trạng thái</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center">Hoạt động log</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center justify-end">Thao tác</p>
        </div>

        <PaginatedList<User>
          items={displayedUsers}
          pageSize={10}
          mode="pagination"
          renderEmpty={() => (
            <div className="py-16 text-center text-slate-400 text-sm font-medium">
              Không tìm thấy người dùng phù hợp
            </div>
          )}
          renderItem={(user, i) => (
            <React.Fragment key={user.id}>
              <div
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
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.roleColor === 'slate' ? 'bg-slate-50 text-slate-600' : 'bg-mint-50 text-mint-600'}`}>{user.role}</span>
                </div>

                <div className="text-[13px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  <p className="text-slate-600">{user.email}</p>
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

                <div className="flex items-center justify-end">
                  <ActionColumn
                    actions={canManageUsers ? ['view', 'edit', 'delete'] : ['view']}
                    itemId={user.id}
                    onAction={(type, id) => {
                      if (type === 'view') {
                        toggleExpand(id);
                      } else if (type === 'edit') {
                        setSelectedUserToEdit(user);
                        setIsEditModalOpen(true);
                      } else if (type === 'delete') {
                        if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản người dùng ${user.name}? Hành động này không thể hoàn tác.`)) {
                          deleteUser(id);
                          triggerToast("Đã xóa tài khoản thành công!");
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <AnimatePresence>
                {expandedUserId === user.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-slate-50/50 border-b border-slate-100 overflow-hidden"
                  >
                    <div className="px-20 py-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                      {/* Activity logs */}
                      <div className="space-y-6">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                          <History className="w-4 h-4 text-mint-600" />
                          Hoạt động gần đây
                        </h4>
                        <div className="space-y-4">
                          {getActivityLogs(user).map((log, idx) => (
                            <div key={idx} className="flex items-start gap-4 group/log">
                              <div className={`mt-1 p-2 rounded-lg ${log.color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-mint-50 text-mint-600'}`}>
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

                      {/* Right: parent-child OR account summary */}
                      {user.role === 'Phụ huynh' ? (
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-violet-500" />
                            Con em đã liên kết
                          </h4>
                          <div className="space-y-2">
                            {(parentChildMap[user.id] ?? []).length === 0 && (
                              <p className="text-xs text-slate-400 font-medium">Chưa liên kết học sinh nào</p>
                            )}
                            {(parentChildMap[user.id] ?? []).map(childId => {
                              const child = users.find(u => u.id === childId);
                              return (
                                <div key={childId} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 group/child">
                                  <div className="flex items-center gap-2">
                                    <img src={`https://picsum.photos/seed/${childId}/32/32`} className="w-7 h-7 rounded-full" alt="" referrerPolicy="no-referrer" />
                                    <span className="text-sm font-bold text-slate-800">{child?.name ?? childId}</span>
                                  </div>
                                  {canManageUsers && (
                                    <button
                                      onClick={() => unlinkParentFromStudent(user.id, childId)}
                                      className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover/child:opacity-100 transition-all"
                                    >
                                      <Link2Off className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {canManageUsers && (
                            <div className="flex gap-2 pt-2 border-t border-slate-100">
                              <div className="relative flex-1">
                                <select
                                  value={selectedChildId[user.id] ?? ''}
                                  onChange={e => setSelectedChildId(prev => ({ ...prev, [user.id]: e.target.value }))}
                                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-3 text-xs font-bold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40 outline-none appearance-none"
                                >
                                  <option value="">-- Chọn học viên --</option>
                                  {studentUsers
                                    .filter(s => !(parentChildMap[user.id] ?? []).includes(s.id))
                                    .map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                                  }
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                              </div>
                              <button
                                onClick={() => {
                                  const childId = selectedChildId[user.id];
                                  if (!childId) return;
                                  linkParentToStudent(user.id, childId);
                                  const child = users.find(u => u.id === childId);
                                  appendActivity(
                                    `Liên kết phụ huynh - học sinh`,
                                    `${user.name} đã được liên kết với ${child?.name ?? childId}`,
                                    'mint'
                                  );
                                  setSelectedChildId(prev => ({ ...prev, [user.id]: '' }));
                                }}
                                disabled={!selectedChildId[user.id]}
                                className="px-3 py-2 bg-violet-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-violet-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                                Liên kết
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Tóm tắt tài khoản</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hoạt động</p>
                              <p className="text-sm font-bold text-slate-900">{user.activity}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                              <p className="text-sm font-bold text-slate-900">{user.status}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl col-span-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                              <p className="text-sm font-bold text-slate-900">{user.email}</p>
                            </div>
                          </div>

                          {canManageUsers && (
                            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bảo mật</span>
                                <button
                                  onClick={() => handleResetPassword(user.id, user.name)}
                                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                  Reset Mật khẩu
                                </button>
                              </div>
                              {resetPasswords[user.id] && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col gap-2">
                                  <p className="text-xs font-bold text-rose-800">Khôi phục mật khẩu thành công!</p>
                                  <p className="text-xs font-semibold text-rose-700">Mật khẩu tạm mới: <span className="font-black text-rose-950 px-2 py-0.5 bg-white rounded border border-rose-200 select-all">{resetPasswords[user.id]}</span></p>
                                  <p className="text-[10px] text-rose-500 font-medium">* Lưu ý: Cung cấp mật khẩu tạm này cho người dùng để đăng nhập lần đầu.</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Fragment>
          )}
        />
      </div>
    </div>
  );
}