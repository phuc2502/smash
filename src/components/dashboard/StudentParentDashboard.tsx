import { School, CheckCircle2, Clock, CalendarDays, FileText, ArrowRight, UserPlus, FileEdit } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAppContext, ROLE_LABELS } from "../../context/AppContext";
import { getStudentIds, getEnrolledClassIds, calcAttendanceRate } from "./dashboardUtils";

export default function StudentParentDashboard() {
  const navigate = useNavigate();
  const { currentAccount, classes, assignments, attendanceSessions, classStudentMap, parentChildMap } = useAppContext();

  const isParent = currentAccount?.role === ROLE_LABELS.parent;
  const studentIds = getStudentIds(currentAccount, parentChildMap);
  const enrolledClassIds = getEnrolledClassIds(studentIds, classStudentMap);
  
  const enrolledClasses = classes.filter(cls => enrolledClassIds.includes(cls.id));
  const attendanceRate = calcAttendanceRate(studentIds, attendanceSessions);

  // Upcoming assignments: sort by deadlineAt
  const pendingAssignments = assignments
    .filter(a => enrolledClassIds.includes(a.classId) && a.status === 'Đang mở')
    .sort((a, b) => {
      const dateA = a.deadlineAt ? new Date(a.deadlineAt).getTime() : 0;
      const dateB = b.deadlineAt ? new Date(b.deadlineAt).getTime() : 0;
      return dateA - dateB;
    });

  const stats = [
    {
      label: "Lớp đang học",
      value: enrolledClasses.length.toLocaleString(),
      subtitle: "lớp học",
      color: "mint",
      icon: School,
    },
    {
      label: "Tỷ lệ chuyên cần",
      value: `${attendanceRate}%`,
      subtitle: "có mặt & đi trễ",
      color: "mint",
      icon: CheckCircle2,
    },
    {
      label: "Bài tập sắp hạn",
      value: pendingAssignments.length.toLocaleString(),
      subtitle: "cần hoàn thành",
      color: "rose",
      icon: Clock,
    },
  ] as const;

  const colorMap = {
    mint: { bg: 'bg-mint-500', bgLight: 'bg-mint-50', text: 'text-mint-600', textDark: 'text-mint-600' },
    rose: { bg: 'bg-rose-500', bgLight: 'bg-rose-50', text: 'text-rose-600', textDark: 'text-rose-600' },
  } as const;

  // Render empty state for parent without linked children
  if (isParent && studentIds.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[32px] border border-slate-100 shadow-sm text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
          <UserPlus className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Chưa liên kết học viên</h3>
        <p className="text-slate-500 font-medium max-w-md">
          Tài khoản phụ huynh của bạn chưa được liên kết với học viên nào. Vui lòng liên hệ trung tâm để được hỗ trợ.
        </p>
      </div>
    );
  }

  // Render empty state for student without classes
  if (enrolledClasses.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[32px] border border-slate-100 shadow-sm text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
          <School className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Chưa tham gia lớp học</h3>
        <p className="text-slate-500 font-medium max-w-md">
          {isParent 
            ? "Các học viên bạn quản lý hiện chưa tham gia lớp học nào."
            : "Bạn hiện chưa tham gia lớp học nào. Hãy đăng ký khóa học để bắt đầu hành trình cùng SMASH Math."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-black text-slate-900 tracking-tight"
          >
            Chào {currentAccount?.name},
          </motion.h2>
          <p className="text-slate-500 font-medium mt-2">
            Theo dõi tiến độ học tập và lịch học của {isParent ? "các con" : "bạn"} hôm nay.
          </p>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="w-full text-left bg-white/80 backdrop-blur-xl p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 hover:border-mint-200/60 transition-all duration-500"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-10 group-hover:scale-125 transition-transform duration-700 ${colorMap[stat.color].bg}`}></div>

            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${colorMap[stat.color].bgLight} ${colorMap[stat.color].text}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
            </div>

            <div className="space-y-1">
              <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs font-bold text-slate-400">{stat.subtitle}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lớp học của tôi & Lịch học */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-8">Lớp học của tôi</h3>
            <div className="space-y-4">
              {enrolledClasses.map(cls => (
                <div key={cls.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-[24px] bg-slate-50 border border-transparent hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 group cursor-pointer" onClick={() => navigate('/classes')}>
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-mint-500 shadow-sm">
                      <School className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 group-hover:text-mint-600 transition-colors">{cls.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">Giáo viên: {cls.instructor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:justify-end">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                      cls.status === 'Đang diễn ra' ? 'bg-mint-100 text-mint-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {cls.status}
                    </span>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-mint-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-8">Lịch học sắp tới</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enrolledClasses.map(cls => (
                <div key={`sched-${cls.id}`} className="p-4 rounded-[20px] bg-mint-50 border border-mint-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-mint-500 shadow-sm shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{cls.schedule}</p>
                    <p className="text-[10px] text-mint-600 font-bold uppercase tracking-widest mt-1 truncate">{cls.title}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">📍 {cls.location || 'Chưa xếp phòng'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bài tập sắp đến hạn */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Bài tập sắp đến hạn</h3>
            {pendingAssignments.length > 0 && (
              <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">{pendingAssignments.length} bài</span>
            )}
          </div>

          <div className="flex-1 space-y-4">
            {pendingAssignments.length > 0 ? pendingAssignments.map(task => {
              const isUrgent = task.isUrgent || (task.deadlineAt ? new Date(task.deadlineAt) < new Date(Date.now() + 86400000 * 3) : false); // 3 days

              return (
                <div key={task.id} className="flex items-start gap-4 p-4 rounded-[20px] bg-slate-50 border border-transparent hover:bg-white hover:shadow-md transition-all group cursor-pointer" onClick={() => navigate('/assignments')}>
                  <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUrgent ? 'bg-rose-100 text-rose-500' : 'bg-mint-100 text-mint-500'}`}>
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{task.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">{task.className}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-widest">
                      <span className={`flex items-center gap-1 ${isUrgent ? 'text-rose-500' : 'text-slate-400'}`}>
                        <Clock className="w-3 h-3" /> Hạn: {task.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-10 h-10 text-mint-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">Bạn đã hoàn thành tất cả bài tập được giao.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
