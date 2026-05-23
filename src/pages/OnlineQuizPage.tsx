import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  FileText,
  Send,
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  FileDown,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { QuizQuestion, QuizSubmission, Attachment } from "../context/AppContext";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function gradeMultipleChoice(
  questions: QuizQuestion[],
  answers: Record<string, string>
): number {
  const mcQuestions = questions.filter((q) => q.type === "multiple_choice");
  if (mcQuestions.length === 0) return 0;
  const correct = mcQuestions.filter(
    (q) => answers[q.id] === q.correctAnswer
  ).length;
  return Math.round((correct / mcQuestions.length) * 10 * 10) / 10;
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

// ── Sub-components ────────────────────────────────────────────────────────────

interface MultipleChoiceQuestionProps {
  question: QuizQuestion;
  index: number;
  selectedAnswer: string | undefined;
  onChange: (questionId: string, answer: string) => void;
  showResult?: boolean;
  correctAnswer?: string;
}

function MultipleChoiceQuestion({
  question,
  index,
  selectedAnswer,
  onChange,
  showResult,
  correctAnswer,
}: MultipleChoiceQuestionProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[20px] border border-slate-100 p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-400 mb-2">Câu {index + 1}</p>
      <p className="text-slate-800 font-medium mb-5 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderLatex(question.text) }} />
      <div className="space-y-3">
        {question.options?.map((option, optIdx) => {
          const label = OPTION_LABELS[optIdx];
          const isSelected = selectedAnswer === label;
          const isCorrect = showResult && correctAnswer === label;
          const isWrong = showResult && isSelected && selectedAnswer !== correctAnswer;

          let optionClass =
            "flex items-center gap-3 p-3.5 rounded-[14px] border cursor-pointer transition-all duration-150 ";
          if (showResult) {
            if (isCorrect)
              optionClass += "bg-emerald-50 border-emerald-300 text-emerald-800";
            else if (isWrong)
              optionClass += "bg-rose-50 border-rose-300 text-rose-700";
            else
              optionClass += "bg-slate-50 border-slate-200 text-slate-500";
          } else if (isSelected) {
            optionClass += "bg-mint-50 border-mint-400 text-mint-800 shadow-sm";
          } else {
            optionClass +=
              "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-mint-50/50 hover:border-mint-300";
          }

          return (
            <label key={label} className={optionClass}>
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                  showResult
                    ? isCorrect
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : isWrong
                      ? "bg-rose-400 border-rose-400 text-white"
                      : "bg-slate-200 border-slate-300 text-slate-500"
                    : isSelected
                    ? "bg-mint-500 border-mint-500 text-white"
                    : "bg-white border-slate-300 text-slate-500"
                }`}
              >
                {label}
              </span>
              <span className="text-sm leading-snug" dangerouslySetInnerHTML={{ __html: renderLatex(option) }} />
              {showResult && isCorrect && (
                <CheckCircle2 className="ml-auto w-4 h-4 text-emerald-500 shrink-0" />
              )}
              {showResult && isWrong && (
                <X className="ml-auto w-4 h-4 text-rose-400 shrink-0" />
              )}
              {!showResult && (
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={label}
                  checked={isSelected}
                  onChange={() => onChange(question.id, label)}
                  className="sr-only"
                />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

interface EssayQuestionProps {
  question: QuizQuestion;
  index: number;
  value: string;
  onChange: (questionId: string, value: string) => void;
  readOnly?: boolean;
  attachments?: Attachment[];
  onAttachmentsChange?: (questionId: string, attachments: Attachment[]) => void;
}

const MATH_TOKENS = [
  { label: "+", latex: "+" },
  { label: "-", latex: "-" },
  { label: "×", latex: "\\times " },
  { label: "÷", latex: "\\div " },
  { label: "√x", latex: "\\sqrt{x} " },
  { label: "x²", latex: "x^2 " },
  { label: "xʸ", latex: "x^y " },
  { label: "a/b", latex: "\\frac{a}{b} " },
  { label: "π", latex: "\\pi " },
  { label: "α", latex: "\\alpha " },
  { label: "β", latex: "\\beta " },
  { label: "θ", latex: "\\theta " },
  { label: "∞", latex: "\\infty " },
  { label: "∑", latex: "\\sum " },
  { label: "∫", latex: "\\int " },
  { label: "≈", latex: "\\approx " },
  { label: "≥", latex: "\\ge " },
  { label: "≤", latex: "\\le " },
  { label: "Δ", latex: "\\Delta " },
];

export function renderLatex(text: string) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = html.replace(/\n/g, "<br/>");
  
  let count = 0;
  while (html.includes("\\frac{") && count < 10) {
    html = html.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (match, num, den) => {
      return `<span class="inline-flex flex-col items-center justify-center align-middle mx-1 text-[11px]"><span class="border-b border-slate-400 px-1 text-center w-full">${num}</span><span class="px-1 text-center w-full">${den}</span></span>`;
    });
    count++;
  }
  
  count = 0;
  while (html.includes("\\sqrt{") && count < 10) {
    html = html.replace(/\\sqrt\{([^}]+)\}/g, (match, expr) => {
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

function EssayQuestion({
  question,
  index,
  value,
  onChange,
  readOnly,
  attachments = [],
  onAttachmentsChange,
}: EssayQuestionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleInsertToken = (latex: string) => {
    if (readOnly || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newValue = before + latex + after;
    onChange(question.id, newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + latex.length, start + latex.length);
    }, 0);
  };

  const ACCEPTED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ];

  const processFiles = (files: FileList | File[]) => {
    if (readOnly || !onAttachmentsChange) return;
    const fileArr = Array.from(files);
    const validFiles = fileArr.filter(f => ACCEPTED_TYPES.includes(f.type));
    if (validFiles.length === 0) return;

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newAttachment: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          dataUrl: reader.result as string,
        };
        onAttachmentsChange(question.id, [...attachments, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const handleRemoveAttachment = (attId: string) => {
    if (!onAttachmentsChange) return;
    onAttachmentsChange(question.id, attachments.filter(a => a.id !== attId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (type: string) => type.startsWith('image/');

  const previewHtml = renderLatex(value);

  return (
    <div id={`question-container-${question.id}`} className="bg-white/80 backdrop-blur-sm rounded-[20px] border border-slate-100 p-6 shadow-sm space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-400 mb-2">Câu {index + 1} (Tự luận)</p>
        <p className="text-slate-800 font-medium leading-relaxed">{question.text}</p>
      </div>

      {!readOnly && (
        <div className="flex flex-wrap gap-1 bg-slate-50 p-2 rounded-[14px] border border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center">
            Mã Toán:
          </span>
          {MATH_TOKENS.map((tk) => (
            <button
              key={tk.label}
              type="button"
              onClick={() => handleInsertToken(tk.latex)}
              className="px-2 py-1 bg-white hover:bg-mint-50 hover:text-mint-600 border border-slate-200 hover:border-mint-200 rounded-lg text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {tk.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(question.id, e.target.value)}
          readOnly={readOnly}
          placeholder={readOnly ? "" : "Nhập câu trả lời của bạn tại đây... Sử dụng thanh công cụ toán học ở trên để chèn các ký tự đặc biệt."}
          rows={5}
          className={`w-full rounded-[14px] border px-4 py-3 text-sm text-slate-700 leading-relaxed resize-none outline-none transition-all duration-150 ${
            readOnly
              ? "bg-slate-50 border-slate-200 text-slate-600 cursor-default"
              : "bg-white border-slate-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100"
          }`}
        />
      </div>

      {value.trim().length > 0 && (
        <div className="bg-mint-50/20 backdrop-blur-sm border border-mint-200/50 rounded-[16px] p-4.5 space-y-2">
          <p className="text-[10px] font-black text-mint-600 uppercase tracking-wider">
            Xem trước lời giải (LaTeX Preview):
          </p>
          <div
            className="text-slate-800 text-sm font-medium leading-relaxed break-words overflow-x-auto pt-1"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      )}

      {/* ── File Upload Zone ── */}
      {!readOnly && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hoặc đính kèm tệp bài làm</span>
            <span className="h-px bg-slate-200 flex-1" />
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-[18px] border-2 border-dashed cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-mint-400 bg-mint-50/40 shadow-lg shadow-mint-100/50'
                : 'border-slate-200 bg-slate-50/50 hover:border-mint-300 hover:bg-mint-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif"
              multiple
              onChange={handleFileSelect}
              className="sr-only"
            />
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isDragOver ? 'bg-mint-100' : 'bg-slate-100'
            }`}>
              <Upload className={`w-5 h-5 ${isDragOver ? 'text-mint-600' : 'text-slate-400'}`} />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              {isDragOver ? 'Thả tệp bài làm để tải lên...' : 'Kéo thả tệp hoặc nhấp để chọn'}
            </p>
            <p className="text-[11px] text-slate-400">
              Hỗ trợ: <span className="font-bold text-emerald-500">Ảnh chụp bài làm (.jpg, .jpeg, .png)</span>
            </p>
          </div>

          {/* Uploaded files preview */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map(att => (
                <motion.div
                  key={att.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-[14px] border border-slate-100 shadow-sm"
                >
                  {isImage(att.fileType) ? (
                    <div className="w-14 h-14 rounded-[10px] overflow-hidden border border-slate-200 shrink-0">
                      <img src={att.dataUrl} alt={att.fileName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-[10px] bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{att.fileName}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(att.fileSize)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveAttachment(att.id); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Show attachments in readOnly mode */}
      {readOnly && attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tệp đính kèm đã nộp:</p>
          {attachments.map(att => (
            <div key={att.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-[14px] border border-slate-100">
              {isImage(att.fileType) ? (
                <div className="w-14 h-14 rounded-[10px] overflow-hidden border border-slate-200 shrink-0">
                  <img src={att.dataUrl} alt={att.fileName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-[10px] bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{att.fileName}</p>
                <p className="text-xs text-slate-400">{formatFileSize(att.fileSize)}</p>
              </div>
              <a
                href={att.dataUrl}
                download={att.fileName}
                className="text-xs font-semibold px-3 py-2 bg-slate-100 text-slate-700 rounded-full hover:bg-mint-50 hover:text-mint-700 transition-colors"
              >
                Tải xuống
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── File Upload Confirm Dialog (cho bài tự luận) ────────────────────────────

interface FileUploadConfirmDialogProps {
  onConfirm: (attachments: Attachment[]) => void;
  onCancel: () => void;
  assignmentTitle: string;
}

function FileUploadConfirmDialog({
  onConfirm,
  onCancel,
  assignmentTitle,
}: FileUploadConfirmDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fileError, setFileError] = useState("");

  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  const processFiles = (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    const validFiles = fileArr.filter(f => ACCEPTED_TYPES.includes(f.type));
    
    if (fileArr.length > validFiles.length) {
      setFileError("Chỉ chấp nhận file ảnh (.jpg, .jpeg, .png, .gif)");
      setTimeout(() => setFileError(""), 3000);
    }

    if (validFiles.length === 0) return;

    validFiles.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        setFileError(`File "${file.name}" vượt quá 10MB`);
        setTimeout(() => setFileError(""), 3000);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const newAttachment: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          dataUrl: reader.result as string,
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (type: string) => type.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative bg-white rounded-[24px] shadow-2xl p-8 w-full max-w-md z-10 max-h-[80vh] overflow-y-auto"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-mint-50 flex items-center justify-center">
              <Upload className="w-6 h-6 text-mint-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Tải lên bài làm</h3>
              <p className="text-xs text-slate-500 mt-0.5">Chụp ảnh bài làm của bạn và tải lên</p>
            </div>
          </div>

          {/* Assignment info */}
          <div className="bg-mint-50 border border-mint-200 rounded-[16px] p-4">
            <p className="text-xs text-slate-500 mb-1">Bài tập:</p>
            <p className="text-sm font-semibold text-slate-800 line-clamp-2">{assignmentTitle}</p>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-[18px] border-2 border-dashed cursor-pointer transition-all ${
              isDragOver
                ? 'border-mint-400 bg-mint-50/40 shadow-lg shadow-mint-100/50'
                : 'border-slate-200 bg-slate-50/50 hover:border-mint-300 hover:bg-mint-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif"
              multiple
              onChange={handleFileSelect}
              className="sr-only"
            />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isDragOver ? 'bg-mint-100' : 'bg-slate-100'
            }`}>
              <ImageIcon className={`w-5 h-5 ${isDragOver ? 'text-mint-600' : 'text-slate-400'}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">
                {isDragOver ? 'Thả ảnh bài làm...' : 'Kéo thả hoặc nhấp để chọn'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                JPG, PNG, GIF — Tối đa 10MB/file
              </p>
            </div>
          </div>

          {/* Error message */}
          {fileError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 border border-rose-200 rounded-[12px] p-3 flex gap-2 items-start"
            >
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium">{fileError}</p>
            </motion.div>
          )}

          {/* Uploaded files preview */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700">
                Ảnh đã chọn ({attachments.length})
              </p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {attachments.map(att => (
                  <motion.div
                    key={att.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-[12px] border border-slate-100"
                  >
                    {isImage(att.fileType) ? (
                      <div className="w-10 h-10 rounded-[8px] overflow-hidden border border-slate-200 shrink-0">
                        <img src={att.dataUrl} alt={att.fileName} className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{att.fileName}</p>
                      <p className="text-[10px] text-slate-400">{formatFileSize(att.fileSize)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveAttachment(att.id); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-[14px] border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Tiếp tục chỉnh sửa
            </button>
            <button
              onClick={() => onConfirm(attachments)}
              disabled={attachments.length === 0}
              className={`flex-1 py-3 rounded-[14px] text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                attachments.length === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-mint-500 text-white hover:bg-mint-600 shadow-sm hover:shadow-md active:scale-95'
              }`}
            >
              <Send className="w-4 h-4" />
              Xác nhận & Nộp bài
            </button>
          </div>

          {/* Info message */}
          {attachments.length === 0 && (
            <p className="text-xs text-slate-500 text-center italic px-2">
              Bạn phải tải lên ít nhất 1 ảnh chụp bài làm để nộp bài.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  unansweredCount: number;
  totalCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  unansweredCount,
  totalCount,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative bg-white rounded-[24px] shadow-2xl p-8 w-full max-w-sm z-10"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Xác nhận nộp bài?</h3>
            {unansweredCount > 0 ? (
              <p className="text-sm text-slate-500">
                Bạn còn{" "}
                <span className="font-semibold text-rose-500">{unansweredCount}</span> câu
                chưa trả lời (trên tổng số {totalCount} câu).
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Bạn đã trả lời đủ {totalCount} câu. Xác nhận nộp bài?
              </p>
            )}
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-[14px] border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Tiếp tục làm
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-[14px] bg-mint-500 text-white text-sm font-semibold hover:bg-mint-600 transition-colors shadow-sm"
            >
              Nộp bài
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function WarningModal({
  count,
  onConfirm,
}: {
  count: number;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-rose-950/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative bg-white rounded-[24px] shadow-2xl p-8 w-full max-w-sm z-10 border border-rose-100"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center animate-bounce">
            <AlertTriangle className="w-7 h-7 text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">CẢNH BÁO VI PHẠM!</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Phát hiện hành động rời khỏi màn hình thi (chuyển tab hoặc thu nhỏ trình duyệt). 
              Đây là lần vi phạm thứ <span className="font-extrabold text-rose-600 text-base">{count}</span>/3.
            </p>
            <p className="text-xs text-rose-500 mt-2 font-medium">
              *Chú ý: Vi phạm quá 3 lần, bài thi sẽ bị TỰ ĐỘNG KHÓA VÀ NỘP NGAY LẬP TỨC.
            </p>
          </div>
          <button
            onClick={onConfirm}
            className="w-full mt-2 py-3 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Tôi đã hiểu và tiếp tục làm bài
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Result View ───────────────────────────────────────────────────────────────

interface ResultViewProps {
  submission: QuizSubmission;
  questions: QuizQuestion[];
  assignmentTitle: string;
  isEssay: boolean;
  onBack: () => void;
}

function ResultView({
  submission,
  questions,
  assignmentTitle,
  isEssay,
  onBack,
}: ResultViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-mint-50/30 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <span className="text-slate-300">|</span>
        <h1 className="text-sm font-semibold text-slate-700 truncate flex-1">{assignmentTitle}</h1>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          Đã nộp
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full space-y-4">
        {/* Result summary card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm text-center"
        >
          {isEssay ? (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Bài đã nộp</h2>
              <p className="text-slate-500 text-sm">
                Chờ giáo viên chấm điểm. Kết quả sẽ được thông báo sau.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-mint-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-mint-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Kết quả bài làm</h2>
              <div className="text-5xl font-extrabold text-mint-600 my-3">
                {submission.score ?? 0}
                <span className="text-2xl text-slate-400 font-semibold">/10</span>
              </div>
              <p className="text-slate-500 text-sm">
                {questions.filter(
                  (q) =>
                    q.type === "multiple_choice" &&
                    submission.answers[q.id] === q.correctAnswer
                ).length}{" "}
                /{" "}
                {questions.filter((q) => q.type === "multiple_choice").length} câu đúng
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Nộp lúc{" "}
                {new Date(submission.submittedAt).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </>
          )}
        </motion.div>

        {/* Questions review */}
        {questions.map((q, idx) =>
          q.type === "multiple_choice" ? (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <MultipleChoiceQuestion
                question={q}
                index={idx}
                selectedAnswer={submission.answers[q.id]}
                onChange={() => {}}
                showResult
                correctAnswer={q.correctAnswer}
              />
            </motion.div>
          ) : (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <EssayQuestion
                question={q}
                index={idx}
                value={submission.answers[q.id] ?? ""}
                onChange={() => {}}
                readOnly
                attachments={submission.attachments ?? []}
              />
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OnlineQuizPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { assignments, currentAccount, submitQuiz, getSubmission } = useAppContext();

  // Find assignment
  const assignment = assignments.find((a) => a.id === assignmentId);

  // State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [fileAttachments, setFileAttachments] = useState<Record<string, Attachment[]>>({});
  const [timeLeft, setTimeLeft] = useState<number>(() =>
    assignment?.timeLimit ? assignment.timeLimit * 60 : 0
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizSubmission | null>(null);
  const autoSubmittedRef = useRef(false);

  // Anti-Cheat states
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Auto-Save states
  const [showToast, setShowToast] = useState<boolean>(false);

  const questions = assignment?.questions ?? [];
  const isEssay = assignment?.type === "Tự luận";
  const hasTimer = !!assignment?.timeLimit && assignment.timeLimit > 0;

  // Check existing submission
  const existingSubmission =
    assignment && currentAccount
      ? getSubmission(assignment.id, currentAccount.id)
      : undefined;

  // Handle answer change
  const handleAnswerChange = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    []
  );

  // Handle attachments change for essay questions
  const handleAttachmentsChange = useCallback(
    (questionId: string, newAttachments: Attachment[]) => {
      setFileAttachments((prev) => ({ ...prev, [questionId]: newAttachments }));
    },
    []
  );

  // Handle submit - show file upload dialog for essay if no attachments yet
  const handleSubmitClick = useCallback(() => {
    if (!assignment) return;
    
    // For essay assignments without attachments, show file upload dialog first
    if (isEssay) {
      const allAttachments: Attachment[] = (Object.values(fileAttachments) as Attachment[][]).flat();
      if (allAttachments.length === 0) {
        setShowFileUploadDialog(true);
        return;
      }
    }
    
    // Otherwise show confirmation dialog
    setShowConfirm(true);
  }, [assignment, isEssay, fileAttachments]);

  // Handle file upload confirmation - update attachments and proceed to confirm
  const handleFileUploadConfirm = useCallback((uploadedAttachments: Attachment[]) => {
    if (!uploadedAttachments || uploadedAttachments.length === 0) return;
    
    // Add uploaded attachments to the essay questions
    // For simplicity, add all to the first essay question (can be customized per question)
    const essayQuestions = questions.filter((q) => q.type === 'essay');
    if (essayQuestions.length > 0) {
      const firstEssayId = essayQuestions[0].id;
      setFileAttachments((prev) => ({
        ...prev,
        [firstEssayId]: [...(prev[firstEssayId] ?? []), ...uploadedAttachments],
      }));
    }
    
    setShowFileUploadDialog(false);
    setShowConfirm(true);
  }, [questions]);

  // Submit logic
  const handleSubmit = useCallback(
    (auto = false) => {
      if (!assignment || !currentAccount) return;
      if (autoSubmittedRef.current && auto) return;
      if (auto) autoSubmittedRef.current = true;

      const score = isEssay
        ? undefined
        : gradeMultipleChoice(questions, answers);

      // Collect all attachments from all essay questions
      const allAttachments: Attachment[] = (Object.values(fileAttachments) as Attachment[][]).flat();

      const submission: Omit<QuizSubmission, "id"> = {
        assignmentId: assignment.id,
        studentId: currentAccount.id,
        answers,
        attachments: allAttachments.length > 0 ? allAttachments : undefined,
        submittedAt: new Date().toISOString(),
        score,
        maxScore: 10,
      };

      submitQuiz(submission);
      const fullSubmission: QuizSubmission = { ...submission, id: `QS-${Date.now()}` };
      setResult(fullSubmission);
      setSubmitted(true);
      setShowConfirm(false);

      // Clear local storage draft and tab switches on success
      const draftKey = `smash.draft.${assignment.id}.${currentAccount.id}`;
      localStorage.removeItem(draftKey);
      const switchKey = `smash.tabswitches.${assignment.id}.${currentAccount.id}`;
      localStorage.removeItem(switchKey);
    },
    [assignment, currentAccount, answers, fileAttachments, questions, isEssay, submitQuiz]
  );

  // Check existing submission and restore draft
  useEffect(() => {
    if (!assignment || !currentAccount) return;
    const draftKey = `smash.draft.${assignment.id}.${currentAccount.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === "object") {
          setAnswers(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }

    const switchKey = `smash.tabswitches.${assignment.id}.${currentAccount.id}`;
    const savedSwitches = localStorage.getItem(switchKey);
    if (savedSwitches) {
      const parsed = parseInt(savedSwitches, 10);
      if (!isNaN(parsed)) {
        setTabSwitchCount(parsed);
        if (parsed >= 3) {
          setIsLocked(true);
          handleSubmit(true);
        }
      }
    }
  }, [assignment, currentAccount]);

  // Listen for visibility and blur events (tab switching)
  useEffect(() => {
    if (submitted || existingSubmission || isLocked || !assignment || !currentAccount || showConfirm || showFileUploadDialog) return;

    const handleViolation = () => {
      setTabSwitchCount((prev) => {
        const next = prev + 1;
        const switchKey = `smash.tabswitches.${assignment.id}.${currentAccount.id}`;
        localStorage.setItem(switchKey, String(next));

        if (next >= 3) {
          setIsLocked(true);
          setTimeout(() => {
            handleSubmit(true);
          }, 500);
        } else {
          setShowWarningModal(true);
        }
        return next;
      });
    };

    const handleBlur = () => {
      handleViolation();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleViolation();
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [submitted, existingSubmission, isLocked, assignment, currentAccount, handleSubmit, showConfirm, showFileUploadDialog]);

  // 60-second Auto-save timer
  useEffect(() => {
    if (submitted || existingSubmission || isLocked || !assignment || !currentAccount) return;

    const timer = setInterval(() => {
      const draftKey = `smash.draft.${assignment.id}.${currentAccount.id}`;
      localStorage.setItem(draftKey, JSON.stringify(answers));

      setShowToast(true);
      const toastTimeout = setTimeout(() => {
        setShowToast(false);
      }, 2500);

      return () => clearTimeout(toastTimeout);
    }, 60000);

    return () => clearInterval(timer);
  }, [answers, submitted, existingSubmission, isLocked, assignment, currentAccount]);

  // Countdown timer
  useEffect(() => {
    if (!hasTimer || timeLeft <= 0 || submitted || existingSubmission || isLocked) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasTimer, timeLeft, submitted, existingSubmission, isLocked, handleSubmit]);

  const answeredCount = questions.filter((q) => !!answers[q.id]?.trim() || (fileAttachments[q.id]?.length ?? 0) > 0).length;
  const unansweredCount = questions.length - answeredCount;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const isTimeLow = hasTimer && timeLeft < 5 * 60;

  // ── Error state: assignment not found ──────────────────────────────────────
  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-mint-50/30 to-slate-100 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-10 text-center max-w-sm w-full"
        >
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Không tìm thấy bài tập</h2>
          <p className="text-sm text-slate-500 mb-6">
            Bài tập này không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => navigate("/assignments")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-mint-500 text-white text-sm font-semibold hover:bg-mint-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách bài tập
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Closed assignment ──────────────────────────────────────────────────────
  if (assignment.status !== "Đang mở") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-mint-50/30 to-slate-100 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-10 text-center max-w-sm w-full"
        >
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Bài tập đã đóng</h2>
          <p className="text-sm text-slate-500 mb-6">
            Bài tập này không còn nhận bài nộp. Trạng thái:{" "}
            <span className="font-medium text-slate-700">{assignment.status}</span>
          </p>
          <button
            onClick={() => navigate("/assignments")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-mint-500 text-white text-sm font-semibold hover:bg-mint-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Locked screen view ──────────────────────────────────────────────────────
  if (isLocked || tabSwitchCount >= 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-950/70 to-slate-950 flex items-center justify-center p-6 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl p-10 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-6 border border-rose-500/30">
            <AlertTriangle className="w-10 h-10 text-rose-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-rose-400 mb-2 uppercase tracking-wide">Bài thi đã bị khóa!</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Hệ thống phát hiện vi phạm quy chế thi nghiêm trọng (Chuyển tab/Rời khỏi màn hình thi quá 3 lần).
            Bài thi của bạn đã bị khóa và kết quả làm bài tính đến thời điểm vi phạm đã được tự động nộp về hệ thống.
          </p>
          <div className="bg-white/5 rounded-[16px] p-4.5 border border-white/5 mb-6 text-left space-y-2">
            <p className="text-xs text-slate-400">Thông tin bài thi:</p>
            <p className="text-sm font-semibold text-slate-200">{assignment.title}</p>
            <p className="text-xs text-rose-400 font-medium">* Hệ thống đã ghi nhận log vi phạm và báo cáo giảng viên.</p>
          </div>
          <button
            onClick={() => navigate("/assignments")}
            className="w-full py-3.5 rounded-[16px] bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-all hover:shadow-lg active:scale-[0.98]"
          >
            Quay lại danh sách bài tập
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Already submitted — show results ──────────────────────────────────────
  const displaySubmission = existingSubmission ?? (submitted ? result : null);
  if (displaySubmission) {
    return (
      <ResultView
        submission={displaySubmission}
        questions={questions}
        assignmentTitle={assignment.title}
        isEssay={isEssay}
        onBack={() => navigate("/assignments")}
      />
    );
  }

  // ── Main quiz UI ───────────────────────────────────────────────────────────
  return (
    <>
      <div
        onCopy={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-mint-50/30 to-slate-100 flex flex-col select-none"
      >
        {/* Fixed Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate("/assignments")}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
            <span className="text-slate-200 hidden sm:inline">|</span>
            <h1 className="text-sm font-semibold text-slate-700 truncate flex-1 min-w-0">
              {assignment.title}
            </h1>
            {hasTimer && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-bold shrink-0 transition-colors ${
                  isTimeLow
                    ? "bg-rose-50 text-rose-600 border border-rose-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <Clock className={`w-3.5 h-3.5 ${isTimeLow ? "text-rose-500" : "text-slate-500"}`} />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-[1fr_280px] lg:gap-6 items-start space-y-4 lg:space-y-0">
            {/* Left: Questions Column */}
            <div className="space-y-4">
              
              {/* Banner Anti-Cheat Glassmorphic */}
              <div className="bg-rose-500/10 backdrop-blur-md border border-rose-500/20 rounded-[20px] p-4.5 flex items-center gap-3 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.1)]">
                <div className="w-8.5 h-8.5 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-rose-700 uppercase tracking-wide">HỆ THỐNG AN NINH CHỐNG GIAN LẬN ĐANG HOẠT ĐỘNG</p>
                  <p className="text-[11px] text-rose-600 font-medium mt-0.5 leading-relaxed">
                    Nghiêm cấm rời màn hình thi, chuyển tab hoặc sao chép/chụp màn hình. Vi phạm quá 3 lần bài làm sẽ bị khóa và nộp tự động.
                  </p>
                </div>
              </div>

              {/* Mobile Question Navigator */}
              {questions.length > 0 && (
                <div className="lg:hidden bg-white/70 backdrop-blur-sm rounded-[20px] border border-slate-100 p-4 shadow-sm space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Chọn nhanh câu hỏi:</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {questions.map((q, idx) => {
                      const isAnswered = !!answers[q.id]?.trim();
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => document.getElementById(`question-container-${q.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                          className={`h-9 w-9 rounded-[10px] border flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                            isAnswered
                              ? "bg-mint-500 border-mint-500 text-white shadow-sm"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Assignment info card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-[20px] border border-slate-100 p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-mint-50 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-mint-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-800 text-sm leading-snug">{assignment.title}</h2>
                    {assignment.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{assignment.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {assignment.className}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-mint-50 text-mint-700">
                        {questions.length} câu hỏi
                      </span>
                      {hasTimer && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                          {assignment.timeLimit} phút
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Questions */}
              {questions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Bài tập này chưa có câu hỏi.
                </div>
              ) : (
                questions.map((q, idx) =>
                  q.type === "multiple_choice" ? (
                    <motion.div
                      key={q.id}
                      id={`question-container-${q.id}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <MultipleChoiceQuestion
                        question={q}
                        index={idx}
                        selectedAnswer={answers[q.id]}
                        onChange={handleAnswerChange}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={q.id}
                      id={`question-container-${q.id}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <EssayQuestion
                        question={q}
                        index={idx}
                        value={answers[q.id] ?? ""}
                        onChange={handleAnswerChange}
                        attachments={fileAttachments[q.id] ?? []}
                        onAttachmentsChange={handleAttachmentsChange}
                      />
                    </motion.div>
                  )
                )
              )}
            </div>

            {/* Right: Sticky Sidebar Desktop question grid */}
            <div className="hidden lg:block sticky top-20 bg-white/80 backdrop-blur-sm rounded-[24px] border border-slate-100 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Bản đồ câu hỏi</h3>
                <p className="text-[10px] text-slate-400 leading-normal">Nhấp vào ô số để di chuyển nhanh tới câu hỏi tương ứng.</p>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = !!answers[q.id]?.trim();
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => document.getElementById(`question-container-${q.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                      className={`h-10 rounded-[12px] border flex items-center justify-center text-xs font-bold transition-all active:scale-95 ${
                        isAnswered
                          ? "bg-mint-500 border-mint-500 text-white shadow-sm shadow-mint-500/20"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Số câu hỏi:</span>
                  <span className="font-semibold text-slate-700">{questions.length} câu</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Số câu đã làm:</span>
                  <span className="font-semibold text-mint-600">{answeredCount} câu</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Số lần rời tab:</span>
                  <span className={`font-semibold ${tabSwitchCount > 0 ? "text-rose-500" : "text-slate-700"}`}>{tabSwitchCount}/3 lần</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 z-20 bg-white/90 backdrop-blur-md border-t border-slate-100 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            {/* Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500 font-medium">
                  {answeredCount}/{questions.length} câu đã trả lời
                </span>
                <span className="text-xs text-slate-400">{Math.round(progressPct)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-mint-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmitClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-mint-500 text-white text-sm font-semibold hover:bg-mint-600 active:scale-95 transition-all shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
              Nộp bài
            </button>
          </div>
        </div>
      </div>

      {/* File Upload Confirm Dialog (cho bài tự luận) */}
      <AnimatePresence>
        {showFileUploadDialog && (
          <FileUploadConfirmDialog
            assignmentTitle={assignment.title}
            onConfirm={handleFileUploadConfirm}
            onCancel={() => setShowFileUploadDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmDialog
            unansweredCount={unansweredCount}
            totalCount={questions.length}
            onConfirm={() => handleSubmit(false)}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 right-6 z-50 bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-[14px] shadow-lg flex items-center gap-2 border border-white/10"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-ping" />
            <span>Đã tự động lưu bản nháp bài làm...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning tab switch Modal */}
      <AnimatePresence>
        {showWarningModal && (
          <WarningModal
            count={tabSwitchCount}
            onConfirm={() => setShowWarningModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
