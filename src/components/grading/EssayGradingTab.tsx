/**
 * EssayGradingTab — Tab chấm bài tự luận chờ chấm.
 * Feature: grading-and-feedback
 * Validates: Yêu cầu 4.1–4.8
 */

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Clock,
  User,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Award,
  Sparkles,
  MessageSquare,
  Download,
  Image as ImageIcon,
  ZoomIn,
  X,
  Paperclip,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { QuizSubmission, Assignment, User as UserType, Attachment } from '../../context/AppContext';

interface EssayGradingTabProps {
  classId: string;
  /** Đã lọc: chỉ bài có câu essay và chưa có score */
  submissions: QuizSubmission[];
  assignments: Assignment[];
  users: UserType[];
  onGrade: (submissionId: string, score: number, comment?: string) => void;
  /** (Optional) deep-link: tự chọn bài tập cần chấm */
  initialAssignmentId?: string;
}

/** Validate điểm: phải là số trong [0, 10] */
export function isValidScore(value: string): boolean {
  const n = parseFloat(value);
  return !isNaN(n) && isFinite(n) && n >= 0 && n <= 10;
}

// LaTeX Renderer duplicate to avoid cross imports
export function renderLatex(text: string) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = html.replace(/\n/g, "<br/>");
  
  let count = 0;
  while (html.includes("\\frac{") && count < 10) {
    html = html.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (_match, num, den) => {
      return `<span class="inline-flex flex-col items-center justify-center align-middle mx-1 text-[11px]"><span class="border-b border-slate-400 px-1 text-center w-full">${num}</span><span class="px-1 text-center w-full">${den}</span></span>`;
    });
    count++;
  }
  
  count = 0;
  while (html.includes("\\sqrt{") && count < 10) {
    html = html.replace(/\\sqrt\{([^}]+)\}/g, (_match, expr) => {
      return `<span class="inline-flex items-center align-middle mx-0.5"><span class="text-sm font-semibold -mr-0.5">√</span><span class="border-t border-slate-800 px-0.5 pt-0.5 text-[11px]">${expr}</span></span>`;
    });
    count++;
  }
  
  html = html.replace(/\^\{([^}]+)\}/g, "<sup>$1</sup>");
  html = html.replace(/\^([0-9a-zA-Z]+)/g, "<sup>$1</sup>");
  html = html.replace(/_\{([^}]+)\}/g, "<sub>$1</sub>");
  html = html.replace(/_([0-9a-zA-Z]+)/g, "<sub>$1</sub>");

  const symbolMap: Record<string, string> = {
    "\\times": "×",
    "\\div": "÷",
    "\\alpha": "α",
    "\\beta": "β",
    "\\theta": "θ",
    "\\pi": "π",
    "\\infty": "∞",
    "\\sum": "∑",
    "\\int": "∫",
    "\\approx": "≈",
    "\\ge": "≥",
    "\\le": "≤",
    "\\Delta": "Δ",
    "\\pm": "±",
  };

  Object.entries(symbolMap).forEach(([latex, unicode]) => {
    const escaped = latex.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    html = html.replace(new RegExp(escaped, "g"), unicode);
  });

  return html;
}

const QUICK_TAGS = [
  "Trình bày rõ ràng",
  "Cần giải thích chi tiết hơn các bước biến đổi",
  "Sai kết quả cuối cùng",
  "Thiếu đơn vị tính",
  "Lập luận toán học xuất sắc!",
  "Rất tốt, phát huy nhé",
];

/** Helper: format file size */
function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Helper: check if image type */
function isImageFile(type: string) {
  return type.startsWith('image/');
}

/** Helper: trigger download of base64 data */
function downloadAttachment(att: Attachment) {
  const link = document.createElement('a');
  link.href = att.dataUrl;
  link.download = att.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function EssayGradingTab({
  submissions,
  assignments,
  users,
  onGrade,
  initialAssignmentId,
}: EssayGradingTabProps) {
  // State for active submission in Split-Screen view
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  // State for image zoom modal
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  // State for text answer zoom modal
  const [zoomedTextAnswer, setZoomedTextAnswer] = useState<{ studentName: string; answers: Array<{ question: string; answer: string }> } | null>(null);

  const [formStates, setFormStates] = useState<Record<string, { scoreInput: string; comment: string; error: string; saved: boolean }>>(() => {
    const init: Record<string, { scoreInput: string; comment: string; error: string; saved: boolean }> = {};
    submissions.forEach(s => {
      init[s.id] = { scoreInput: '', comment: '', error: '', saved: false };
    });
    return init;
  });

  const getState = (id: string) =>
    formStates[id] ?? { scoreInput: '', comment: '', error: '', saved: false };

  const updateState = (id: string, patch: Partial<{ scoreInput: string; comment: string; error: string; saved: boolean }>) => {
    setFormStates(prev => ({ ...prev, [id]: { ...getState(id), ...patch } }));
  };

  React.useEffect(() => {
    setFormStates(prev => {
      const next = { ...prev };
      submissions.forEach(s => {
        if (!next[s.id]) {
          next[s.id] = { scoreInput: '', comment: '', error: '', saved: false };
        }
      });
      return next;
    });
  }, [submissions]);

  const handleScoreChange = (id: string, value: string) => {
    const error = value === '' ? '' : isValidScore(value) ? '' : 'Điểm phải từ 0 đến 10';
    updateState(id, { scoreInput: value, error });
  };

  const handleSave = (submission: QuizSubmission) => {
    const state = getState(submission.id);
    if (!isValidScore(state.scoreInput)) {
      updateState(submission.id, { error: 'Điểm phải từ 0 đến 10' });
      return;
    }
    const score = parseFloat(state.scoreInput);
    onGrade(submission.id, score, state.comment.trim() || undefined);
    updateState(submission.id, { saved: true, error: '' });
  };

  const getStudentName = (studentId: string) =>
    users.find(u => u.id === studentId)?.name ?? studentId;

  const getAssignment = (assignmentId: string) =>
    assignments.find(a => a.id === assignmentId);

  const getEssayAnswers = (submission: QuizSubmission, assignmentId: string) => {
    const assignment = getAssignment(assignmentId);
    if (!assignment?.questions) return [];
    return assignment.questions
      .filter(q => q.type === 'essay')
      .map(q => ({
        question: q.text,
        answer: submission.answers[q.id] ?? '(Chưa trả lời)',
      }));
  };

  // Quick tag appender
  const handleAddTag = (id: string, tag: string) => {
    const state = getState(id);
    const existing = state.comment.trim();
    const delimiter = existing ? '; ' : '';
    updateState(id, { comment: existing + delimiter + tag });
  };

  // Filter assignment ID state
  const [filterAssignmentId, setFilterAssignmentId] = useState<string>('all');

  // Deep-link: auto-select assignment filter + open first submission
  useEffect(() => {
    if (!initialAssignmentId) return;
    setFilterAssignmentId(initialAssignmentId);
  }, [initialAssignmentId]);

  // Unique assignments that have submissions
  const uniqueAssignmentsInSubmissions = React.useMemo(() => {
    const ids = Array.from(new Set(submissions.map(s => s.assignmentId)));
    return ids.map(id => assignments.find(a => a.id === id)).filter(Boolean) as Assignment[];
  }, [submissions, assignments]);

  // Filtered submissions based on dropdown choice
  const filteredSubmissions = React.useMemo(() => {
    if (filterAssignmentId === 'all') return submissions;
    return submissions.filter(s => s.assignmentId === filterAssignmentId);
  }, [submissions, filterAssignmentId]);

  useEffect(() => {
    // If deep-linked or filter changed, jump to first submission for faster grading
    if (!initialAssignmentId) return;
    if (activeSubmissionId) return;
    if (filteredSubmissions.length === 0) return;
    setActiveSubmissionId(filteredSubmissions[0].id);
  }, [initialAssignmentId, filteredSubmissions, activeSubmissionId]);

  // Filter pending submissions from the filtered list
  const pendingSubmissions = filteredSubmissions.filter(s => !getState(s.id).saved);

  // Navigator logic for Split-Screen Mode
  const currentIndex = filteredSubmissions.findIndex(s => s.id === activeSubmissionId);
  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveSubmissionId(filteredSubmissions[currentIndex - 1].id);
    }
  };
  const handleNext = () => {
    if (currentIndex < filteredSubmissions.length - 1) {
      setActiveSubmissionId(filteredSubmissions[currentIndex + 1].id);
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <CheckCircle2 className="w-16 h-16 mb-4 text-mint-300 animate-pulse" />
        <p className="text-lg font-bold text-slate-500">Không có bài tự luận nào chờ chấm</p>
        <p className="text-sm mt-1">Tất cả bài tự luận đã được chấm điểm.</p>
      </div>
    );
  }

  // ── Mode 1: Split-Screen Grader View ──────────────────────────────────────
  if (activeSubmissionId) {
    const submission = filteredSubmissions.find(s => s.id === activeSubmissionId);
    if (submission) {
      const state = getState(submission.id);
      const assignment = getAssignment(submission.assignmentId);
      const essayAnswers = getEssayAnswers(submission, submission.assignmentId);
      const studentName = getStudentName(submission.studentId);
      const isDisabled = !isValidScore(state.scoreInput) || state.scoreInput === '';
      const isSaved = state.saved;
      const submissionAttachments = submission.attachments ?? [];
      const imageAttachments = submissionAttachments.filter(a => isImageFile(a.fileType));
      const wordAttachments = submissionAttachments.filter(a => !isImageFile(a.fileType));

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm space-y-6 flex flex-col"
        >
          {/* Header Grader */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveSubmissionId(null)}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer text-slate-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-mint-500" />
                  {studentName}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {assignment?.title} • Nộp lúc {new Date(submission.submittedAt).toLocaleTimeString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Prev/Next student navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Học sinh trước
              </button>
              <span className="text-xs text-slate-400 font-bold px-2 font-mono">
                {currentIndex + 1} / {filteredSubmissions.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentIndex === filteredSubmissions.length - 1}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Học sinh sau
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 50/50 Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
            {/* Left 50%: Student Answers + Attachments */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-none">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bài làm của học sinh</span>
                <span className="h-px bg-slate-100 flex-1" />
              </div>

              {/* Text Answers */}
              {essayAnswers.map((qa, i) => (
                <div key={i} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-mint-50 border border-mint-200 text-[10px] font-black text-mint-700">Câu {i + 1}</span>
                    <p className="text-sm font-bold text-slate-700 leading-normal">{qa.question}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lời giải học sinh nộp:</p>
                    <div className="bg-white rounded-xl p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap border border-slate-200/60 shadow-sm font-mono">
                      {qa.answer}
                    </div>
                  </div>

                  {/* Math Formula Render Preview */}
                  {qa.answer.trim().length > 0 && (
                    <div className="bg-mint-50/20 backdrop-blur-sm border border-mint-200/50 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-mint-600">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Xem trước công thức (LaTeX Preview):</span>
                      </div>
                      <div
                        className="text-slate-800 text-sm font-medium leading-relaxed break-words overflow-x-auto pt-0.5"
                        dangerouslySetInnerHTML={{ __html: renderLatex(qa.answer) }}
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* ── Attachment Section ── */}
              {submissionAttachments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Tệp đính kèm ({submissionAttachments.length} tệp)
                    </span>
                    <span className="h-px bg-slate-100 flex-1" />
                  </div>

                  {/* Image attachments — preview gallery */}
                  {imageAttachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Ảnh bài làm viết tay
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {imageAttachments.map(att => (
                          <div
                            key={att.id}
                            className="relative group rounded-xl overflow-hidden border-2 border-slate-200 hover:border-mint-300 cursor-pointer transition-all shadow-sm"
                            onClick={() => setZoomedImage(att.dataUrl)}
                          >
                            <img
                              src={att.dataUrl}
                              alt={att.fileName}
                              className="w-full h-40 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5">
                              <span className="text-white text-[10px] font-semibold truncate">{att.fileName}</span>
                              <ZoomIn className="w-4 h-4 text-white shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Word document attachments — download cards */}
                  {wordAttachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Tài liệu Word
                      </p>
                      {wordAttachments.map(att => (
                        <div
                          key={att.id}
                          className="flex items-center gap-3 p-3.5 bg-blue-50/50 rounded-[14px] border border-blue-200/60 hover:border-blue-300 transition-all"
                        >
                          <div className="w-12 h-12 rounded-[10px] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate">{att.fileName}</p>
                            <p className="text-xs text-slate-400">{formatFileSize(att.fileSize)}</p>
                          </div>
                          <button
                            onClick={() => downloadAttachment(att)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Tải xuống
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right 50%: Professional Grading Console */}
            <div className="bg-slate-50/60 rounded-3xl p-6 border border-slate-100 flex flex-col justify-between space-y-5">
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bảng điểm & Đánh giá</span>
                  <span className="h-px bg-slate-100 flex-1" />
                </div>

                {isSaved ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                    <h4 className="text-emerald-800 font-bold text-base">Đã chấm điểm thành công!</h4>
                    <p className="text-2xl font-black text-emerald-600 mt-1">
                      {state.scoreInput} <span className="text-xs font-bold text-slate-400">/ 10 điểm</span>
                    </p>
                    {state.comment && (
                      <p className="text-xs text-slate-500 italic mt-1 font-medium bg-white/70 px-4 py-2 rounded-xl border border-emerald-100">
                        &quot;{state.comment}&quot;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Score input */}
                    <div>
                      <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-wide">
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-mint-500" />
                          Nhập điểm số (Thang 10)
                        </span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.5}
                        value={state.scoreInput}
                        onChange={e => handleScoreChange(submission.id, e.target.value)}
                        placeholder="Ví dụ: 8.5"
                        className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none transition-all ${
                          state.error
                            ? 'border-rose-400 bg-rose-50 focus:ring-4 focus:ring-rose-100'
                            : 'border-slate-200 bg-white focus:border-mint-400 focus:ring-4 focus:ring-mint-100'
                        }`}
                      />
                      {state.error && (
                        <p className="text-xs text-rose-600 font-semibold mt-1.5">{state.error}</p>
                      )}
                    </div>

                    {/* Quick evaluation comment templates */}
                    <div>
                      <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wide">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-mint-500" />
                          Nhận xét nhanh mẫu
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_TAGS.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleAddTag(submission.id, tag)}
                            className="text-[11px] font-semibold px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-mint-50 hover:text-mint-600 hover:border-mint-200 transition-all shadow-sm active:scale-95 cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom comments box */}
                    <div>
                      <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-wide">
                        Nhận xét cá nhân hóa
                      </label>
                      <textarea
                        value={state.comment}
                        onChange={e => updateState(submission.id, { comment: e.target.value })}
                        placeholder="Nhập nhận xét viết tay hoặc click nhận xét nhanh ở trên..."
                        rows={4}
                        className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-mint-400 focus:ring-4 focus:ring-mint-100 transition-all resize-none bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {!isSaved && (
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-xs text-slate-400 font-bold">* Điểm sẽ được đồng bộ ngay lập tức sang sổ điểm chính.</p>
                  <button
                    onClick={() => handleSave(submission)}
                    disabled={isDisabled}
                    className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
                      isDisabled
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-mint-600 to-mint-400 text-white shadow-lg shadow-mint-100 hover:shadow-xl hover:shadow-mint-200 hover:-translate-y-0.5 active:scale-98'
                    }`}
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    Lưu điểm số & Hoàn tất
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Image Zoom Modal */}
          <AnimatePresence>
            {zoomedImage && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
                  onClick={() => setZoomedImage(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="relative z-10 max-w-[90vw] max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img
                    src={zoomedImage}
                    alt="Ảnh bài làm phóng to"
                    className="max-w-full max-h-[85vh] object-contain"
                  />
                  <button
                    onClick={() => setZoomedImage(null)}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    }
  }

  // ── Mode 2: Normal list of submissions ──────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Assignment Filter Selector */}
      {uniqueAssignmentsInSubmissions.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 p-4.5 rounded-3xl border border-slate-100 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Chọn bài tự luận cần chấm:</span>
          </div>
          <div className="relative min-w-[280px]">
            <select
              value={filterAssignmentId}
              onChange={e => setFilterAssignmentId(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 focus:border-mint-400 rounded-2xl py-2.5 pl-4 pr-10 text-xs font-bold focus:ring-4 focus:ring-mint-500/10 outline-none transition-all text-slate-700 cursor-pointer appearance-none"
            >
              <option value="all">Tất cả bài tập tự luận ({submissions.length})</option>
              {uniqueAssignmentsInSubmissions.map(a => {
                const count = submissions.filter(s => s.assignmentId === a.id).length;
                return (
                  <option key={a.id} value={a.id}>
                    {a.title} ({count} bài)
                  </option>
                );
              })}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>
      )}

      {pendingSubmissions.length === 0 && filteredSubmissions.length > 0 && (
        <div className="flex items-center gap-3 p-4.5 bg-mint-50/50 backdrop-blur-sm rounded-[20px] border border-mint-200/50">
          <CheckCircle2 className="w-5 h-5 text-mint-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-mint-700">
            Đã hoàn thành chấm điểm các bài tự luận của bài tập này trong phiên này.
          </p>
        </div>
      )}

      {filteredSubmissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-[24px] border border-slate-100 text-slate-400">
          <p className="text-sm font-bold">Không có bài tập nào cần chấm phù hợp với bộ lọc hiện tại.</p>
        </div>
      )}
      {filteredSubmissions.map((submission, idx) => {
        const state = getState(submission.id);
        const assignment = getAssignment(submission.assignmentId);
        const studentName = getStudentName(submission.studentId);
        const isSaved = state.saved;
        const submissionAttachments = submission.attachments ?? [];
        const imageAttachments = submissionAttachments.filter(a => isImageFile(a.fileType));
        const essayAnswers = getEssayAnswers(submission, submission.assignmentId);
        const hasRealTextAnswer = essayAnswers.some(ea => ea.answer && ea.answer.trim() !== "" && ea.answer.trim() !== "(Chưa trả lời)");

        return (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-white rounded-[24px] border shadow-sm overflow-hidden transition-all duration-200 ${
              isSaved ? 'border-mint-200/60 opacity-60' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            {/* Main Content Layout Grid (3 Equal Columns: 1/3 Left student info, 1/3 Middle answers/attachments, 1/3 Right grading) */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* 1. Left 1/3 Column: Student info */}
              <div className="lg:col-span-1 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-mint-50 text-mint-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-slate-900 leading-none mb-1.5">{studentName}</p>
                  <p className="text-xs font-semibold text-slate-500">
                    {assignment?.title ?? submission.assignmentId}
                  </p>
                  <div className="flex flex-col gap-1.5 mt-2.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Nộp lúc:{' '}
                      {new Date(submission.submittedAt).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Middle 1/3 Column: Attachments (Images) & Answers (Text frame) */}
              <div className="lg:col-span-1 space-y-4">
                {/* Title aligned with "Nhập điểm chấm" */}
                {imageAttachments.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-mint-600 uppercase tracking-widest leading-none pt-1">
                      Ảnh bài làm (Click để phóng to):
                    </p>
                    <div className="flex flex-wrap gap-3.5">
                      {imageAttachments.map(att => (
                        <div
                          key={att.id}
                          className="relative w-52 h-52 rounded-2xl overflow-hidden border border-slate-200 hover:border-mint-400 cursor-pointer transition-all shadow-sm group shrink-0"
                          onClick={() => setZoomedImage(att.dataUrl)}
                        >
                          <img
                            src={att.dataUrl}
                            alt={att.fileName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : hasRealTextAnswer ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pt-1">
                      Nội dung câu trả lời (Click để phóng to):
                    </p>
                  </div>
                ) : null}

                {/* Khung câu trả lời chữ hiển thị phía dưới phần ảnh nếu có câu trả lời thực tế */}
                {hasRealTextAnswer && (
                  <div className="space-y-2">
                    {imageAttachments.length > 0 && (
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Nội dung câu trả lời (Click để phóng to):
                      </p>
                    )}
                    <div 
                      onClick={() => setZoomedTextAnswer({ studentName, answers: essayAnswers })}
                      className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 rounded-xl p-3 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap cursor-pointer hover:border-mint-300 transition-all font-mono max-h-44 overflow-y-auto w-full"
                      title="Click để xem văn bản phóng to"
                    >
                      {essayAnswers.map((ea, idx) => (
                        <div key={idx} className="space-y-1">
                          <p className="font-bold text-slate-800 text-[10px] border-b border-slate-200/40 pb-0.5 mb-1">
                            Câu {idx + 1}: {ea.question}
                          </p>
                          <p className="text-slate-600 pl-1">{ea.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right 1/4 Column: Grading Console */}
              <div className="lg:col-span-1 w-full space-y-4">
                {isSaved ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-mint-50 border border-mint-200/50 text-mint-700 rounded-2xl text-xs font-black shadow-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Đã chấm: {state.scoreInput} điểm
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Nhập điểm chấm
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.5}
                        value={state.scoreInput}
                        onChange={e => handleScoreChange(submission.id, e.target.value)}
                        placeholder="0 - 10"
                        className={`w-full border-2 rounded-xl px-3 py-2 text-xs font-bold outline-none transition-all ${
                          state.error
                            ? 'border-rose-400 bg-rose-50 focus:ring-4 focus:ring-rose-100'
                            : 'border-slate-200 bg-white focus:border-mint-400 focus:ring-4 focus:ring-mint-50'
                        }`}
                      />
                      {state.error && (
                        <p className="text-[10px] text-rose-600 font-bold mt-1">{state.error}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Nhận xét (Tuỳ chọn)
                      </label>
                      <textarea
                        value={state.comment}
                        onChange={e => updateState(submission.id, { comment: e.target.value })}
                        placeholder="Ghi chú, nhận xét"
                        rows={2}
                        className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-mint-400 focus:ring-4 focus:ring-mint-50 transition-all resize-none bg-white"
                      />
                    </div>

                    <button
                      onClick={() => handleSave(submission)}
                      disabled={!isValidScore(state.scoreInput) || state.scoreInput === ''}
                      className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                        !isValidScore(state.scoreInput) || state.scoreInput === ''
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : 'bg-mint-500 hover:bg-mint-600 text-white shadow-md shadow-mint-100 hover:shadow-lg'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Lưu điểm
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* ── Image Zoom Modal (Mode 2) ── */}
      <AnimatePresence>
        {zoomedImage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setZoomedImage(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative z-10 max-w-[90vw] max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src={zoomedImage}
                alt="Ảnh bài làm phóng to"
                className="max-w-full max-h-[85vh] object-contain"
              />
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Text Answer Zoom Modal ── */}
      <AnimatePresence>
        {zoomedTextAnswer && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setZoomedTextAnswer(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative z-10 w-full max-w-2xl bg-white rounded-[32px] border border-slate-100 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Chi tiết câu trả lời tự luận</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">
                    Học viên: <span className="text-mint-600 font-black">{zoomedTextAnswer.studentName}</span>
                  </p>
                </div>
                <button
                  onClick={() => setZoomedTextAnswer(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto space-y-4 pr-1 flex-1">
                {zoomedTextAnswer.answers.map((qa, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-mint-50 border border-mint-200 text-[10px] font-black text-mint-700">Câu {i + 1}</span>
                      <p className="text-sm font-bold text-slate-700 leading-normal">{qa.question}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lời giải học sinh nộp:</p>
                      <div className="bg-white rounded-xl p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap border border-slate-200/60 shadow-sm font-mono">
                        {qa.answer}
                      </div>
                    </div>

                    {/* LaTeX Preview */}
                    {qa.answer.trim().length > 0 && (
                      <div className="bg-mint-50/20 backdrop-blur-sm border border-mint-200/50 rounded-xl p-4 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-mint-600">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Xem trước công thức (LaTeX Preview):</span>
                        </div>
                        <div
                          className="text-slate-800 text-sm font-medium leading-relaxed break-words overflow-x-auto pt-0.5"
                          dangerouslySetInnerHTML={{ __html: renderLatex(qa.answer) }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end mt-4">
                <button
                  onClick={() => setZoomedTextAnswer(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
