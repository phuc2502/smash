import {
  School,
  PlayCircle,
  Clock,
  CheckCircle2,
  Filter,
  Plus,
  Grid2X2,
  List,
  Calendar,
  Users,
  MapPin,
  Settings2,
  GraduationCap,
  FileText,
  ClipboardCheck,
  Archive,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppContext, Class } from "../context/AppContext";
import CreateClassModal from "../components/modals/CreateClassModal";
import ManageScheduleModal from "../components/modals/ManageScheduleModal";
import ManageStudentsModal from "../components/modals/ManageStudentsModal";
import ActionColumn from "../components/common/ActionColumn";
import StatusBadge from "../components/common/StatusBadge";
import PaginatedList from "../components/common/PaginatedList";

export default function ClassManagementPage() {
  const navigate = useNavigate();
  const {
    classes,
    addClass,
    updateClass,
    deleteClass,
    assignments,
    attendanceSessions,
    canAccess,
    currentAccount,
    classStudentMap,
    parentChildMap,
    users,
  } = useAppContext();
  
  const canManageClasses = canAccess('manage_classes');
  const [searchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [selectedStudentsClass, setSelectedStudentsClass] = useState<Class | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get("status") ?? "Tất cả");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [classToEdit, setClassToEdit] = useState<Class | null>(null);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status) setStatusFilter(status);
  }, [searchParams]);

  const handleManageSchedule = (cls: Class) => {
    setSelectedClass(cls);
    setIsScheduleModalOpen(true);
  };

  const handleManageStudents = (cls: Class) => {
    setSelectedStudentsClass(cls);
    setIsStudentsModalOpen(true);
  };

  const handleArchiveClass = (cls: Class) => {
    updateClass(cls.id, { status: "Đã lưu trữ" });
  };

  const handleDeleteClass = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này không?")) {
      deleteClass(id);
    }
  };

  const handleEditClass = (cls: Class) => {
    setClassToEdit(cls);
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateClass = (cls: Class) => {
    if (classToEdit) {
      updateClass(classToEdit.id, cls);
    } else {
      addClass(cls);
    }
  };

  const isStudent = currentAccount?.role === "Học viên";
  const isParent = currentAccount?.role === "Phụ huynh";

  const userClasses = classes.filter(cls => {
    if (isStudent && currentAccount) {
      const studentIds = classStudentMap[cls.id] ?? [];
      return studentIds.includes(currentAccount.id);
    }
    if (isParent && currentAccount) {
      const childrenIds = parentChildMap[currentAccount.id] ?? [];
      const studentIds = classStudentMap[cls.id] ?? [];
      return childrenIds.some(childId => studentIds.includes(childId));
    }
    return true; // Teachers, admins, owners see all classes
  });

  const filteredClasses = userClasses.filter(cls => {
    const matchesSearch =
      cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "Tất cả" || cls.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Helper to compute stats dynamically
  const getClassStats = (classId: string) => {
    const sessions = attendanceSessions.filter(s => s.classId === classId);
    let attendanceRate = 100;
    if (sessions.length > 0) {
      let totalStudentsCount = 0;
      let totalAttendedCount = 0;
      sessions.forEach(s => {
        totalStudentsCount += s.totalStudents;
        totalAttendedCount += (s.presentCount + s.lateCount + s.excusedCount);
      });
      if (totalStudentsCount > 0) {
        attendanceRate = Math.round((totalAttendedCount / totalStudentsCount) * 100);
      }
    } else {
      const hash = classId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      attendanceRate = 85 + (hash % 14);
    }

    const classAssignments = assignments.filter(a => a.classId === classId);
    let submissionRate = 100;
    if (classAssignments.length > 0) {
      let totalProblems = 0;
      let submittedProblems = 0;
      classAssignments.forEach(a => {
        totalProblems += a.total;
        submittedProblems += a.progress;
      });
      if (totalProblems > 0) {
        submissionRate = Math.round((submittedProblems / totalProblems) * 100);
      }
    } else {
      const hash = classId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      submissionRate = 75 + (hash % 21);
    }

    return { attendanceRate, submissionRate };
  };

  // Calculate statistics dynamically based on user role
  let stats = [];
  if (isStudent) {
    const teachers = new Set(userClasses.map(c => c.instructor));
    const studentIdsInSameClasses = new Set<string>();
    userClasses.forEach(cls => {
      const ids = classStudentMap[cls.id] ?? [];
      ids.forEach(id => {
        if (currentAccount && id !== currentAccount.id) studentIdsInSameClasses.add(id);
      });
    });
    stats = [
      { label: "Lớp học tham gia", value: userClasses.length.toString(), icon: School, color: "mint" as const },
      { label: "Đang diễn ra", value: userClasses.filter(c => c.status === 'Đang diễn ra').length.toString(), icon: PlayCircle, color: "mint" as const },
      { label: "Bạn học cùng lớp", value: studentIdsInSameClasses.size.toString(), icon: Users, color: "mint" as const },
      { label: "Giáo viên hướng dẫn", value: teachers.size.toString(), icon: Clock, color: "slate" as const },
    ];
  } else if (isParent) {
    const childrenIds = currentAccount ? (parentChildMap[currentAccount.id] ?? []) : [];
    const teachers = new Set(userClasses.map(c => c.instructor));
    stats = [
      { label: "Lớp học của con", value: userClasses.length.toString(), icon: School, color: "mint" as const },
      { label: "Đang học", value: userClasses.filter(c => c.status === 'Đang diễn ra').length.toString(), icon: PlayCircle, color: "mint" as const },
      { label: "Số con em đang học", value: childrenIds.length.toString(), icon: Users, color: "mint" as const },
      { label: "Giáo viên phụ trách", value: teachers.size.toString(), icon: Clock, color: "slate" as const },
    ];
  } else {
    stats = [
      { label: "Tổng số lớp học", value: userClasses.length.toString(), icon: School, color: "mint" as const },
      { label: "Đang diễn ra", value: userClasses.filter(c => c.status === 'Đang diễn ra').length.toString(), icon: PlayCircle, color: "mint" as const },
      { label: "Sắp bắt đầu", value: userClasses.filter(c => c.status === 'Sắp bắt đầu').length.toString(), icon: Clock, color: "mint" as const },
      { label: "Đã hoàn thành", value: userClasses.filter(c => c.status === 'Đã kết thúc').length.toString(), icon: CheckCircle2, color: "slate" as const },
    ];
  }

  const handleStatClick = (label: string) => {
    if (label === "Tổng số lớp học" || label === "Lớp học tham gia" || label === "Lớp học của con") {
      setStatusFilter("Tất cả");
    } else if (label === "Đang diễn ra" || label === "Đang học") {
      setStatusFilter("Đang diễn ra");
    } else if (label === "Sắp bắt đầu") {
      setStatusFilter("Sắp bắt đầu");
    } else if (label === "Đã hoàn thành") {
      setStatusFilter("Đã kết thúc");
    }
  };

  const isStatActive = (label: string) => {
    if (statusFilter === "Tất cả" && (label === "Tổng số lớp học" || label === "Lớp học tham gia" || label === "Lớp học của con")) return true;
    if (statusFilter === "Đang diễn ra" && (label === "Đang diễn ra" || label === "Đang học")) return true;
    if (statusFilter === "Sắp bắt đầu" && label === "Sắp bắt đầu") return true;
    if (statusFilter === "Đã kết thúc" && label === "Đã hoàn thành") return true;
    return false;
  };

  const getChildrenInClass = (classId: string) => {
    if (!currentAccount || !isParent) return [];
    const childrenIds = parentChildMap[currentAccount.id] ?? [];
    const studentIds = classStudentMap[classId] ?? [];
    const enrolledChildrenIds = childrenIds.filter(childId => studentIds.includes(childId));
    return enrolledChildrenIds.map(childId => {
      const studentUser = users.find(u => u.id === childId);
      return studentUser?.name ?? childId;
    });
  };

  const pageTitle = isStudent
    ? "Lớp học & Lịch trình của tôi"
    : isParent
    ? "Theo dõi Học tập của Con"
    : "Quản lý Lớp & Lịch học";

  const pageSubtitle = isStudent
    ? "Xem thông tin chi tiết các lớp học bạn đang tham gia, lịch trình và giáo viên phụ trách."
    : isParent
    ? "Theo dõi danh sách lớp học, thời khóa biểu và thông tin các giáo viên giảng dạy cho con em."
    : "Điều phối danh sách lớp học, phân công giáo viên và tối ưu hóa lịch trình giảng dạy hàng tuần.";

  const statuses = ["Tất cả", "Đang diễn ra", "Sắp bắt đầu", "Đã kết thúc", "Đã lưu trữ"];

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
            {pageTitle}
          </motion.h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">
            {pageSubtitle}
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
          {canManageClasses && (
            <button
              onClick={() => {
                setClassToEdit(null);
                setIsModalOpen(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-xl hover:shadow-mint-200 hover:-translate-y-0.5 transition-all shadow-lg shadow-mint-100 whitespace-nowrap w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              Tạo lớp mới
            </button>
          )}
        </div>
      </div>

      {canManageClasses && (
        <CreateClassModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setClassToEdit(null);
          }}
          onSubmit={handleCreateOrUpdateClass}
          classToEdit={classToEdit}
        />
      )}

      <ManageScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        targetClass={selectedClass}
        onUpdate={updateClass}
      />

      {selectedStudentsClass && (
        <ManageStudentsModal
          isOpen={isStudentsModalOpen}
          onClose={() => setIsStudentsModalOpen(false)}
          classId={selectedStudentsClass.id}
          className={selectedStudentsClass.title}
        />
      )}

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
              className={`bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-500 cursor-pointer ${isStatActive(stat.label) ? `ring-2 ${colors.ring}` : ''}`}
              onClick={() => handleStatClick(stat.label)}
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
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Danh sách Lớp học hiện tại</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hiển thị {filteredClasses.length} kết quả</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-mint-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Lưới"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-mint-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Danh sách"
              >
                <List className="w-4 h-4" />
              </button>
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
        </div>

        <div className="p-8">
          {viewMode === 'list' ? (
            <div className="space-y-4">
              <div className="hidden lg:grid lg:grid-cols-[1.5fr_2fr_1.5fr_1.2fr_1fr_1fr_1.2fr_1.8fr] gap-4 px-8 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                <div>Mã & Tên Lớp</div>
                <div>Giáo viên</div>
                <div>Lịch học & Phòng</div>
                <div className="text-center">Sĩ số</div>
                <div className="text-center">Tỷ lệ nộp bài</div>
                <div className="text-center">Tỷ lệ chuyên cần</div>
                <div className="text-center">Trạng thái</div>
                <div className="text-right">Thao tác</div>
              </div>

              <PaginatedList<Class>
                items={filteredClasses}
                pageSize={10}
                mode="pagination"
                renderEmpty={() => (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
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
                renderItem={(cls, idx) => {
                  const { attendanceRate, submissionRate } = getClassStats(cls.id);
                  return (
                    <div
                      key={cls.id}
                      className="grid grid-cols-1 lg:grid-cols-[1.5fr_2fr_1.5fr_1.2fr_1fr_1fr_1.2fr_1.8fr] gap-4 px-8 py-5 items-center bg-white hover:bg-slate-50/50 rounded-3xl border border-slate-100/60 shadow-sm transition-all duration-300 group mb-3"
                    >
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-tight group-hover:text-mint-600 transition-colors uppercase tracking-tight">{cls.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{cls.id}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={`https://picsum.photos/seed/${cls.instructor}/100/100`}
                          className="w-8 h-8 rounded-full object-cover border border-slate-100"
                          alt="Instructor"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-xs font-black text-slate-800">{cls.instructor}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{cls.role}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {cls.schedule}
                        </p>
                        {cls.location && (
                          <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            {cls.location}
                          </p>
                        )}
                      </div>

                      <div className="text-center text-xs font-bold text-slate-700">
                        {cls.studentsCount}/{cls.maxStudents}
                      </div>

                      <div className="text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          submissionRate >= 80 ? 'bg-emerald-50 text-emerald-600' :
                          submissionRate >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {submissionRate}%
                        </span>
                      </div>

                      <div className="text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          attendanceRate >= 80 ? 'bg-mint-50 text-mint-600' :
                          attendanceRate >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {attendanceRate}%
                        </span>
                      </div>

                      <div className="text-center">
                        <StatusBadge
                          type="custom"
                          color={
                            cls.status === 'Đang diễn ra' ? 'mint' :
                            cls.status === 'Sắp bắt đầu' ? 'blue' :
                            cls.status === 'Đã kết thúc' ? 'slate' : 'rose'
                          }
                          label={cls.status}
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        {canManageClasses && cls.status === 'Đã kết thúc' && (
                          <button
                            onClick={() => handleArchiveClass(cls)}
                            title="Lưu trữ lớp học"
                            className="p-2 rounded-xl border border-slate-100 hover:border-slate-300 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95 shadow-sm bg-white/90"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <ActionColumn
                          actions={canManageClasses ? ['view', 'edit', 'delete'] : ['view']}
                          itemId={cls.id}
                          onAction={(type, id) => {
                            if (type === 'view') {
                              navigate('/attendance');
                            } else if (type === 'edit') {
                              handleEditClass(cls);
                            } else if (type === 'delete') {
                              handleDeleteClass(id);
                            }
                          }}
                        />
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          ) : (
            <PaginatedList<Class>
              items={filteredClasses}
              pageSize={6}
              mode="pagination"
              listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              renderEmpty={() => (
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
              renderItem={(cls, i) => {
                const { attendanceRate, submissionRate } = getClassStats(cls.id);
                const colors = getColorClasses(cls.color);
                return (
                  <div
                    key={cls.id}
                    className="group bg-slate-50/50 rounded-[32px] border border-slate-200/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden flex flex-col h-full"
                  >
                    <div className={`h-2.5 w-full ${colors.bg} absolute top-0 left-0`}></div>

                    <div className="p-7 flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <StatusBadge
                          type="custom"
                          color={
                            cls.status === 'Đang diễn ra' ? 'mint' :
                            cls.status === 'Sắp bắt đầu' ? 'blue' :
                            cls.status === 'Đã kết thúc' ? 'slate' : 'rose'
                          }
                          label={cls.status}
                        />

                        <div className="flex items-center gap-1.5">
                          {canManageClasses && cls.status === 'Đã kết thúc' && (
                            <button
                              onClick={() => handleArchiveClass(cls)}
                              title="Lưu trữ lớp học"
                              className="p-2 rounded-xl border border-slate-100 hover:border-slate-300 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95 shadow-sm bg-white/90"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <ActionColumn
                            actions={canManageClasses ? ['view', 'edit', 'delete'] : ['view']}
                            itemId={cls.id}
                            onAction={(type, id) => {
                              if (type === 'view') {
                                navigate('/attendance');
                              } else if (type === 'edit') {
                                handleEditClass(cls);
                              } else if (type === 'delete') {
                                handleDeleteClass(id);
                              }
                            }}
                          />
                        </div>
                      </div>

                      <h4 className="text-[22px] font-black text-slate-900 mb-1 leading-tight group-hover:text-mint-600 transition-colors">{cls.title}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Mã lớp: {cls.id}</p>

                      {isParent && (
                        <div className="mb-4 flex flex-wrap gap-1.5">
                          {getChildrenInClass(cls.id).map(name => (
                            <span key={name} className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-rose-500" />
                              Con học: {name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 p-4 bg-white/50 rounded-[20px] border border-slate-100 mb-4">
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

                      {/* Prominent Attendance & Submission Rates in Card View */}
                      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-100/20 rounded-[20px] border border-slate-100/50 mb-2">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Tỷ lệ nộp bài</p>
                          <p className="text-lg font-black text-slate-800">{submissionRate}%</p>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${submissionRate}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Tỷ lệ chuyên cần</p>
                          <p className="text-lg font-black text-slate-800">{attendanceRate}%</p>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-mint-500 h-full rounded-full" style={{ width: `${attendanceRate}%` }}></div>
                          </div>
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

                      {canManageClasses && (
                        <button
                          onClick={() => handleManageSchedule(cls)}
                          className={`w-full py-2.5 rounded-xl border-2 ${colors.border} ${colors.text} font-black text-[10px] uppercase tracking-widest ${colors.hoverBg} hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2 mt-2`}
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                          Thiết lập lịch
                        </button>
                      )}
                      {canManageClasses && (
                        <button
                          onClick={() => handleManageStudents(cls)}
                          className="w-full py-2.5 rounded-xl border-2 border-mint-100 text-mint-600 font-black text-[10px] uppercase tracking-widest hover:bg-mint-500 hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2"
                        >
                          <Users className="w-3.5 h-3.5" />
                          Quản lý học viên
                        </button>
                      )}

                      {(!canManageClasses) && (
                        <div className="pt-2 grid grid-cols-2 gap-3">
                          <button
                            onClick={() => navigate('/assignments')}
                            className={`py-2.5 rounded-xl border-2 ${colors.border} ${colors.text} font-black text-[10px] uppercase tracking-widest ${colors.hoverBg} hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-1.5`}
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                            Bài tập
                          </button>
                          <button
                            onClick={() => navigate('/materials')}
                            className="py-2.5 rounded-xl border-2 border-mint-100 text-mint-600 font-black text-[10px] uppercase tracking-widest hover:bg-mint-500 hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Tài liệu
                          </button>
                          <button
                            onClick={() => navigate('/attendance')}
                            className="col-span-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 hover:text-slate-800 transition-all flex items-center justify-center gap-1.5"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            Chi tiết điểm danh
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
