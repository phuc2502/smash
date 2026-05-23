import { School, Users, CheckCircle2, AlertCircle, Plus, FileText, ClipboardCheck, ArrowRight, CalendarDays, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { normalizeInstructorName } from "./dashboardUtils";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { currentAccount, classes, assignments } = useAppContext();

  // Filter my classes — ưu tiên instructorId, fallback về tên
  const myClasses = classes.filter(cls => {
    if (cls.instructorId && currentAccount?.id) {
      return cls.instructorId === currentAccount.id;
    }
    // Fallback: so sánh tên (bỏ tiền tố Thầy/Cô)
    return normalizeInstructorName(cls.instructor) === normalizeInstructorName(currentAccount?.name || '');
  });

  const myStudentCount = myClasses.reduce((sum, cls) => sum + cls.studentsCount, 0);

  const myPendingGrading = assignments.filter(a => 
    a.status === 'Chờ chấm điểm' && myClasses.some(cls => cls.id === a.classId)
  );

  const stats = [
    {
      label: "Lớp đang phụ trách",
      value: myClasses.length.toLocaleString(),
      subtitle: "lớp học",
      color: "mint",
      icon: School,
      to: "/classes",
    },
    {
      label: "Học viên quản lý",
      value: myStudentCount.toLocaleString(),
      subtitle: "học viên",
      color: "mint",
      icon: Users,
      to: "/users?role=Học viên",
    },
    {
      label: "Bài tập chờ chấm",
      value: myPendingGrading.length.toLocaleString(),
      subtitle: "cần xử lý",
      color: "rose",
      icon: CheckCircle2,
      to: "/grading",
    },
  ] as const;

  const colorMap = {
    mint: { bg: 'bg-mint-500', bgLight: 'bg-mint-50', text: 'text-mint-600', textDark: 'text-mint-600' },
    rose: { bg: 'bg-rose-500', bgLight: 'bg-rose-50', text: 'text-rose-600', textDark: 'text-rose-600' },
  } as const;

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
            Chúc bạn một ngày giảng dạy hiệu quả.
          </p>
        </div>
      </div>

      {myClasses.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[32px] border border-slate-100 shadow-sm text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
            <School className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Chưa phân công lớp</h3>
          <p className="text-slate-500 font-medium max-w-md">
            Bạn chưa được phân công phụ trách lớp học nào. Vui lòng liên hệ với Quản lý trung tâm để được xếp lớp.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <motion.button
                key={stat.label}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(stat.to)}
                className="w-full text-left bg-white/80 backdrop-blur-xl p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 hover:border-mint-200/60 hover:-translate-y-0.5 transition-all duration-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40"
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
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto opacity-0 group-hover:opacity-100 group-hover:text-mint-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lớp học của tôi */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Lớp học của tôi</h3>
                <button onClick={() => navigate('/classes')} className="text-xs font-bold text-mint-600 uppercase tracking-widest hover:text-mint-700 transition-colors">Xem tất cả</button>
              </div>

              <div className="flex-1 space-y-4">
                {myClasses.map((cls, i) => (
                  <div key={cls.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-[24px] bg-slate-50 border border-transparent hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 group">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-mint-500 shadow-sm">
                        <School className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900 group-hover:text-mint-600 transition-colors">{cls.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                          <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {cls.schedule}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:justify-end">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sĩ số</p>
                        <p className="text-sm font-black text-slate-900">{cls.studentsCount}/{cls.maxStudents}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                        cls.status === 'Đang diễn ra' ? 'bg-mint-100 text-mint-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {cls.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {/* Hành động nhanh */}
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Hành động nhanh</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => navigate('/attendance')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-slate-100 hover:text-mint-600 transition-all group">
                    <ClipboardCheck className="w-6 h-6 text-slate-400 group-hover:text-mint-500 mb-2 transition-colors" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">Điểm danh</span>
                  </button>
                  <button onClick={() => navigate('/assignments')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-slate-100 hover:text-mint-600 transition-all group">
                    <Plus className="w-6 h-6 text-slate-400 group-hover:text-mint-500 mb-2 transition-colors" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">Tạo bài tập</span>
                  </button>
                  <button onClick={() => navigate('/materials')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-slate-100 hover:text-mint-600 transition-all group">
                    <FileText className="w-6 h-6 text-slate-400 group-hover:text-mint-500 mb-2 transition-colors" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">Tài liệu</span>
                  </button>
                </div>
              </div>

              {/* Bài tập cần chấm */}
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Bài tập cần chấm</h3>
                  {myPendingGrading.length > 0 && (
                    <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">{myPendingGrading.length} bài</span>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  {myPendingGrading.length > 0 ? myPendingGrading.map(task => {
                    const isOverdue = task.deadlineAt ? new Date(task.deadlineAt) < new Date() : false;
                    const showUrgent = task.isUrgent || isOverdue;

                    return (
                      <div key={task.id} className="flex items-start gap-4 p-4 rounded-[20px] bg-slate-50 border border-transparent hover:bg-white hover:shadow-md transition-all group cursor-pointer" onClick={() => navigate('/grading')}>
                        <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${showUrgent ? 'bg-rose-500 animate-pulse' : 'bg-mint-500'}`}></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{task.title}</h4>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{task.className}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-mint-600 bg-mint-50 px-2 py-0.5 rounded-full">Tiến độ: {task.progress}/{task.total}</span>
                            <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" /> {task.deadline}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-6">
                      <CheckCircle2 className="w-10 h-10 text-mint-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 font-medium">Tuyệt vời! Bạn không có bài tập nào cần chấm.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
