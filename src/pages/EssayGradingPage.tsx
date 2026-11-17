import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, CheckCircle2, Clock3, FileText, Image as ImageIcon, MessageSquare, Paperclip, UserRound } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const QUICK_COMMENTS = [
  'Trình bày rõ ràng',
  'Cần giải thích chi tiết hơn các bước biến đổi',
  'Sai kết quả cuối cùng',
  'Thiếu đơn vị tính',
  'Lập luận toán học xuất sắc!',
  'Rất tốt, phát huy nhé',
];

function isValidScore(value: string) {
  if (!value.trim()) return false;
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 10;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Không rõ thời gian' : date.toLocaleString('vi-VN');
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EssayGradingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAssignmentId = searchParams.get('assignmentId') ?? '';
  const {
    assignments,
    classes,
    quizSubmissions,
    users,
    currentAccount,
    canAccess,
    gradeEssaySubmission,
  } = useAppContext();

  const isTeacher = currentAccount?.role === 'Giáo viên';
  const canGrade = canAccess('grade_assignments');
  const teacherClasses = useMemo(() => {
    if (!currentAccount) return [];
    if (!isTeacher) return canGrade ? classes : [];
    return classes.filter(cls =>
      cls.instructorId === currentAccount.id || cls.instructor.includes(currentAccount.name)
    );
  }, [classes, currentAccount, isTeacher, canGrade]);
  const teacherClassIds = useMemo(() => new Set(teacherClasses.map(cls => cls.id)), [teacherClasses]);

  const pendingSubmissions = useMemo(() => quizSubmissions
    .filter(submission => {
      if (submission.score !== undefined || !teacherClassIds.has(assignments.find(a => a.id === submission.assignmentId)?.classId ?? '')) return false;
      const assignment = assignments.find(item => item.id === submission.assignmentId);
      return assignment?.type === 'Tự luận' && assignment.questions?.some(question => question.type === 'essay');
    })
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()),
  [quizSubmissions, assignments, teacherClassIds]);

  const [classFilter, setClassFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [comment, setComment] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (initialAssignmentId) setAssignmentFilter(initialAssignmentId);
  }, [initialAssignmentId]);

  const filteredSubmissions = useMemo(() => pendingSubmissions.filter(submission => {
    const assignment = assignments.find(item => item.id === submission.assignmentId);
    return (classFilter === 'all' || assignment?.classId === classFilter)
      && (assignmentFilter === 'all' || submission.assignmentId === assignmentFilter);
  }), [pendingSubmissions, assignments, classFilter, assignmentFilter]);

  useEffect(() => {
    if (activeSubmissionId && filteredSubmissions.some(item => item.id === activeSubmissionId)) return;
    setActiveSubmissionId(filteredSubmissions[0]?.id ?? null);
  }, [activeSubmissionId, filteredSubmissions]);

  useEffect(() => {
    setScoreInput('');
    setComment('');
  }, [activeSubmissionId]);

  const activeSubmission = filteredSubmissions.find(item => item.id === activeSubmissionId);
  const activeAssignment = activeSubmission
    ? assignments.find(item => item.id === activeSubmission.assignmentId)
    : undefined;
  const activeStudent = activeSubmission
    ? users.find(user => user.id === activeSubmission.studentId)
    : undefined;
  const scoreIsInvalid = scoreInput !== '' && !isValidScore(scoreInput);
  const saveDisabled = !isValidScore(scoreInput) || !activeSubmission;

  const appendQuickComment = (text: string) => {
    setComment(current => current.trim() ? `${current.trim()}; ${text}` : text);
  };

  const saveGrade = () => {
    if (!activeSubmission || !isValidScore(scoreInput)) return;
    const currentIndex = filteredSubmissions.findIndex(item => item.id === activeSubmission.id);
    const nextSubmission = filteredSubmissions[currentIndex + 1];
    gradeEssaySubmission(activeSubmission.id, Number(scoreInput), comment.trim() || undefined);
    setSuccessMessage('Đã chấm điểm thành công!');
    setActiveSubmissionId(nextSubmission?.id ?? null);
  };

  const assignmentsInQueue = useMemo(() => {
    const ids = new Set(pendingSubmissions.map(item => item.assignmentId));
    return assignments.filter(item => ids.has(item.id));
  }, [pendingSubmissions, assignments]);

  const submissionAttachments = activeSubmission?.attachments ?? [];

  if (!canGrade) {
    return <div className="mx-auto max-w-3xl rounded-3xl border border-rose-100 bg-white p-10 text-center">
      <h1 className="text-xl font-black text-slate-900">Bạn không có quyền chấm bài</h1>
      <p className="mt-2 text-sm text-slate-500">Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.</p>
    </div>;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 pb-12 pt-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button type="button" onClick={() => navigate('/assignments')} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-mint-700">
            <ArrowLeft className="h-4 w-4" /> Quay lại bài tập
          </button>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Chấm tự luận</h1>
          <p className="mt-1 text-sm text-slate-500">Bài tự luận chờ chấm từ tất cả lớp của bạn</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {pendingSubmissions.length} bài đang chờ chấm
        </div>
      </header>

      {successMessage && (
        <div role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          <CheckCircle2 className="h-5 w-5" /> {successMessage}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-3 border-b border-slate-100 p-4">
            <label className="block text-xs font-black uppercase tracking-wide text-slate-500" htmlFor="grading-class-filter">Lọc theo lớp</label>
            <select id="grading-class-filter" value={classFilter} onChange={event => setClassFilter(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-mint-500">
              <option value="all">Tất cả lớp của tôi</option>
              {teacherClasses.map(cls => <option key={cls.id} value={cls.id}>{cls.title}</option>)}
            </select>
            <label className="block text-xs font-black uppercase tracking-wide text-slate-500" htmlFor="grading-assignment-filter">Lọc theo bài tập</label>
            <select id="grading-assignment-filter" value={assignmentFilter} onChange={event => setAssignmentFilter(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-mint-500">
              <option value="all">Tất cả bài tập ({pendingSubmissions.length})</option>
              {assignmentsInQueue.map(assignment => <option key={assignment.id} value={assignment.id}>{assignment.title}</option>)}
            </select>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-2">
            {filteredSubmissions.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
                <p className="font-bold text-slate-700">Không có bài tự luận nào chờ chấm</p>
                <p className="mt-1 text-xs text-slate-400">Các bài đã nộp trong lớp/bài tập này đã được chấm.</p>
              </div>
            ) : filteredSubmissions.map(submission => {
              const assignment = assignments.find(item => item.id === submission.assignmentId);
              const student = users.find(user => user.id === submission.studentId);
              const selected = activeSubmissionId === submission.id;
              return (
                <button key={submission.id} type="button" onClick={() => { setActiveSubmissionId(submission.id); setSuccessMessage(''); }} className={`mb-1 w-full rounded-2xl border p-4 text-left transition-colors ${selected ? 'border-mint-300 bg-mint-50' : 'border-transparent hover:bg-slate-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900">{student?.name ?? submission.studentId}</span>
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-800">Chờ chấm</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-500">{assignment?.title ?? 'Bài tự luận'}</p>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400"><Clock3 className="h-3.5 w-3.5" />{formatDate(submission.submittedAt)}</p>
                </button>
              );
            })}
          </div>
        </aside>

        {activeSubmission && activeAssignment ? (
          <section className="min-w-0 space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-mint-700"><UserRound className="h-4 w-4" />{activeStudent?.name ?? activeSubmission.studentId}</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">{activeAssignment.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{classes.find(cls => cls.id === activeAssignment.classId)?.title ?? activeAssignment.className} · Nộp lúc {formatDate(activeSubmission.submittedAt)}</p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700"><Clock3 className="h-4 w-4" /> Chờ chấm</span>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500"><BookOpen className="h-4 w-4" /> Câu hỏi và câu trả lời</h3>
              {activeAssignment.questions?.filter(question => question.type === 'essay').map((question, index) => (
                <article key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <p className="text-xs font-black uppercase text-mint-700">Câu {index + 1}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-800">{question.text}</p>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Câu trả lời của học viên</p>
                    <p className="min-h-8 whitespace-pre-wrap text-sm leading-6 text-slate-700">{activeSubmission.answers[question.id]?.trim() || 'Học viên chưa nhập câu trả lời dạng văn bản.'}</p>
                  </div>
                </article>
              ))}
            </div>

            {submissionAttachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500"><Paperclip className="h-4 w-4" /> Tệp đính kèm ({submissionAttachments.length})</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {submissionAttachments.map(file => file.fileType.startsWith('image/') ? (
                    <a key={file.id} href={file.dataUrl} target="_blank" rel="noreferrer" className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <img src={file.dataUrl} alt={file.fileName} className="h-56 w-full object-contain" />
                      <span className="flex items-center gap-2 p-3 text-xs font-semibold text-slate-600"><ImageIcon className="h-4 w-4" />{file.fileName}</span>
                    </a>
                  ) : (
                    <a key={file.id} href={file.dataUrl} download={file.fileName} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 hover:bg-slate-50">
                      <FileText className="h-8 w-8 shrink-0 text-blue-600" />
                      <span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-800">{file.fileName}</span><span className="text-xs text-slate-400">{formatFileSize(file.fileSize)} · Tải xuống</span></span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div>
                <label htmlFor="essay-score" className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700"><Award className="h-4 w-4 text-mint-600" />Điểm tổng bài nộp <span className="text-rose-500">*</span></label>
                <div className="flex items-center gap-2">
                  <input id="essay-score" type="number" min="0" max="10" step="0.1" value={scoreInput} onChange={event => setScoreInput(event.target.value)} aria-invalid={scoreIsInvalid} aria-describedby={scoreIsInvalid ? 'essay-score-error' : undefined} placeholder="Nhập điểm từ 0 đến 10" className={`w-full rounded-xl border-2 px-4 py-3 text-lg font-black outline-none ${scoreIsInvalid ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-mint-500'}`} />
                  <span className="shrink-0 text-sm font-bold text-slate-400">/ 10</span>
                </div>
                {scoreIsInvalid && <p id="essay-score-error" className="mt-2 text-xs font-bold text-rose-600">Điểm phải từ 0 đến 10</p>}
                <p className="mt-2 text-xs text-slate-400">Chấm một điểm tổng cho toàn bộ bài tự luận.</p>
              </div>
              <div>
                <label htmlFor="essay-comment" className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700"><MessageSquare className="h-4 w-4 text-mint-600" />Nhận xét <span className="font-medium text-slate-400">(không bắt buộc)</span></label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {QUICK_COMMENTS.map(text => <button key={text} type="button" onClick={() => appendQuickComment(text)} className="rounded-full border border-mint-200 bg-mint-50 px-3 py-1.5 text-xs font-semibold text-mint-800 hover:bg-mint-100">{text}</button>)}
                </div>
                <textarea id="essay-comment" value={comment} onChange={event => setComment(event.target.value)} rows={4} placeholder="Nhập nhận xét hoặc chọn nhận xét nhanh phía trên…" className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-mint-500" />
                <p className="mt-1 text-[11px] text-slate-400">Các nhận xét nhanh sẽ được nối bằng dấu chấm phẩy.</p>
              </div>
            </div>

            <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">Điểm được đồng bộ ngay vào sổ điểm của lớp.</p>
              <button type="button" onClick={saveGrade} disabled={saveDisabled} className="inline-flex items-center justify-center gap-2 rounded-xl bg-mint-600 px-6 py-3 font-black text-white shadow-sm transition hover:bg-mint-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
                <CheckCircle2 className="h-5 w-5" /> Lưu điểm số &amp; Hoàn tất
              </button>
            </footer>
          </section>
        ) : (
          <section className="flex min-h-96 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <CheckCircle2 className="mb-4 h-14 w-14 text-emerald-400" />
            <h2 className="text-xl font-black text-slate-800">Không có bài tự luận nào chờ chấm</h2>
            <p className="mt-2 max-w-md text-sm text-slate-500">Khi học viên nộp bài tự luận cho lớp bạn phụ trách, bài nộp sẽ xuất hiện tại đây.</p>
          </section>
        )}
      </section>
    </main>
  );
}
