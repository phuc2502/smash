import React, { useMemo, useRef, useState } from "react";
import {
  Plus,
  Grid2X2,
  LayoutList,
  LibraryBig,
  LockOpen,
  FileEdit,
  Clock,
  MoreVertical,
  History,
  CheckCircle2,
  Zap,
  X,
  Calendar,
  AlertTriangle,
  Search,
  Layers,
  ClipboardList,
  ListFilter,
  PenLine,
  RotateCcw,
  Upload,
  FileText,
  Image,
  File,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { renderLatex } from "./OnlineQuizPage";
import { useAppContext } from "../context/AppContext";
import type { Assignment, Class, QuizQuestion } from "../context/AppContext";
import ActionColumn from "../components/common/ActionColumn";
import StatusBadge from "../components/common/StatusBadge";
import PaginatedList from "../components/common/PaginatedList";

function assignmentIsOverdue(a: Assignment, nowMs: number): boolean {
  if (!a.deadlineAt || a.progress >= a.total) return false;
  return new Date(a.deadlineAt).getTime() < nowMs;
}

function instructorFor(a: Assignment, classes: Class[]): string {
  return a.teacherName ?? classes.find((c) => c.id === a.classId)?.instructor ?? "—";
}

function relativeViFromDeadline(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (Math.abs(m) < 1) return "Vừa xong";
  if (m > 0) {
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  }
  const f = Math.abs(m);
  if (f < 60) return `Còn ${f} phút`;
  const h = Math.floor(f / 60);
  if (h < 24) return `Còn ${h} giờ`;
  return `Còn ${Math.floor(h / 24)} ngày`;
}

type AdminFilterStatus = "all" | "open" | "grading" | "overdue" | "active" | "submitted";
type TimePreset = "all" | "today" | "week" | "month";

function typePillClass(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("video")) return "bg-sky-50 text-sky-700 border-sky-100";
  if (t.includes("giáo án") || t.includes("giao an")) return "bg-cyan-50 text-cyan-700 border-cyan-100";
  if (t.includes("tự luận") || t.includes("tu luan")) return "bg-violet-50 text-violet-700 border-violet-100";
  if (t.includes("trắc nghiệm") || t.includes("trac nghiem")) return "bg-blue-50 text-blue-700 border-blue-100";
  return "bg-mint-50 text-mint-700 border-mint-100";
}

function rowStatusMeta(a: Assignment, nowMs: number): { label: string; className: string } {
  if (a.status === "Chờ chấm điểm") return { label: "Chờ chấm", className: "bg-mint-100 text-mint-800 border-mint-200/70" };
  if (a.progress >= a.total) return { label: "Đã nộp đủ", className: "bg-emerald-50 text-emerald-700 border-emerald-100" };
  if (assignmentIsOverdue(a, nowMs)) return { label: "Quá hạn", className: "bg-rose-50 text-rose-700 border-rose-100" };
  return { label: "Còn hạn", className: "bg-amber-50 text-amber-800 border-amber-100" };
}

function deadlineInPreset(a: Assignment, preset: TimePreset, now: Date): boolean {
  if (!a.deadlineAt || preset === "all") return true;
  const end = new Date(a.deadlineAt);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today0 = startOfDay(now);
  if (preset === "today") {
    return startOfDay(end) === today0;
  }
  if (preset === "week") {
    const ws = today0 - 1000 * 60 * 60 * 24 * 6;
    const t = end.getTime();
    return t >= ws && t <= now.getTime() + 86400000;
  }
  if (preset === "month") {
    return end.getMonth() === now.getMonth() && end.getFullYear() === now.getFullYear();
  }
  return true;
}

function deadlineInRange(a: Assignment, fromStr: string, toStr: string): boolean {
  if (!fromStr && !toStr) return true;
  if (!a.deadlineAt) return false;
  const d = new Date(a.deadlineAt).setHours(0, 0, 0, 0);
  if (fromStr) {
    const f = new Date(fromStr).setHours(0, 0, 0, 0);
    if (d < f) return false;
  }
  if (toStr) {
    const t = new Date(toStr).setHours(23, 59, 59, 999);
    if (d > t) return false;
  }
  return true;
}

type FormState = {
  title: string;
  description: string;
  classId: string;
  type: string;
  deadlineAt: string;
  total: string;
  isUrgent: boolean;
};

// Đại diện cho file đính kèm (lưu trong memory vì không có backend)
interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string; // base64 preview
}

const ACCEPTED_TYPES = ".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx";
const MAX_FILE_SIZE_MB = 10;

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType === "application/pdf") return FileText;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AssignmentsPage() {
  const navigate = useNavigate();
  const { assignments, addAssignment, deleteAssignment, classes, canAccess, currentAccount, classStudentMap, parentChildMap } = useAppContext();
  const isAdminView = canAccess("manage_users");
  const canManageAssignments = canAccess("manage_assignments") && currentAccount?.role !== "Admin";
  const canSubmitAssignment = canAccess("submit_assignment");
  const nowMs = Date.now();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const defaultClassId = classes[0]?.id ?? "";

  const [studentClassFilter, setStudentClassFilter] = useState("all");
  const [studentStatusFilter, setStudentStatusFilter] = useState("all");

  // Filter assignments based on the student's enrolled classes
  const visibleStudentAssignments = useMemo(() => {
    if (!currentAccount) return [];
    if (isAdminView) return assignments;

    const isStudent = currentAccount.role === "Học viên";
    const isParent = currentAccount.role === "Phụ huynh";

    if (isStudent) {
      const studentClassIds = Object.keys(classStudentMap).filter((classId) => {
        const ids: string[] = classStudentMap[classId] ?? [];
        return ids.includes(currentAccount.id);
      });
      return assignments.filter((a) => studentClassIds.includes(a.classId));
    }

    if (isParent) {
      const childrenIds: string[] = parentChildMap[currentAccount.id] ?? [];
      const parentClassIds = Object.keys(classStudentMap).filter((classId) => {
        const ids: string[] = classStudentMap[classId] ?? [];
        return ids.some((id) => childrenIds.includes(id));
      });
      return assignments.filter((a) => parentClassIds.includes(a.classId));
    }

    return assignments;
  }, [assignments, currentAccount, isAdminView, classStudentMap, parentChildMap]);

  // Dynamic class options derived from the student's visible assignments
  const studentClassOptions = useMemo(() => {
    const seen = new Map<string, string>(); // classId -> className
    visibleStudentAssignments.forEach((a) => {
      if (!seen.has(a.classId)) seen.set(a.classId, a.className);
    });
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1], "vi"));
  }, [visibleStudentAssignments]);

  // Apply student filters for non-admin views
  const filteredStudentAssignments = useMemo(() => {
    return visibleStudentAssignments.filter((a) => {
      if (studentClassFilter !== "all" && a.classId !== studentClassFilter) return false;
      if (studentStatusFilter !== "all") {
        if (studentStatusFilter === "Đang mở" && a.status !== "Đang mở") return false;
        if (studentStatusFilter === "Chờ chấm" && a.status !== "Chờ chấm điểm") return false;
      }
      return true;
    });
  }, [visibleStudentAssignments, studentClassFilter, studentStatusFilter]);

  const [formData, setFormData] = useState<FormState>({
    title: "",
    description: "",
    classId: defaultClassId,
    type: "Trắc nghiệm",
    deadlineAt: "",
    total: "30",
    isUrgent: false,
  });
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: `Q-${Date.now()}-0`,
      text: "",
      type: "multiple_choice",
      options: ["", "", "", ""],
      correctAnswer: "A",
    }
  ]);

  const addQuizQuestion = () => {
    setQuizQuestions(prev => [
      ...prev,
      {
        id: `Q-${Date.now()}-${prev.length}`,
        text: "",
        type: "multiple_choice",
        options: ["", "", "", ""],
        correctAnswer: "A",
      }
    ]);
  };

  const updateQuizQuestion = (index: number, updated: Partial<QuizQuestion>) => {
    setQuizQuestions(prev => prev.map((q, idx) => idx === index ? { ...q, ...updated } : q));
  };

  const updateQuizOption = (qIdx: number, optIdx: number, value: string) => {
    setQuizQuestions(prev => prev.map((q, idx) => {
      if (idx !== qIdx) return q;
      const newOptions = [...(q.options ?? ["", "", "", ""])] as [string, string, string, string];
      newOptions[optIdx] = value;
      return { ...q, options: newOptions };
    }));
  };

  const removeQuizQuestion = (index: number) => {
    if (quizQuestions.length <= 1) {
      setFileError("Phải có ít nhất 1 câu hỏi trắc nghiệm.");
      setTimeout(() => setFileError(""), 3000);
      return;
    }
    setQuizQuestions(prev => prev.filter((_, idx) => idx !== index));
  };

  React.useEffect(() => {
    setFormData((prev) =>
      prev.classId || !defaultClassId ? prev : { ...prev, classId: defaultClassId },
    );
  }, [defaultClassId]);

  /* ── Admin filters ───────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<AdminFilterStatus>("all");
  const [filterClass, setFilterClass] = useState("all");
  const [filterTeacher, setFilterTeacher] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [timePreset, setTimePreset] = useState<TimePreset>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const teacherOptions = useMemo(() => {
    const s = new Set<string>();
    assignments.forEach((a) => {
      const t = instructorFor(a, classes);
      if (t && t !== "—") s.add(t);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b, "vi"));
  }, [assignments, classes]);

  const classOptions = useMemo(() => {
    const s = new Set<string>(assignments.map((a) => a.className));
    return Array.from(s).sort((a, b) => a.localeCompare(b, "vi"));
  }, [assignments]);

  const typeOptions = useMemo(() => {
    const s = new Set<string>(assignments.map((a) => a.type));
    return Array.from(s).sort((a, b) => a.localeCompare(b, "vi"));
  }, [assignments]);

  const filteredAdmin = useMemo(() => {
    const now = new Date();
    const q = searchQuery.trim().toLowerCase();
    return assignments.filter((a) => {
      if (q && !`${a.title} ${a.description ?? ""}`.toLowerCase().includes(q)) return false;
      if (filterClass !== "all" && a.className !== filterClass) return false;
      if (filterTeacher !== "all" && instructorFor(a, classes) !== filterTeacher) return false;
      if (filterType !== "all" && a.type !== filterType) return false;
      if (!deadlineInPreset(a, timePreset, now)) return false;
      if (!deadlineInRange(a, fromDate, toDate)) return false;

      if (filterStatus === "open" && a.status !== "Đang mở") return false;
      if (filterStatus === "grading" && a.status !== "Chờ chấm điểm") return false;
      if (filterStatus === "overdue" && !assignmentIsOverdue(a, Date.now())) return false;
      if (
        filterStatus === "active" &&
        !(a.status === "Đang mở" && !assignmentIsOverdue(a, Date.now()) && a.progress < a.total)
      )
        return false;
      if (filterStatus === "submitted" && !(a.progress >= a.total)) return false;
      return true;
    });
  }, [
    assignments,
    searchQuery,
    filterClass,
    filterTeacher,
    filterType,
    timePreset,
    fromDate,
    toDate,
    filterStatus,
    classes,
  ]);

  const adminStats = useMemo(() => {
    const total = assignments.length;
    const needWork = assignments.filter(
      (a) => a.status === "Đang mở" && a.progress < a.total,
    ).length;
    const overdueCount = assignments.filter((a) => assignmentIsOverdue(a, Date.now())).length;
    const submittedDone = assignments.filter((a) => a.progress >= a.total).length;
    return [
      {
        label: "Danh sách bài tập",
        sub: `${total} tổng bài tập`,
        value: `${total}`,
        icon: ClipboardList,
        shell: "from-sky-500/90 to-blue-600",
        badge: "bg-sky-100 text-sky-700",
      },
      {
        label: "Cần làm",
        sub: `${needWork} bài đang chờ nộp`,
        value: `${needWork}`,
        icon: ListFilter,
        shell: "from-amber-400 to-amber-500",
        badge: "bg-amber-100 text-amber-800",
      },
      {
        label: "Quá hạn",
        sub: `${overdueCount} bài đã quá hạn`,
        value: `${overdueCount}`,
        icon: AlertTriangle,
        shell: "from-rose-500 to-rose-600",
        badge: "bg-rose-100 text-rose-700",
      },
      {
        label: "Đã nộp đủ",
        sub: `${submittedDone} bài hoàn thành nộp`,
        value: `${submittedDone}`,
        icon: CheckCircle2,
        shell: "from-emerald-500 to-teal-600",
        badge: "bg-emerald-100 text-emerald-800",
      },
    ];
  }, [assignments]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []) as File[];
    setFileError("");
    const newFiles: AttachedFile[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setFileError(`File "${file.name}" vượt quá ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachedFiles(prev => [...prev, {
          id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: ev.target?.result as string,
        }]);
      };
      reader.readAsDataURL(file);
      newFiles.push({ id: '', name: file.name, size: file.size, type: file.type, dataUrl: '' });
    }
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find((c) => c.id === formData.classId);
    const id = `ASG-${Math.floor(Math.random() * 9000 + 1000)}`;
    let deadline = formData.deadlineAt
      ? new Date(formData.deadlineAt).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Chưa xác định";
    const deadlineAtIso = formData.deadlineAt ? new Date(formData.deadlineAt).toISOString() : undefined;

    const asgQuestions: QuizQuestion[] = formData.type === "Trắc nghiệm"
      ? quizQuestions.map((q, idx) => ({
          ...q,
          id: `Q-${Date.now()}-${idx}`,
        }))
      : [
          {
            id: `Q-${Date.now()}-0`,
            text: formData.description.trim() || formData.title,
            type: "essay",
          },
        ];

    addAssignment({
      id,
      title: formData.title || "Bài tập mới",
      description: formData.description.trim() || undefined,
      type: formData.type,
      typeColor: "mint",
      status: "Đang mở",
      classId: formData.classId,
      className: cls?.title ?? formData.classId,
      teacherName: cls?.instructor,
      progress: 0,
      total: parseInt(formData.total, 10) || 30,
      deadline,
      deadlineAt: deadlineAtIso,
      isUrgent: formData.isUrgent,
      questions: asgQuestions,
    });
    setIsModalOpen(false);
    setFormData({
      title: "",
      description: "",
      classId: defaultClassId,
      type: "Trắc nghiệm",
      deadlineAt: "",
      total: "30",
      isUrgent: false,
    });
    setQuizQuestions([
      {
        id: `Q-${Date.now()}-0`,
        text: "",
        type: "multiple_choice",
        options: ["", "", "", ""],
        correctAnswer: "A",
      }
    ]);
    setAttachedFiles([]);
    setFileError("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAttachedFiles([]);
    setFileError("");
    setQuizQuestions([
      {
        id: `Q-${Date.now()}-0`,
        text: "",
        type: "multiple_choice",
        options: ["", "", "", ""],
        correctAnswer: "A",
      }
    ]);
  };

  const resetAdminFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setFilterClass("all");
    setFilterTeacher("all");
    setFilterType("all");
    setTimePreset("all");
    setFromDate("");
    setToDate("");
  };

  const stats = [
    {
      label: "Tổng số bài tập",
      value: visibleStudentAssignments.length.toString(),
      icon: LibraryBig,
      color: "mint" as const,
      trend: "+12% so với tháng trước",
    },
    {
      label: "Bài tập đang mở",
      value: visibleStudentAssignments.filter((a) => a.status === "Đang mở").length.toString(),
      icon: LockOpen,
      color: "mint" as const,
      sub: "Tiến độ đạt 65%",
      progress: true,
    },
    {
      label: "Cần chấm điểm",
      value: visibleStudentAssignments.filter((a) => a.status === "Chờ chấm điểm").length.toString(),
      icon: FileEdit,
      color: "mint" as const,
      sub: "Ưu tiên cao",
      alert: true,
    },
  ];

  const colorMap = {
    mint: { bgLight: "bg-mint-50", text: "text-mint-500" },
    rose: { bgLight: "bg-rose-50", text: "text-rose-500" },
    slate: { bgLight: "bg-slate-50", text: "text-slate-500" },
  } as const;

  return (
    <div className="space-y-10 pb-20">
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => closeModal()}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative bg-white w-full ${formData.type === "Trắc nghiệm" ? "max-w-3xl" : "max-w-xl"} rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col transition-all duration-300`}
            >
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[20px] bg-mint-500 text-white flex items-center justify-center shadow-lg shadow-mint-100">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Tạo Bài tập Mới</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                      Hệ thống quản lý SMASH Math
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => closeModal()}
                  className="p-3 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-8 space-y-6 overflow-y-auto flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">
                    Tiêu đề bài tập
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="VD: Ôn tập Chương 1 - Số học 6"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 focus:bg-white transition-all outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">
                    Mô tả ngắn (tuỳ chọn)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="GV và admin xem được trong danh sách."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-medium placeholder:text-slate-300 focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 focus:bg-white transition-all outline-none resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">
                      Lớp học
                    </label>
                    <select
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 focus:bg-white transition-all outline-none"
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">
                      Loại bài tập
                    </label>
                    <select
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 focus:bg-white transition-all outline-none"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option>Trắc nghiệm</option>
                      <option>Tự luận</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">
                      Hạn nộp
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        required
                        type="datetime-local"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 focus:bg-white transition-all outline-none"
                        value={formData.deadlineAt}
                        onChange={(e) => setFormData({ ...formData, deadlineAt: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">
                      Tổng số bài phải nộp / học viên
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 focus:bg-white transition-all outline-none"
                      value={formData.total}
                      onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.isUrgent}
                        onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                      />
                      <div
                        className={`w-12 h-6 rounded-full transition-colors ${
                          formData.isUrgent ? "bg-mint-500" : "bg-slate-200"
                        }`}
                      ></div>
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          formData.isUrgent ? "translate-x-6" : ""
                        }`}
                      ></div>
                    </div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-mint-600 transition-colors">
                      Đánh dấu khẩn cấp
                    </span>
                  </label>
                  {formData.isUrgent && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 text-[10px] font-black text-mint-600 bg-mint-50 px-2 py-0.5 rounded-full border border-mint-100"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      QUAN TRỌNG
                    </motion.div>
                  )}
                </div>

                {/* ── Quiz Questions Builder (Google Forms Style) ── */}
                {formData.type === "Trắc nghiệm" && (
                  <div className="space-y-6 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <h4 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-mint-500" />
                          Thiết lập Đề trắc nghiệm
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          Tự soạn thảo câu hỏi & đáp án
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addQuizQuestion}
                        className="px-4 py-2.5 bg-mint-500 hover:bg-mint-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-mint-100 active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm câu hỏi
                      </button>
                    </div>

                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-1">
                      {quizQuestions.map((q, qIdx) => (
                        <div
                          key={q.id}
                          className="p-5 bg-slate-50/60 rounded-3xl border-2 border-slate-100/80 space-y-4 hover:border-mint-200 hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 transition-all relative group/q"
                        >
                          {/* Question Header */}
                          <div className="flex justify-between items-center">
                            <span className="px-3 py-1 bg-mint-50 text-mint-600 border border-mint-100 rounded-full text-xs font-black shadow-sm">
                              Câu {qIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeQuizQuestion(qIdx)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 opacity-0 group-hover/q:opacity-100 transition-all cursor-pointer"
                              title="Xóa câu hỏi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Question Text Area */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                              Nội dung câu hỏi
                            </label>
                            <textarea
                              required
                              rows={2}
                              placeholder="Nhập đề bài câu hỏi trắc nghiệm... VD: Tìm giá trị của x trong căn thức \sqrt{x - 2} = 3"
                              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-medium focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all resize-none"
                              value={q.text}
                              onChange={(e) => updateQuizQuestion(qIdx, { text: e.target.value })}
                            />
                            {q.text.trim().length > 0 && (
                              <div className="bg-mint-50/20 backdrop-blur-sm border border-mint-100 rounded-2xl p-3 space-y-1">
                                <p className="text-[9px] font-black text-mint-600 uppercase tracking-wider">
                                  LaTeX Preview:
                                </p>
                                <div
                                  className="text-slate-800 text-xs font-semibold leading-relaxed break-words pt-0.5"
                                  dangerouslySetInnerHTML={{ __html: renderLatex(q.text) }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Answer Options Grid */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">
                              4 Phương án trả lời & đáp án
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {["A", "B", "C", "D"].map((opt, optIdx) => (
                                <div
                                  key={opt}
                                  className={`flex items-center gap-3 bg-white p-2 rounded-2xl border-2 transition-all ${
                                    q.correctAnswer === opt
                                      ? "border-mint-500 bg-mint-50/10"
                                      : "border-slate-100 focus-within:border-mint-400"
                                  }`}
                                >
                                  <span
                                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black border transition-colors ${
                                      q.correctAnswer === opt
                                        ? "bg-mint-500 border-mint-500 text-white shadow-sm"
                                        : "bg-slate-50 border-slate-200 text-slate-500"
                                    }`}
                                  >
                                    {opt}
                                  </span>
                                  <input
                                    required
                                    type="text"
                                    placeholder={`Đáp án ${opt}...`}
                                    className="flex-1 bg-transparent text-sm font-semibold outline-none py-1 border-0 focus:ring-0 px-1"
                                    value={q.options?.[optIdx] ?? ""}
                                    onChange={(e) => updateQuizOption(qIdx, optIdx, e.target.value)}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateQuizQuestion(qIdx, { correctAnswer: opt as "A" | "B" | "C" | "D" })}
                                    className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                                      q.correctAnswer === opt
                                        ? "bg-mint-500 text-white font-black"
                                        : "bg-slate-50 text-slate-400 hover:text-mint-600 hover:bg-mint-50"
                                    }`}
                                  >
                                    Đúng
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── File Upload ── */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">
                    Đính kèm tài liệu (ảnh / PDF / Word)
                  </label>

                  {/* Drop zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-mint-400 hover:bg-mint-50/30 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-mint-100 flex items-center justify-center transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-mint-600 transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-600 group-hover:text-mint-700 transition-colors">
                        Nhấn để chọn file
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        JPG, PNG, PDF, DOC, DOCX, PPT — tối đa {MAX_FILE_SIZE_MB}MB/file
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={ACCEPTED_TYPES}
                      className="sr-only"
                      onChange={handleFileSelect}
                    />
                  </div>

                  {fileError && (
                    <p className="text-xs text-rose-600 font-semibold px-1">{fileError}</p>
                  )}

                  {/* File list */}
                  {attachedFiles.length > 0 && (
                    <div className="space-y-2">
                      {attachedFiles.map((file) => {
                        const IconComp = getFileIcon(file.type);
                        const isImage = file.type.startsWith("image/");
                        return (
                          <div key={file.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group/file">
                            {isImage ? (
                              <img
                                src={file.dataUrl}
                                alt={file.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                                <IconComp className="w-5 h-5 text-slate-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                              <p className="text-[11px] text-slate-400">{formatFileSize(file.size)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="p-1.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover/file:opacity-100 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-mint-100 hover:shadow-2xl hover:shadow-mint-200 hover:-translate-y-0.5 transition-all"
                  >
                    Phát hành Bài tập
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isAdminView ? (
        <>
          {/* Page header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Danh sách bài tập</h1>
            </div>
            {canManageAssignments && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="shrink-0 w-full lg:w-auto bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-full py-3.5 px-8 font-black text-sm shadow-xl shadow-mint-100 flex items-center justify-center gap-3 transition-all"
              >
                <Plus className="w-5 h-5" />
                Tạo bài tập mới
              </motion.button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[24px] border border-slate-100 shadow-sm shadow-slate-200/40 p-5 md:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="space-y-1.5 xl:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-mint-600">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Theo tiêu đề hoặc mô tả ngắn..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-3 text-sm font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-mint-500/20 focus:border-mint-400/40"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-mint-600">Trạng thái</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as AdminFilterStatus)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-mint-500/20"
                >
                  <option value="all">Tất cả</option>
                  <option value="open">Đang mở</option>
                  <option value="grading">Chờ chấm điểm</option>
                  <option value="overdue">Quá hạn</option>
                  <option value="active">Còn hạn</option>
                  <option value="submitted">Đã nộp đủ</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-mint-600">Lớp học</label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-mint-500/20"
                >
                  <option value="all">Tất cả</option>
                  {classOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-mint-600">Giáo viên</label>
                <select
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-mint-500/20"
                >
                  <option value="all">Tất cả</option>
                  {teacherOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-mint-600">Loại bài tập</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-mint-500/20"
                >
                  <option value="all">Tất cả</option>
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-4 flex-wrap">
              <div className="space-y-1.5 min-w-[160px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-mint-600">Khoảng thời gian</label>
                <select
                  value={timePreset}
                  onChange={(e) => setTimePreset(e.target.value as TimePreset)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-mint-500/20"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">7 ngày qua</option>
                  <option value="month">Tháng này</option>
                </select>
              </div>
              <div className="space-y-1.5 min-w-[160px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-mint-600">Từ ngày</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-mint-500/20"
                />
              </div>
              <div className="space-y-1.5 min-w-[160px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-mint-600">Đến ngày</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-mint-500/20"
                />
              </div>
              <button
                type="button"
                onClick={resetAdminFilters}
                className="md:ml-auto inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Đặt lại bộ lọc
              </button>
            </div>
          </div>



          {/* Grid-based Responsive List */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-800">
                <Layers className="w-5 h-5 text-mint-600" />
                <h2 className="font-black text-lg tracking-tight">Bảng tổng hợp</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Hiển thị {filteredAdmin.length} / {assignments.length} bài · dữ liệu mẫu theo vai trò quản trị
              </p>
            </div>
            
            {/* Table Head */}
            <div className="hidden lg:grid lg:grid-cols-[3fr_1.2fr_1.8fr_1.2fr_2fr_1.2fr] gap-4 px-8 py-4 bg-slate-50/50 border-b border-slate-100 items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div>Tiêu đề</div>
              <div>Lớp học</div>
              <div>Giáo viên</div>
              <div>Loại bài tập</div>
              <div>Hạn nộp</div>
              <div>Trạng thái</div>
            </div>

            <PaginatedList<Assignment>
              items={filteredAdmin}
              pageSize={10}
              mode="pagination"
              renderEmpty={() => (
                <div className="py-16 text-center text-slate-400 text-sm font-medium">
                  Không có bài nào khớp bộ lọc
                </div>
              )}
              renderItem={(a, idx) => {
                const teacher = instructorFor(a, classes);
                const rs = rowStatusMeta(a, nowMs);

                return (
                  <div
                    key={a.id}
                    className="grid grid-cols-1 lg:grid-cols-[3fr_1.2fr_1.8fr_1.2fr_2fr_1.2fr] gap-4 px-8 py-6 items-center hover:bg-mint-50/20 transition-all duration-300 border-b border-slate-50 last:border-b-0"
                  >
                    {/* Mobile title indicator */}
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900 leading-snug text-sm">{a.title}</p>
                      {(a.description || "").length > 0 && (
                        <p className="text-xs text-slate-500 line-clamp-2 font-medium">{a.description}</p>
                      )}
                    </div>

                    <div className="flex items-center">
                      <span className="inline-flex text-[10px] font-black px-2.5 py-1 rounded-lg bg-mint-50 text-mint-700 border border-mint-200/40 uppercase tracking-widest">
                        {a.className}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-600 truncate max-w-[180px]">
                      {teacher}
                    </div>

                    <div className="flex items-center">
                      <StatusBadge type="assignment_type" value={a.type} />
                    </div>

                    <div className="whitespace-nowrap flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {a.deadlineAt
                            ? new Date(a.deadlineAt).toLocaleString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : a.deadline}
                        </span>
                      </div>
                      {a.deadlineAt && (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-5">
                          {relativeViFromDeadline(a.deadlineAt)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center">
                      <StatusBadge type="status" value={rs.label} />
                    </div>


                  </div>
                );
              }}
            />
          </div>
        </>
      ) : (
        <>
          {/* Teacher / non-admin: layout cũ */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/80 backdrop-blur-xl p-5 rounded-[24px] border border-slate-100 shadow-sm shadow-slate-200/50">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <select
                  value={studentClassFilter}
                  onChange={(e) => setStudentClassFilter(e.target.value)}
                  className="appearance-none bg-slate-50 text-slate-800 text-sm font-black py-3 pl-5 pr-12 rounded-2xl border-none focus:ring-2 focus:ring-mint-500/10 cursor-pointer outline-none"
                >
                  <option value="all">Tất cả lớp học</option>
                  {studentClassOptions.map(([classId, className]) => (
                    <option key={classId} value={classId}>{className}</option>
                  ))}
                </select>
                <Zap className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-mint-500 transition-colors pointer-events-none" />
              </div>
              <div className="relative group">
                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                  className="appearance-none bg-slate-50 text-slate-800 text-sm font-black py-3 pl-5 pr-12 rounded-2xl border-none focus:ring-2 focus:ring-mint-500/10 cursor-pointer outline-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="Đang mở">Đang mở</option>
                  <option value="Chờ chấm">Chờ chấm</option>
                </select>
                <History className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-mint-500 transition-colors pointer-events-none" />
              </div>
            </div>
            {canManageAssignments && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-full py-3.5 px-8 font-black text-sm shadow-xl shadow-mint-100 flex items-center justify-center gap-3 transition-all"
              >
                <Plus className="w-5 h-5" />
                Tạo bài tập mới
              </motion.button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-xl p-7 rounded-[32px] border border-slate-100 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3
                      className={`text-4xl font-black ${
                        "alert" in stat && stat.alert ? "text-mint-500" : "text-slate-900"
                      } leading-none`}
                    >
                      {stat.value}
                    </h3>
                  </div>
                  <div
                    className={`w-11 h-11 rounded-2xl ${colorMap[stat.color].bgLight} ${colorMap[stat.color].text} flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                {"progress" in stat && stat.progress ? (
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-mint-500 h-full rounded-full" style={{ width: "65%" }}></div>
                  </div>
                ) : (
                  <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        "alert" in stat && stat.alert ? "bg-mint-500 animate-pulse" : "bg-mint-500"
                      }`}
                    ></span>
                    <span className="text-mint-600">
                      {"trend" in stat ? stat.trend : "sub" in stat ? stat.sub : ""}
                    </span>
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Danh sách Bài tập</h2>
              <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-white text-mint-600 shadow-sm flex items-center justify-center transition-all"
                >
                  <Grid2X2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>

            <PaginatedList<Assignment>
              items={filteredStudentAssignments}
              pageSize={9}
              mode="lazy_load"
              listClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 !divide-y-0"
              renderItem={(asgn, i) => (
                <div
                  key={asgn.id}
                  className="bg-white/80 backdrop-blur-xl rounded-[32px] p-7 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col group min-h-[360px] h-full"
                >
                  <div className="flex justify-between items-start mb-6">
                    <StatusBadge type="status" value={asgn.status} />
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${typePillClass(asgn.type)}`}>
                      {asgn.type}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-mint-600 transition-colors line-clamp-2">
                    {asgn.title}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                    {asgn.className}
                  </p>

                  <div className="bg-slate-50/50 rounded-[20px] p-5 mb-6 mt-auto border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Tiến độ nộp bài
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {asgn.progress}/{asgn.total}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.min(100, (asgn.progress / Math.max(asgn.total, 1)) * 100)}%` }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="h-full rounded-full bg-mint-500"
                      ></motion.div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 text-xs font-black uppercase tracking-widest mb-8 ${
                      asgn.isUrgent ? "text-rose-500" : "text-slate-400"
                    }`}
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    <div className="flex flex-col">
                      <span>
                        {asgn.deadlineAt
                          ? new Date(asgn.deadlineAt).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : asgn.deadline}
                      </span>
                      {asgn.deadlineAt && (
                        <span className="text-[10px] font-medium normal-case tracking-normal text-slate-400 mt-0.5">
                          {relativeViFromDeadline(asgn.deadlineAt)}
                        </span>
                      )}
                    </div>
                    {asgn.isUrgent && (
                      <span className="ml-auto text-[10px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full animate-pulse">
                        KHẨN
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-6 border-t border-slate-100">
                    {canSubmitAssignment && asgn.status === "Đang mở" ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/assignments/take/${asgn.id}`)}
                        className="flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-gradient-to-r from-mint-600 to-mint-400 text-white shadow-lg shadow-mint-100 hover:brightness-110 flex items-center justify-center gap-2"
                      >
                        <ClipboardList className="w-4 h-4" />
                        Làm bài
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={canSubmitAssignment && asgn.status === "Chờ chấm điểm"}
                        className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          asgn.status === "Chờ chấm điểm"
                            ? canSubmitAssignment
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-default"
                              : "bg-gradient-to-r from-mint-600 to-mint-400 text-white shadow-lg shadow-mint-100 hover:brightness-110"
                            : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                        onClick={() => {
                          if (asgn.status === "Chờ chấm điểm") {
                            if (!canSubmitAssignment) {
                              navigate("/grading");
                            }
                          } else {
                            navigate(`/assignments/take/${asgn.id}`);
                          }
                        }}
                      >
                        {asgn.status === "Chờ chấm điểm"
                          ? canSubmitAssignment
                            ? "Đã làm"
                            : "Chấm điểm ngay"
                          : "Xem kết quả"}
                      </button>
                    )}
                    <button
                      type="button"
                      className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-300 hover:text-slate-900 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}
