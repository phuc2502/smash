import React, { useState, useMemo } from "react";
import {
  CalendarDays, ClipboardCheck, AlertCircle, CheckCircle2, XCircle, PlusCircle,
  Clock, Search, UserCheck, Inbox, ArrowRight, User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext, LeaveRequest, ROLE_LABELS } from "../context/AppContext";

export default function LeaveRequestsPage() {
  const {
    currentAccount,
    leaveRequests,
    submitLeaveRequest,
    resolveLeaveRequest,
    classes,
    users,
    classStudentMap,
    parentChildMap,
  } = useAppContext();

  // Role identification
  const isStudent = currentAccount?.role === ROLE_LABELS.student;
  const isParent = currentAccount?.role === ROLE_LABELS.parent;
  const isTeacher = currentAccount?.role === ROLE_LABELS.teacher;
  const isAdmin = currentAccount?.role === ROLE_LABELS.admin;

  // Retrieve students associated with this parent
  const parentChildIds = isParent && currentAccount ? (parentChildMap[currentAccount.id] ?? []) : [];
  const parentChildren = useMemo(() => {
    return users.filter(u => parentChildIds.includes(u.id));
  }, [users, parentChildIds]);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState(() => {
    if (isStudent && currentAccount) return currentAccount.id;
    if (isParent && parentChildren.length > 0) return parentChildren[0].id;
    return "";
  });
  const [selectedClassId, setSelectedClassId] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Determine active classes for the chosen student
  const studentActiveClasses = useMemo(() => {
    if (!selectedStudentId) return [];
    return classes.filter(c => {
      const enrolledStudentIds = classStudentMap[c.id] ?? [];
      return enrolledStudentIds.includes(selectedStudentId);
    });
  }, [classes, classStudentMap, selectedStudentId]);

  // Filter leave requests based on user role and filters
  const filteredLeaveRequests = useMemo(() => {
    let list = [...leaveRequests];

    // Filter by role
    if (isStudent && currentAccount) {
      list = list.filter(r => r.studentId === currentAccount.id);
    } else if (isParent) {
      list = list.filter(r => parentChildIds.includes(r.studentId));
    } else if (isTeacher && currentAccount) {
      // Teacher can only see requests for classes they teach
      const teacherClassIds = classes.filter(c => c.instructorId === currentAccount.id || c.instructor === currentAccount.name).map(c => c.id);
      list = list.filter(r => teacherClassIds.includes(r.classId));
    } // Admin sees everything

    // Filter by status tab
    if (statusFilter !== "all") {
      list = list.filter(r => r.status === statusFilter);
    }

    // Filter by search query (student name or class name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r =>
        r.studentName.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    }

    // Sort by submittedAt descending
    return list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [leaveRequests, currentAccount, isStudent, isParent, isTeacher, isAdmin, classes, parentChildIds, statusFilter, searchQuery]);

  // Handle leave request submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!selectedStudentId) {
      setFormError("Vui lòng chọn học viên.");
      return;
    }
    if (!selectedClassId) {
      setFormError("Vui lòng chọn lớp học.");
      return;
    }
    if (!leaveDate) {
      setFormError("Vui lòng chọn ngày nghỉ học.");
      return;
    }
    if (!leaveReason.trim()) {
      setFormError("Vui lòng nhập lý do nghỉ học.");
      return;
    }

    const studentObj = users.find(u => u.id === selectedStudentId);
    const classObj = classes.find(c => c.id === selectedClassId);

    if (!studentObj || !classObj) {
      setFormError("Thông tin dữ liệu không hợp lệ.");
      return;
    }

    submitLeaveRequest({
      studentId: selectedStudentId,
      studentName: studentObj.name,
      classId: selectedClassId,
      className: classObj.title,
      date: leaveDate,
      reason: leaveReason.trim(),
    });

    setFormSuccess("Đơn yêu cầu nghỉ phép của bạn đã được gửi thành công!");
    setLeaveReason("");
    setLeaveDate("");
    setSelectedClassId("");

    // Clear success message after 4s
    setTimeout(() => setFormSuccess(""), 4000);
  };

  // Handle moderation approval/rejection
  const handleResolve = (requestId: string, status: "approved" | "rejected") => {
    if (!currentAccount) return;
    resolveLeaveRequest(requestId, status, currentAccount.name);
  };

  const getStatusBadge = (status: LeaveRequest["status"]) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-mint-100 text-mint-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-rose-100 text-rose-700 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Từ chối
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-700 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Chờ duyệt
          </span>
        );
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black text-slate-900 tracking-tight"
        >
          Yêu cầu nghỉ phép
        </motion.h1>
        <p className="text-slate-500 font-medium mt-2 max-w-2xl">
          {isStudent || isParent
            ? "Gửi đơn xin nghỉ phép đến ban quản trị trung tâm và theo dõi trạng thái xử lý."
            : "Xem, theo dõi và phê duyệt đơn xin nghỉ học từ học viên."}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left Side: Submit Request (For Students/Parents) */}
        {(isStudent || isParent) && (
          <div className="xl:col-span-1 bg-white/80 backdrop-blur-xl p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Gửi đơn mới</h3>
            </div>

            {formError && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-4 bg-mint-50 border border-mint-100 rounded-2xl text-xs font-bold text-mint-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-mint-500 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isParent && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chọn học sinh</label>
                  <select
                    value={selectedStudentId}
                    onChange={e => {
                      setSelectedStudentId(e.target.value);
                      setSelectedClassId("");
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50"
                  >
                    <option value="">-- Chọn con em --</option>
                    {parentChildren.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chọn lớp học</label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50"
                  disabled={!selectedStudentId}
                >
                  <option value="">-- Chọn lớp học xin nghỉ --</option>
                  {studentActiveClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.id})</option>
                  ))}
                </select>
                {!selectedStudentId && (
                  <p className="text-[10px] text-slate-400 font-bold">Vui lòng chọn học sinh trước.</p>
                )}
                {selectedStudentId && studentActiveClasses.length === 0 && (
                  <p className="text-[10px] text-rose-500 font-bold">Học viên này chưa tham gia lớp học nào.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ngày xin nghỉ</label>
                <input
                  type="date"
                  value={leaveDate}
                  onChange={e => setLeaveDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lý do nghỉ phép</label>
                <textarea
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  rows={4}
                  placeholder="Vui lòng nêu lý do nghỉ học cụ thể (ví dụ: bị ốm, có việc gia đình đột xuất...)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full font-bold text-sm hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-100"
              >
                Gửi yêu cầu nghỉ phép
              </button>
            </form>
          </div>
        )}

        {/* Right Side: Requests Dashboard / List */}
        <div className={`bg-white/80 backdrop-blur-xl p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6 ${
          isStudent || isParent ? "xl:col-span-2" : "xl:col-span-3"
        }`}>
          {/* Filters & Actions Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-5.5 h-5.5 text-mint-600" />
              Lịch sử đơn nghỉ phép
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative group w-full md:w-60">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-mint-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm học sinh, lớp học..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full font-bold text-xs outline-none focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Status Tab Bar */}
          <div className="flex gap-2 border-b border-slate-100 pb-4 overflow-x-auto">
            {(["all", "pending", "approved", "rejected"] as const).map(f => {
              const count = leaveRequests.filter(r => {
                const baseFilter = f === "all" ? true : r.status === f;
                if (isStudent && currentAccount) {
                  return baseFilter && r.studentId === currentAccount.id;
                }
                if (isParent) {
                  return baseFilter && parentChildIds.includes(r.studentId);
                }
                if (isTeacher && currentAccount) {
                  const teacherClassIds = classes.filter(c => c.instructorId === currentAccount.id || c.instructor === currentAccount.name).map(c => c.id);
                  return baseFilter && teacherClassIds.includes(r.classId);
                }
                return baseFilter;
              }).length;

              const label = f === "all" ? "Tất cả" : f === "pending" ? "Chờ duyệt" : f === "approved" ? "Đã duyệt" : "Từ chối";

              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
                    statusFilter === f
                      ? "bg-mint-600 text-white shadow-lg shadow-mint-100"
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                    statusFilter === f ? "bg-white/30 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Requests Content */}
          <AnimatePresence mode="wait">
            {filteredLeaveRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Inbox className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Không tìm thấy yêu cầu nào</h4>
                  <p className="text-xs text-slate-400 font-medium">Hệ thống chưa ghi nhận đơn nghỉ phép nào trùng khớp với bộ lọc.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {filteredLeaveRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    layout
                    className="bg-slate-50/50 rounded-[24px] border border-slate-100/80 p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="space-y-3 flex-1">
                      {/* Top Info */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {request.studentName}
                          <span className="text-[9px] font-bold text-slate-400 uppercase">({request.studentId})</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100/60 px-2.5 py-1 rounded-lg">
                          <span>Lớp: {request.className}</span>
                        </div>
                      </div>

                      {/* Date details */}
                      <div className="flex items-center gap-1.5 text-sm font-black text-slate-950">
                        <CalendarDays className="w-4 h-4 text-mint-600" />
                        <span>Nghỉ ngày: {new Date(request.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      </div>

                      {/* Reason */}
                      <div className="text-xs text-slate-600 leading-relaxed font-medium bg-white/70 p-3 rounded-xl border border-slate-100/50">
                        <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mb-1">Lý do nghỉ phép</p>
                        {request.reason}
                      </div>

                      {/* Submitted detail */}
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Gửi lúc: {new Date(request.submittedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      {/* Resolved details */}
                      {request.resolvedBy && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
                          <UserCheck className="w-3.5 h-3.5 text-mint-600" />
                          <span>Duyệt bởi {request.resolvedBy} vào {new Date(request.resolvedAt || "").toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}
                    </div>

                    {/* Moderation Actions / Status Badge */}
                    <div className="flex flex-col items-start md:items-end justify-between self-stretch shrink-0">
                      <div>{getStatusBadge(request.status)}</div>

                      {/* Admin & Teacher Decision Actions */}
                      {(isAdmin || isTeacher) && request.status === "pending" && (
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                          <button
                            onClick={() => handleResolve(request.id, "approved")}
                            className="px-4 py-2 bg-mint-600 hover:bg-mint-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md shadow-mint-100 transition-all hover:scale-105 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Phê duyệt
                          </button>
                          <button
                            onClick={() => handleResolve(request.id, "rejected")}
                            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md shadow-rose-100 transition-all hover:scale-105 flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Từ chối
                          </button>
                        </div>
                      )}

                      {/* Sync Message for Approved Attendance */}
                      {request.status === "approved" && (
                        <div className="hidden md:flex items-center gap-1 text-[10px] font-bold text-mint-600 uppercase tracking-widest mt-2">
                          <span>Đồng bộ điểm danh vắng có phép</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
