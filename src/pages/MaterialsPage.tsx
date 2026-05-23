import React, { useState, useMemo } from "react";
import {
  FolderOpen,
  Search,
  Upload,
  FileText,
  Eye,
  EyeOff,
  Download,
  Plus,
  FileCode,
  Presentation,
  Check,
  X,
  Calendar,
  User,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Image as ImageIcon,
  Edit,
  Trash2,
  CheckCircle2,
  FolderLock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext, Material, Class, RoleKey } from "../context/AppContext";
import ActionColumn from "../components/common/ActionColumn";
import PaginatedList from "../components/common/PaginatedList";

export default function MaterialsPage() {
  const {
    materials,
    classes,
    classStudentMap,
    parentChildMap,
    currentAccount,
    canAccess,
    addMaterial,
    updateMaterial,
    deleteMaterial
  } = useAppContext();

  // Role Checks based on Current Account
  const roleLabels: Record<string, RoleKey> = {
    "Chủ trung tâm": "owner",
    "Quản lý": "manager",
    "Nhân viên hành chính": "admin_staff",
    "Admin": "admin",
    "Giáo viên": "teacher",
    "Học viên": "student",
    "Phụ huynh": "parent"
  };
  const roleKey = currentAccount ? (roleLabels[currentAccount.role] ?? "student") : "student";

  const isAdmin = roleKey === "admin" || roleKey === "owner" || roleKey === "manager";
  const isTeacher = roleKey === "teacher";
  const isStudent = roleKey === "student";
  const isParent = roleKey === "parent";

  // Permissions
  const canUploadAndManage = isTeacher;

  // Filters State
  const [selectedClassId, setSelectedClassId] = useState<string | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Form State for Upload
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadClassId, setUploadClassId] = useState("");
  const [uploadCategory, setUploadCategory] = useState<"review" | "knowledge" | "extra_reading">("knowledge");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form State for Edit
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editClassId, setEditClassId] = useState("");
  const [editCategory, setEditCategory] = useState<"review" | "knowledge" | "extra_reading">("knowledge");
  const [editError, setEditError] = useState<string | null>(null);

  // Success Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Get schedule ca hoc code helper
  const getClassSlotCode = (cls: Class) => {
    const mapping: Record<string, string> = {
      "MATH-06-01": "T2H79",
      "MATH-07-02": "T3H80",
      "MATH-09-EX": "T7H81",
      "MATH-06-02": "T3H82",
      "MATH-07-01": "T2H83",
      "MATH-08-01": "T6H84",
      "MATH-08-02": "T3H85",
      "MATH-09-01": "T2H86",
    };
    return mapping[cls.id] || "T2H79";
  };

  // 2. Class visibility based on user enrollment / role
  const userClasses = useMemo(() => {
    if (isStudent && currentAccount) {
      // Students see only their own enrolled classes
      return classes.filter(c => {
        const studentIds = classStudentMap[c.id] ?? [];
        return studentIds.includes(currentAccount.id);
      });
    }

    if (isParent && currentAccount) {
      // Parents see classes of all their children linked
      const childrenIds = parentChildMap[currentAccount.id] ?? [];
      return classes.filter(c => {
        const studentIds = classStudentMap[c.id] ?? [];
        return studentIds.some(id => childrenIds.includes(id));
      });
    }

    // Admins and Teachers see all classes
    return classes;
  }, [currentAccount, classes, classStudentMap, parentChildMap, isStudent, isParent]);

  // 3. RBAC Visible Materials Filter
  const visibleMaterials = useMemo(() => {
    const visibleClassIds = userClasses.map(c => c.id);

    return materials.filter(m => {
      // Students and Parents only see materials for their visible classes
      if (isStudent || isParent) {
        if (!visibleClassIds.includes(m.classId)) return false;
        // Non-staff only see approved and non-hidden documents
        if (m.isHidden || m.isApproved === false) return false;
      }
      return true;
    });
  }, [materials, userClasses, isStudent, isParent]);

  // 4. Filtered materials for UI search & tab selection
  const filteredMaterials = useMemo(() => {
    return visibleMaterials.filter(m => {
      const matchesClass = selectedClassId === "all" || m.classId === selectedClassId;
      const matchesCategory = selectedCategory === "all" || m.category === selectedCategory;

      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClass && matchesCategory && matchesSearch;
    });
  }, [visibleMaterials, selectedClassId, selectedCategory, searchQuery]);

  // Document Count per Class Map
  const classDocCount = useMemo(() => {
    const counts: Record<string, number> = {};
    visibleMaterials.forEach(m => {
      counts[m.classId] = (counts[m.classId] || 0) + 1;
    });
    return counts;
  }, [visibleMaterials]);

  // Icons mapper for file types
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return <FileText className="w-6 h-6 text-rose-500" />;
    if (mimeType.includes("word") || mimeType.includes("document")) return <FileCode className="w-6 h-6 text-sky-500" />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("sheet")) return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />;
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return <Presentation className="w-6 h-6 text-amber-500" />;
    if (mimeType.includes("image")) return <ImageIcon className="w-6 h-6 text-purple-500" />;
    return <FileText className="w-6 h-6 text-slate-500" />;
  };

  // Date formatter
  const formatDateString = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return "Chưa rõ";
    }
  };

  // File size formatter
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // File type short extension picker
  const getFileExtension = (fileName: string) => {
    const parts = fileName.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE";
  };

  // Upload validation & action handler
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validations
    if (!uploadTitle.trim()) {
      setValidationError("Tên tài liệu không được để trống.");
      return;
    }
    if (!uploadClassId) {
      setValidationError("Vui lòng chọn một lớp học liên kết.");
      return;
    }
    if (!selectedFile) {
      setValidationError("Vui lòng chọn một tệp tài liệu để tải lên.");
      return;
    }

    const allowedExtensions = ["pdf", "docx", "xlsx", "pptx", "jpg", "png"];
    const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      setValidationError("Định dạng tệp không được hỗ trợ. Chỉ cho phép các định dạng: PDF, DOCX, XLSX, PPTX, JPG, PNG.");
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setValidationError("Dung lượng tệp vượt quá giới hạn cho phép (Tối đa 50MB).");
      return;
    }

    // Add Material to Context
    addMaterial({
      title: uploadTitle.trim(),
      description: uploadDescription.trim(),
      classId: uploadClassId,
      category: uploadCategory,
      file_size_bytes: selectedFile.size,
      mime_type: selectedFile.type || `application/${fileExt}`,
      fileName: selectedFile.name,
    });

    // Reset Form & close
    setUploadTitle("");
    setUploadDescription("");
    setUploadClassId("");
    setUploadCategory("knowledge");
    setSelectedFile(null);
    setIsUploadOpen(false);

    triggerToast("Tải lên tài liệu học tập thành công!");
  };

  // Edit validation & action handler
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!selectedMaterial) return;

    if (!editTitle.trim()) {
      setEditError("Tên tài liệu không được để trống.");
      return;
    }
    if (!editClassId) {
      setEditError("Vui lòng chọn một lớp học liên kết.");
      return;
    }

    // Update Material in Context
    updateMaterial(selectedMaterial.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      classId: editClassId,
      category: editCategory,
    });

    setIsEditOpen(false);
    setSelectedMaterial(null);
    triggerToast("Cập nhật thông tin tài liệu thành công!");
  };

  const handleOpenEdit = (doc: Material) => {
    setSelectedMaterial(doc);
    setEditTitle(doc.title);
    setEditDescription(doc.description);
    setEditClassId(doc.classId);
    setEditCategory(doc.category);
    setIsEditOpen(true);
  };

  // Admin Approval/Visibility Moderation
  const handleToggleHide = (doc: Material) => {
    updateMaterial(doc.id, { isHidden: !doc.isHidden });
    triggerToast(doc.isHidden ? "Đã hiện thị tài liệu công khai!" : "Đã ẩn tài liệu khỏi học sinh/phụ huynh!");
  };

  const handleToggleApprove = (doc: Material) => {
    updateMaterial(doc.id, { isApproved: !doc.isApproved });
    triggerToast(doc.isApproved ? "Đã gỡ kiểm duyệt tài liệu!" : "Đã phê duyệt tài liệu thành công!");
  };

  // Tabs structure
  const categories = [
    { value: "all", label: "Tất cả tài liệu" },
    { value: "knowledge", label: "Kiến thức" },
    { value: "review", label: "Tổng ôn" },
    { value: "extra_reading", label: "Đọc thêm" },
  ];

  return (
    <div className="space-y-10 pb-20 relative">
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

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mt-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none"
          >
            Tài liệu Học tập
          </motion.h1>
          <p className="text-slate-400 text-sm font-medium mt-2">
            Hệ thống quản lý, phân chia và tải xuống học liệu lớp học
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-mint-600 transition-colors z-10" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all placeholder:text-slate-400 font-medium shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {canUploadAndManage && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-mint-600 to-mint-500 hover:from-mint-500 hover:to-mint-400 text-white font-black text-sm shadow-lg shadow-mint-500/10 hover:shadow-mint-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Upload className="w-4.5 h-4.5" />
              Đăng tài liệu mới
            </button>
          )}
        </div>
      </div>

      {/* Directory Folders Structure */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-mint-50 text-mint-600">
              <FolderOpen className="w-5 h-5" />
            </div>
            Phân loại theo lớp học
          </h2>
          {selectedClassId !== "all" && (
            <button
              onClick={() => setSelectedClassId("all")}
              className="text-xs font-bold text-mint-600 hover:text-mint-700 flex items-center gap-1 transition-colors"
            >
              Xem tất cả lớp học
            </button>
          )}
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userClasses.map(cls => {
            const count = classDocCount[cls.id] || 0;
            const slotCode = getClassSlotCode(cls);
            const isSelected = selectedClassId === cls.id;
            const cleanId = cls.id.replace(/-/g, "");

            // MATH06 (Toán 6 - Nâng cao) - T2H79 - 15 tài liệu
            const displayTitle = `${cleanId} (${cls.title}) - ${slotCode} - ${count} tài liệu`;

            return (
              <motion.div
                key={cls.id}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => setSelectedClassId(isSelected ? "all" : cls.id)}
                className={`relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden group select-none flex items-center gap-4 ${
                  isSelected
                    ? "bg-gradient-to-br from-mint-50 to-white border-mint-300 shadow-md shadow-mint-100/50"
                    : "bg-white border-slate-100 hover:border-mint-200 hover:shadow-lg hover:shadow-slate-100"
                }`}
              >
                <div className={`p-3 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                  isSelected ? "bg-white shadow-sm text-mint-600" : "bg-mint-50 text-mint-600 group-hover:scale-105"
                }`}>
                  <FolderOpen className="w-6 h-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-slate-800 text-sm group-hover:text-mint-600 transition-colors truncate">
                    {displayTitle}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Ca học: {slotCode} · Mã: {cls.id}
                  </p>
                </div>

                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-mint-500 text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          {userClasses.length === 0 && (
            <div className="col-span-full bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
              <FolderOpen className="w-10 h-10 mx-auto opacity-30 mb-3" />
              <p className="font-bold text-sm">Không tìm thấy thư mục lớp học nào</p>
              <p className="text-xs mt-1">Lớp học của bạn chưa được liên kết tài liệu nào.</p>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filter and Document Listing */}
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-mint-50 text-mint-600">
              <FileText className="w-5 h-5" />
            </div>
            Danh mục tài liệu {selectedClassId !== "all" && `Lớp ${selectedClassId.replace(/-/g, "")}`}
          </h2>

          {/* Premium Tab Bar for Category Selection */}
          <div className="bg-slate-100/80 p-1 rounded-2xl flex items-center gap-1.5 self-start xl:self-center overflow-x-auto max-w-full scrollbar-hide">
            {categories.map((tab) => {
              const isActive = selectedCategory === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedCategory(tab.value)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-white text-mint-600 shadow-sm scale-105"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Listing Box */}
        <div className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100 min-h-[400px]">
          <PaginatedList<Material>
            items={filteredMaterials}
            pageSize={10}
            mode="pagination"
            renderEmpty={() => (
              <div className="flex flex-col items-center justify-center py-28 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-bold text-base text-slate-700">Không tìm thấy tài liệu phù hợp</p>
                <p className="text-xs font-medium mt-1">Hệ thống chưa tìm thấy học liệu thuộc danh mục này</p>
                {(selectedClassId !== "all" || selectedCategory !== "all" || searchQuery !== "") && (
                  <button
                    onClick={() => {
                      setSelectedClassId("all");
                      setSelectedCategory("all");
                      setSearchQuery("");
                    }}
                    className="mt-6 px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                )}
              </div>
            )}
            renderItem={(doc) => {
              const fileExt = getFileExtension(doc.fileName);
              const fileSize = formatBytes(doc.file_size_bytes);
              
              const targetClass = classes.find(c => c.id === doc.classId);
              const slotCode = targetClass ? getClassSlotCode(targetClass) : "T2H79";
              const classFolder = `${doc.classId.replace(/-/g, "")}_${slotCode}`;
              const virtualPath = `/uploads/${classFolder}/${doc.fileName}`;

              // Category colors mapper
              const getCategoryBadge = (cat: string) => {
                switch (cat) {
                  case "review":
                    return (
                      <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        Tổng ôn
                      </span>
                    );
                  case "extra_reading":
                    return (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Đọc thêm
                      </span>
                    );
                  default:
                    return (
                      <span className="px-2.5 py-1 rounded-xl bg-mint-50 text-mint-700 border border-mint-100 text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-mint-500"></span>
                        Kiến thức
                      </span>
                    );
                }
              };

              return (
                <div
                  key={doc.id}
                  className={`flex flex-col lg:flex-row lg:items-center justify-between p-5 hover:bg-slate-50/50 rounded-2xl transition-all duration-300 group mb-3 last:mb-0 border ${
                    doc.isHidden 
                      ? "border-dashed border-rose-200 bg-rose-50/10 opacity-75"
                      : doc.isApproved === false
                      ? "border-dashed border-amber-200 bg-amber-50/10 opacity-75"
                      : "border-transparent hover:border-slate-100"
                  }`}
                >
                  <div className="flex items-start lg:items-center gap-4 flex-1 min-w-0">
                    {/* Date Published Column (At the beginning) */}
                    <div className="flex flex-col items-center justify-center p-2.5 bg-slate-50 border border-slate-100 rounded-2xl min-w-[85px] text-center shadow-sm">
                      <Calendar className="w-4 h-4 text-slate-400 mb-1" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Ngày đăng</span>
                      <span className="text-[10px] font-black text-slate-700 mt-0.5">
                        {formatDateString(doc.publishedAt)}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-mint-500 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                      {getFileIcon(doc.mime_type)}
                    </div>
                    
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-800 text-sm group-hover:text-mint-600 transition-colors leading-tight truncate">
                          {doc.title}
                        </h4>
                        {getCategoryBadge(doc.category)}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black tracking-widest">
                          {fileExt}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-mint-50 text-mint-700 text-[9px] font-black tracking-widest">
                          Lớp: {doc.classId.replace(/-/g, "")}
                        </span>
                        {doc.isHidden && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[9px] font-black tracking-widest">
                            Đã ẩn
                          </span>
                        )}
                        {doc.isApproved === false && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[9px] font-black tracking-widest">
                            Chờ duyệt
                          </span>
                        )}
                      </div>
                      
                      {doc.description && (
                        <p className="text-xs text-slate-400 font-medium line-clamp-1 max-w-xl">
                          {doc.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 tracking-wide mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {fileSize}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> {doc.authorName}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        <span className="text-slate-400 font-mono truncate max-w-[250px]" title={virtualPath}>
                          📁 {virtualPath}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-2 mt-4 lg:mt-0 justify-end self-end lg:self-center">
                    {/* Admin Moderation Actions */}
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        {/* Approval Toggle */}
                        <button
                          onClick={() => handleToggleApprove(doc)}
                          title={doc.isApproved ? "Gỡ duyệt" : "Duyệt tài liệu"}
                          className={`p-2 rounded-xl border transition-colors ${
                            doc.isApproved 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                              : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        {/* Visibility Toggle */}
                        <button
                          onClick={() => handleToggleHide(doc)}
                          title={doc.isHidden ? "Hiển thị công khai" : "Ẩn tài liệu"}
                          className={`p-2 rounded-xl border transition-colors ${
                            doc.isHidden
                              ? "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100"
                              : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                          }`}
                        >
                          {doc.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    )}

                    {/* Standard User/Teacher Actions */}
                    <ActionColumn
                      actions={canUploadAndManage ? ["view", "edit", "delete"] : ["view"]}
                      itemId={doc.id}
                      onAction={(type) => {
                        if (type === "view") {
                          setSelectedMaterial(doc);
                          setIsDetailOpen(true);
                        } else if (type === "edit") {
                          handleOpenEdit(doc);
                        } else if (type === "delete") {
                          if (confirm(`Bạn có chắc chắn muốn xóa tài liệu "${doc.title}" khỏi hệ thống không?`)) {
                            deleteMaterial(doc.id);
                            triggerToast("Đã xóa tài liệu thành công!");
                          }
                        }
                      }}
                    />

                    {/* Download button (All roles have download) */}
                    <button
                      onClick={() => triggerToast(`Đang tải xuống tệp: ${doc.fileName}`)}
                      title="Tải xuống tệp"
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-mint-200 text-slate-500 hover:text-mint-600 hover:bg-mint-50 transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95 shadow-sm bg-white"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* Floating Action Button for Mobile Quick Upload */}
      {canUploadAndManage && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsUploadOpen(true)}
          className="fixed bottom-10 right-10 w-14 h-14 bg-mint-600 hover:bg-mint-500 text-white rounded-full shadow-2xl shadow-mint-600/30 flex items-center justify-center z-50 md:hidden border border-mint-400"
        >
          <Plus className="w-7 h-7" />
        </motion.button>
      )}

      {/* Popup DocumentUploadPopup (Modal) */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-100 rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-mint-50 to-white border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Đăng học liệu học tập</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tải lên tài liệu mới vào lớp học</p>
                </div>
                <button
                  onClick={() => {
                    setIsUploadOpen(false);
                    setValidationError(null);
                    setSelectedFile(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleUploadSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {validationError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tên tài liệu *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Lý thuyết và bài tập chuyên đề Số nguyên"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mô tả tài liệu</label>
                  <textarea
                    placeholder="Nhập mô tả tóm tắt nội dung chính..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500 outline-none transition-all placeholder:text-slate-400 font-medium resize-none"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                  />
                </div>

                {/* Class & Category Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Chọn lớp học *</label>
                    <select
                      required
                      value={uploadClassId}
                      onChange={(e) => setUploadClassId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500 outline-none transition-all font-bold text-slate-600"
                    >
                      <option value="">Chọn lớp...</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.id.replace(/-/g, "")} - {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Phân loại tài liệu</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500 outline-none transition-all font-bold text-slate-600"
                    >
                      <option value="knowledge">📖 Kiến thức</option>
                      <option value="review">📝 Tổng ôn</option>
                      <option value="extra_reading">💡 Đọc thêm</option>
                    </select>
                  </div>
                </div>

                {/* File Dropzone Area */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Upload file tài liệu *</label>
                  
                  <div className="border-2 border-dashed border-slate-200 hover:border-mint-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50 relative group">
                    <input
                      type="file"
                      id="upload-file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSelectedFile(file);
                      }}
                    />
                    
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto text-slate-400 group-hover:text-mint-500 transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      
                      {selectedFile ? (
                        <div>
                          <p className="text-sm font-bold text-slate-700 max-w-[250px] mx-auto truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                            {formatBytes(selectedFile.size)}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-black text-slate-700">Kéo thả tệp hoặc click để chọn</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                            PDF, DOCX, XLSX, PPTX, JPG, PNG (Tối đa 50MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadOpen(false);
                      setValidationError(null);
                      setSelectedFile(null);
                    }}
                    className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-mint-600 hover:bg-mint-500 text-white font-bold text-xs uppercase tracking-widest shadow-md shadow-mint-100 transition-colors"
                  >
                    Đăng tài liệu
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Document Popup Modal */}
      <AnimatePresence>
        {isEditOpen && selectedMaterial && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-100 rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-mint-50 to-white border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Sửa thông tin tài liệu</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Thay đổi thông số và phân loại lớp học</p>
                </div>
                <button
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditError(null);
                    setSelectedMaterial(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
                {editError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{editError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tên tài liệu *</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mô tả chi tiết</label>
                  <textarea
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500 outline-none transition-all placeholder:text-slate-400 font-medium resize-none"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>

                {/* Class & Category Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Chọn lớp học *</label>
                    <select
                      required
                      value={editClassId}
                      onChange={(e) => setEditClassId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500 outline-none transition-all font-bold text-slate-600"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.id.replace(/-/g, "")} - {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Phân loại tài liệu</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500 outline-none transition-all font-bold text-slate-600"
                    >
                      <option value="knowledge">📖 Kiến thức</option>
                      <option value="review">📝 Tổng ôn</option>
                      <option value="extra_reading">💡 Đọc thêm</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditOpen(false);
                      setEditError(null);
                      setSelectedMaterial(null);
                    }}
                    className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-mint-600 hover:bg-mint-500 text-white font-bold text-xs uppercase tracking-widest shadow-md shadow-mint-100 transition-colors"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Material Detail View Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedMaterial && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-100 rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-mint-50 to-white border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Chi tiết tài liệu</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Mã số: {selectedMaterial.id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsDetailOpen(false);
                    setSelectedMaterial(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Detail content */}
              <div className="p-6 space-y-5 text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-mint-50 flex items-center justify-center text-mint-500 flex-shrink-0">
                    {getFileIcon(selectedMaterial.mime_type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-slate-800 text-sm leading-tight truncate">
                      {selectedMaterial.title}
                    </h4>
                    <p className="text-[10px] font-black text-slate-400 tracking-wider mt-0.5 uppercase">
                      Lớp học: {selectedMaterial.classId.replace(/-/g, "")}
                    </p>
                  </div>
                </div>

                {selectedMaterial.description && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs leading-relaxed text-slate-600">
                    <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 mb-1.5">Mô tả tài liệu</p>
                    {selectedMaterial.description}
                  </div>
                )}

                {/* Virtual File Storage Details Box */}
                <div className="p-4 bg-mint-50/30 border border-mint-100 rounded-2xl text-xs">
                  <p className="font-bold text-[9px] uppercase tracking-widest text-mint-600 mb-1">📁 Thư mục lưu trữ hệ thống</p>
                  <code className="font-mono text-[10px] text-slate-700 break-all select-all block py-1.5 px-2 bg-white rounded-lg border border-mint-100/50 mt-1">
                    {(() => {
                      const targetClass = classes.find(c => c.id === selectedMaterial.classId);
                      const slotCode = targetClass ? getClassSlotCode(targetClass) : "T2H79";
                      const folderName = `${selectedMaterial.classId.replace(/-/g, "")}_${slotCode}`;
                      return `/uploads/${folderName}/${selectedMaterial.fileName}`;
                    })()}
                  </code>
                </div>

                {/* Details Table */}
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <span className="font-bold text-slate-400">Phân loại</span>
                    <span className="font-bold text-slate-700 uppercase">
                      {selectedMaterial.category === "review"
                        ? "Tổng ôn"
                        : selectedMaterial.category === "extra_reading"
                        ? "Đọc thêm"
                        : "Kiến thức"}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="font-bold text-slate-400">Tên file đính kèm</span>
                    <span className="font-bold text-slate-700 max-w-[200px] truncate" title={selectedMaterial.fileName}>
                      {selectedMaterial.fileName}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="font-bold text-slate-400">Dung lượng</span>
                    <span className="font-bold text-slate-700">
                      {formatBytes(selectedMaterial.file_size_bytes)}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="font-bold text-slate-400">Đăng bởi</span>
                    <span className="font-bold text-slate-700">
                      {selectedMaterial.authorName}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="font-bold text-slate-400">Thời gian đăng</span>
                    <span className="font-bold text-slate-700">
                      {formatDateString(selectedMaterial.publishedAt)}
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="py-2.5 flex justify-between">
                      <span className="font-bold text-slate-400">Trạng thái duyệt</span>
                      <span className={`font-black uppercase tracking-wider text-[10px] ${selectedMaterial.isApproved ? "text-emerald-600" : "text-amber-500"}`}>
                        {selectedMaterial.isApproved ? "Đã phê duyệt" : "Chờ phê duyệt"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsDetailOpen(false);
                      setSelectedMaterial(null);
                    }}
                    className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      triggerToast(`Đang tải xuống tệp: ${selectedMaterial.fileName}`);
                      setIsDetailOpen(false);
                      setSelectedMaterial(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-mint-600 hover:bg-mint-500 text-white font-bold text-xs uppercase tracking-widest shadow-md shadow-mint-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Tải xuống
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}