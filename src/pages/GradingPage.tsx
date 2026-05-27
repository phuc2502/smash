/**
 * GradingPage — Trang quản lý điểm số với 3 tab.
 * Feature: grading-and-feedback
 * Validates: Yêu cầu 2.1–2.6, 3.1–3.7, 8.1–8.5
 */

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  ChevronDown,
  Printer,
  BookOpen,
  BarChart3,
  MessageSquare,
  ClipboardList,
  Lock,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  useAppContext,
} from '../context/AppContext';
import PrintableGradeReport, { type GradeRow } from '../components/grading/PrintableGradeReport';

import GradeTableTab from '../components/grading/GradeTableTab';
import CommentTab from '../components/grading/CommentTab';
import EssayGradingTab from '../components/grading/EssayGradingTab';
import { calcAverage, classifyGrade } from '../utils/gradeUtils';

type TabKey = 'grades' | 'comments' | 'essay';

export default function GradingPage() {
  const [searchParams] = useSearchParams();
  const {
    classes,
    users,
    assignments,
    gradeEntries,
    studentComments,
    canAccess,
    currentAccount,
    addGradeEntry,
    updateGradeEntry,
    deleteGradeEntry,
    saveStudentComment,
    classStudentMap,
    parentChildMap,
    appendActivity,
    quizSubmissions,
    gradeEssaySubmission,
  } = useAppContext();

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabKey>('grades');
  const [adminStatTab, setAdminStatTab] = useState<'classes' | 'exams' | 'types'>('classes');

  const assignmentIdFromQuery = searchParams.get('assignmentId') ?? '';
  const targetAssignmentFromQuery = useMemo(
    () => (assignmentIdFromQuery ? assignments.find(a => a.id === assignmentIdFromQuery) : undefined),
    [assignmentIdFromQuery, assignments]
  );

  // Deep-link from "Chấm điểm ngay": auto-select class + open essay tab
  React.useEffect(() => {
    if (!assignmentIdFromQuery) return;
    if (!targetAssignmentFromQuery) return;
    // Set class and move to essay tab for grading
    setSelectedClassId(targetAssignmentFromQuery.classId);
    setActiveTab('essay');
  }, [assignmentIdFromQuery, targetAssignmentFromQuery]);

  // ── Permissions ──────────────────────────────────────────────
  const canGrade = canAccess('grade_assignments');
  const canViewOwn = canAccess('view_own_grades');
  const canExport = canAccess('export_grades');

  const isStudent = currentAccount?.role === 'Học viên';
  const isParent = currentAccount?.role === 'Phụ huynh';
  const isAdmin = currentAccount?.role === 'Admin';

  // Get parent's children info
  const parentChildIds = useMemo(() => {
    if (!currentAccount || currentAccount.role !== 'Phụ huynh') return [];
    return parentChildMap[currentAccount.id] ?? [];
  }, [parentChildMap, currentAccount]);

  const [selectedChildId, setSelectedChildId] = useState<string>('');

  React.useEffect(() => {
    if (isParent && parentChildIds.length > 0 && !parentChildIds.includes(selectedChildId)) {
      setSelectedChildId(parentChildIds[0]);
    }
  }, [isParent, parentChildIds, selectedChildId]);

  const parentChildren = useMemo(() => {
    return parentChildIds.map(id => users.find(u => u.id === id)).filter(Boolean) as typeof users;
  }, [parentChildIds, users]);

  const pendingEssaySubmissions = useMemo(() => {
    if (!canGrade) return [];
    return quizSubmissions.filter((submission) => {
      const assignment = assignments.find((a) => a.id === submission.assignmentId);
      if (!assignment?.questions) return false;
      return submission.score === undefined && assignment.questions.some((q) => q.type === 'essay');
    });
  }, [quizSubmissions, assignments, canGrade]);

  // Filter classes so teachers, students, and parents only see relevant classes
  const visibleClasses = useMemo(() => {
    if (!currentAccount) return [];
    if (currentAccount.role === 'Giáo viên') {
      return classes.filter(
        cls => cls.instructorId === currentAccount.id || cls.instructor.includes(currentAccount.name)
      );
    }
    if (currentAccount.role === 'Học viên') {
      return classes.filter(cls => {
        const studentIds = classStudentMap[cls.id] ?? [];
        return studentIds.includes(currentAccount.id);
      });
    }
    if (currentAccount.role === 'Phụ huynh') {
      if (!selectedChildId) return [];
      return classes.filter(cls => {
        const studentIds = classStudentMap[cls.id] ?? [];
        return studentIds.includes(selectedChildId);
      });
    }
    return classes;
  }, [classes, currentAccount, classStudentMap, selectedChildId]);

  // ── Admin Statistics Calculations ────────────────────────────
  const adminClassStats = useMemo(() => {
    return classes.map(cls => {
      const entries = gradeEntries.filter(e => e.classId === cls.id);
      const scores = entries.map(e => e.score);
      const avg = scores.length > 0 ? calcAverage(scores) : null;
      const classStudents = classStudentMap[cls.id] ?? [];
      return {
        ...cls,
        average: avg,
        studentsCount: classStudents.length
      };
    });
  }, [classes, gradeEntries, classStudentMap]);

  const adminExamStats = useMemo(() => {
    const grouped: Record<string, { title: string; classId: string; scores: number[] }> = {};
    gradeEntries.forEach(e => {
      if (!grouped[e.title]) {
        grouped[e.title] = { title: e.title, classId: e.classId, scores: [] };
      }
      grouped[e.title].scores.push(e.score);
    });
    return Object.values(grouped).map(item => {
      const cls = classes.find(c => c.id === item.classId);
      return {
        title: item.title,
        className: cls?.title ?? 'Lớp học khác',
        average: calcAverage(item.scores),
        count: item.scores.length
      };
    });
  }, [gradeEntries, classes]);

  const adminTypeStats = useMemo(() => {
    const defaultLabels: Record<string, string> = {
      oral: 'Kiểm tra miệng',
      quiz_15: '15 phút',
      quiz_45: '1 tiết',
      homework: 'BTVN',
      midterm: 'Giữa kỳ',
      final: 'Cuối kỳ',
      assignment: 'Bài tập',
    };
    const grouped: Record<string, number[]> = {};
    gradeEntries.forEach(e => {
      const typeKey = e.scoreType || 'assignment';
      if (!grouped[typeKey]) grouped[typeKey] = [];
      grouped[typeKey].push(e.score);
    });
    return Object.entries(defaultLabels).map(([key, label]) => {
      const scores = grouped[key] ?? [];
      return {
        type: key,
        label,
        average: scores.length > 0 ? calcAverage(scores) : null,
        count: scores.length
      };
    });
  }, [gradeEntries]);

  // No access at all
  if (!canGrade && !canViewOwn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Không có quyền truy cập</h2>
        <p className="text-slate-500 text-sm">Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  // ── Selected class data ──────────────────────────────────────
  const selectedClass = classes.find(c => c.id === selectedClassId);

  // Get student IDs for the selected class
  const allStudentIdsInClass = classStudentMap[selectedClassId] ?? [];

  // Filter by role: student sees only themselves, parent sees their children
  const visibleStudentIds = useMemo(() => {
    if (!selectedClassId) return [];
    if (isStudent && currentAccount) {
      return allStudentIdsInClass.filter(id => id === currentAccount.id);
    }
    if (isParent && currentAccount) {
      return allStudentIdsInClass.filter(id => id === selectedChildId);
    }
    return allStudentIdsInClass;
  }, [selectedClassId, isStudent, isParent, currentAccount, allStudentIdsInClass, selectedChildId]);

  // Resolve student User objects
  const students = useMemo(
    () => visibleStudentIds.map(id => users.find(u => u.id === id)).filter(Boolean) as typeof users,
    [visibleStudentIds, users]
  );

  // Filter gradeEntries for selected class (and visible students)
  const classGradeEntries = useMemo(
    () =>
      gradeEntries.filter(
        e => e.classId === selectedClassId && visibleStudentIds.includes(e.studentId)
      ),
    [gradeEntries, selectedClassId, visibleStudentIds]
  );

  // Filter studentComments for selected class (and visible students)
  const classComments = useMemo(
    () =>
      studentComments.filter(
        c => c.classId === selectedClassId && visibleStudentIds.includes(c.studentId)
      ),
    [studentComments, selectedClassId, visibleStudentIds]
  );


  // ── Tab visibility ───────────────────────────────────────────
  // Grades tab always visible (read-only for students/parents)

  // ── PrintableGradeReport data ────────────────────────────────
  const gradeRows: GradeRow[] = useMemo(() => {
    return students.map(student => {
      const entries = classGradeEntries.filter(e => e.studentId === student.id);
      const scores = entries.map(e => ({ title: e.title, score: e.score }));
      const average = calcAverage(entries.map(e => e.score));
      return {
        studentId: student.id,
        studentName: student.name,
        scores,
        average,
        classification: classifyGrade(average),
      };
    });
  }, [students, classGradeEntries]);

  const exportedAt = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // ── Tab config ───────────────────────────────────────────────
  const tabs: { key: TabKey; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: 'grades' as TabKey, label: 'Bảng điểm', icon: BarChart3 },
    ...(canGrade ? [{ key: 'essay' as TabKey, label: 'Chấm tự luận', icon: ClipboardList, badge: pendingEssaySubmissions.length }] : []),
    ...((isStudent || isParent || isAdmin)
      ? [{ key: 'comments' as TabKey, label: 'Nhận xét', icon: MessageSquare }]
      : []),
  ];

  return (
    <div className="space-y-8 pb-10 pt-4">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-slate-900 tracking-tight"
          >
            Quản lý Điểm số
          </motion.h1>
          <p className="text-slate-500 mt-1 text-sm">
            {isAdmin 
              ? 'Thống kê tổng quan và theo dõi kết quả học tập hệ thống.' 
              : canGrade 
                ? 'Chấm điểm, nhập điểm thành phần và viết nhận xét học viên.' 
                : 'Xem điểm số của bạn.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canExport && selectedClassId && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-3 bg-white text-slate-800 rounded-full font-bold text-sm hover:bg-slate-50 transition-all shadow-sm border border-slate-200"
            >
              <Printer className="w-5 h-5" />
              Xuất PDF / In bảng điểm
            </button>
          )}
        </div>
      </div>

      {/* ── Parent Child Switcher ── */}
      {isParent && parentChildren.length > 0 && (
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mint-50 text-mint-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm">Chọn con em học viên:</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {parentChildren.map(child => {
              const active = selectedChildId === child.id;
              return (
                <button
                  key={child.id}
                  onClick={() => {
                    setSelectedChildId(child.id);
                    setSelectedClassId(''); // Reset selected class to prompt user to choose child's class
                    setActiveTab('grades');
                  }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                    active
                      ? 'border-mint-500 bg-mint-50/50 shadow-md shadow-mint-100'
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                    active ? 'bg-mint-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {child.name.split(' ').pop()?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{child.name}</h4>
                    <p className="text-slate-400 text-xs font-semibold mt-0.5">Mã HV: {child.id}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Class selector ── */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-mint-50 text-mint-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm">Chọn lớp học:</span>
          </div>
          <div className="relative w-full sm:w-80">
            <select
              value={selectedClassId}
              onChange={e => {
                setSelectedClassId(e.target.value);
                setActiveTab('grades');
              }}
              className="w-full appearance-none border-2 border-slate-200 rounded-2xl px-4 py-3 pr-10 text-sm font-semibold text-slate-900 outline-none focus:border-mint-400 focus:ring-4 focus:ring-mint-100 transition-all bg-white cursor-pointer"
            >
              <option value="">-- {isAdmin ? 'Tất cả lớp học (Xem Dashboard)' : 'Chọn lớp học'} --</option>
              {visibleClasses.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.title} ({cls.id})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {selectedClass && (
            <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <Users className="w-4 h-4 text-mint-500" />
              <span>Sĩ số: {students.length} học viên</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Admin Statistics Dashboard ── */}
      {isAdmin && !selectedClassId && (
        <div className="space-y-6">
          {/* Dashboard Tabs */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex gap-2">
            {[
              { key: 'classes', label: 'Thống kê theo Lớp học', icon: GraduationCap },
              { key: 'exams', label: 'Thống kê theo Bài tập', icon: BookOpen },
              { key: 'types', label: 'Thống kê theo Loại kiểm tra', icon: BarChart3 },
            ].map(tab => {
              const Icon = tab.icon;
              const active = adminStatTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setAdminStatTab(tab.key as any)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                    active 
                      ? 'bg-mint-500 text-white shadow-md shadow-mint-100' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Class stats */}
          {adminStatTab === 'classes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminClassStats.map(cls => {
                const colorClass = cls.average === null ? 'bg-slate-100 text-slate-500' :
                                   cls.average >= 8.0 ? 'bg-emerald-500 text-white' :
                                   cls.average >= 6.5 ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white';
                return (
                  <motion.div
                    key={cls.id}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-[28px] border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                          {cls.id}
                        </span>
                        <div className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 ${colorClass}`}>
                          <span>ĐTB:</span>
                          <span className="text-sm font-black tabular-nums">
                            {cls.average !== null ? cls.average.toFixed(1) : '—'}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mb-1 leading-snug">{cls.title}</h3>
                      <p className="text-slate-400 text-xs font-semibold mb-4">Giảng dạy: {cls.instructor}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-mint-500" />
                        Sĩ số: {cls.studentsCount} học viên
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Đang diễn ra
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Exam stats */}
          {adminStatTab === 'exams' && (
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-wider">Tên bài kiểm tra / Đợt kiểm tra</th>
                      <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-wider">Lớp học</th>
                      <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-wider text-center">Số bài đã nộp</th>
                      <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-wider text-center">Điểm trung bình</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminExamStats.map((exam, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-4 font-bold text-slate-900">{exam.title}</td>
                        <td className="px-6 py-4 text-slate-500 font-semibold text-sm">{exam.className}</td>
                        <td className="px-6 py-4 text-center tabular-nums text-slate-700 font-bold">{exam.count}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1.5 rounded-xl bg-mint-50 text-mint-700 font-black text-sm tabular-nums">
                            {exam.average !== null ? exam.average.toFixed(1) : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {adminExamStats.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-semibold">
                          Chưa có dữ liệu bài kiểm tra nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Type stats */}
          {adminStatTab === 'types' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminTypeStats.map((item, i) => (
                <div key={i} className="bg-white rounded-[28px] border border-slate-200 p-6 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-800 font-black text-base">{item.label}</h4>
                    <p className="text-slate-400 text-xs font-bold mt-1">Đã nhập: {item.count} đầu điểm</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-mint-600 block tabular-nums">
                      {item.average !== null ? item.average.toFixed(1) : '—'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Điểm TB</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── No class selected (not Admin) ── */}
      {!isAdmin && !selectedClassId && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <GraduationCap className="w-16 h-16 mb-4 text-slate-200" />
          <p className="text-lg font-bold text-slate-500">Chưa chọn lớp học</p>
          <p className="text-sm mt-1">Vui lòng chọn một lớp học từ danh sách trên để xem dữ liệu.</p>
        </div>
      )}

      {/* ── Main content (class selected) ── */}
      {selectedClassId && (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          {/* Tab navigation */}
          <div className="border-b border-slate-100 px-6 pt-6">
            <div className="flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-sm transition-all relative ${
                    activeTab === tab.key
                      ? 'bg-mint-50 text-mint-700 border-b-2 border-mint-500'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'essay' && (
              <EssayGradingTab
                classId={selectedClassId}
                submissions={pendingEssaySubmissions}
                assignments={assignments}
                users={users}
                onGrade={gradeEssaySubmission}
                initialAssignmentId={assignmentIdFromQuery || undefined}
              />
            )}

            {activeTab === 'grades' && (
              <GradeTableTab
                classId={selectedClassId}
                students={students}
                gradeEntries={classGradeEntries}
                readOnly={!canGrade}
                onAdd={(entry) => {
                  addGradeEntry(entry);
                  const student = students.find(s => s.id === entry.studentId);
                  appendActivity(
                    `Nhập điểm cho ${student?.name ?? entry.studentId}`,
                    `${entry.title} — ${entry.score}/${entry.maxScore} điểm`,
                    'mint'
                  );
                }}
                onUpdate={updateGradeEntry}
                onDelete={deleteGradeEntry}
              />
            )}

            {activeTab === 'comments' && (
              <CommentTab
                classId={selectedClassId}
                students={students}
                comments={classComments}
                readOnly={!canGrade}
                teacherId={currentAccount?.id ?? 'TCH-109'}
                onSave={(comment) => {
                  saveStudentComment(comment);
                  const student = students.find(s => s.id === comment.studentId);
                  appendActivity(
                    `Nhận xét học viên ${student?.name ?? comment.studentId}`,
                    comment.content.substring(0, 60) + (comment.content.length > 60 ? '...' : ''),
                    'mint'
                  );
                }}
              />
            )}

          </div>
        </div>
      )}

      {/* PrintableGradeReport — chỉ hiển thị khi in */}
      <div className="hidden print:block">
        <PrintableGradeReport
          className={selectedClass?.title ?? 'Lớp học'}
          instructor={selectedClass?.instructor ?? currentAccount?.name ?? 'Giáo viên'}
          exportedAt={exportedAt}
          students={gradeRows}
        />
      </div>
    </div>
  );
}

