import React, { useState } from "react";
import {
  FolderOpen,
  Search,
  Filter,
  Upload,
  History,
  Grid3X3,
  Layers,
  LayoutGrid,
  FileText,
  Eye,
  Download,
  MoreVertical,
  Plus,
  FileCode,
  FileBox,
  ChevronRight,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";

const iconMap: Record<string, any> = {
  History,
  Grid3X3,
  Layers,
  LayoutGrid
};

export default function MaterialsPage() {
  const { materials } = useAppContext();
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const allFiles = [
    { name: "Số học 6 - Chương 2: Số nguyên.pdf", grade: 6, type: "PDF", size: "1.4 MB", author: "Thầy Minh", date: "2d ago", color: "mint" },
    { name: "Hình học 6 - Điểm, đường thẳng.docx", grade: 6, type: "DOCX", size: "2.1 MB", author: "Cô Thu", date: "5d ago", color: "mint" },
    { name: "Đề cương ôn tập HK1 Toán 7.pdf", grade: 7, type: "PDF", size: "3.1 MB", author: "Cô Thu", date: "1d ago", color: "mint" },
    { name: "Công thức Đại số 7 nâng cao.txt", grade: 7, type: "TXT", size: "0.5 MB", author: "Thầy Hùng", date: "1w ago", color: "mint" },
    { name: "Phương trình bậc nhất 8.docx", grade: 8, type: "DOCX", size: "1.8 MB", author: "Thầy Hùng", date: "3d ago", color: "mint" },
    { name: "Định lý Ta-lét và ứng dụng.pdf", grade: 8, type: "PDF", size: "2.4 MB", author: "Thầy Minh", date: "4d ago", color: "mint" },
    { name: "Giải toán bằng cách lập PT 9.pdf", grade: 9, type: "PDF", size: "4.2 MB", author: "Thầy Hùng", date: "1d ago", color: "mint" },
    { name: "Hệ thức lượng trong tam giác vuông.docx", grade: 9, type: "DOCX", size: "2.9 MB", author: "Cô Thu", date: "2d ago", color: "mint" },
    { name: "Ghi chú ôn thi vào 10 chuyên.txt", grade: 9, type: "TXT", size: "0.2 MB", author: "Thầy Minh", date: "1w ago", color: "mint" },
  ];

  const filteredFiles = allFiles.filter(file => {
    const matchesGrade = selectedGrade === 'all' || file.grade === selectedGrade;
    const matchesType = selectedType === 'all' || file.type === selectedType;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesType && matchesSearch;
  });

  const grades = [6, 7, 8, 9];
  const fileTypes = ["PDF", "DOCX", "TXT"];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-6 h-6" />;
      case 'DOCX': return <FileCode className="w-6 h-6" />;
      case 'TXT': return <FileBox className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const getGradeColor = (grade: number) => {
    return "mint";
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mt-4">
        <div className="max-w-2xl space-y-3">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight"
          >
            Kho tài liệu <br /> <span className="text-mint-600">Toán học</span> chuyên sâu
          </motion.h1>
          <p className="text-slate-500 font-medium text-lg">
            Hệ thống lưu trữ tập trung cho 'Số học', 'Hình học' và các tài liệu ôn tập theo từng khối lớp từ 6 đến 9.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-mint-600 transition-colors z-10" />
            <input
              type="text"
              placeholder="Tìm tên tệp, chuyên đề..."
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all placeholder:text-slate-400 font-medium shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-gradient-to-r from-mint-600 to-mint-400 text-white font-bold text-sm shadow-xl shadow-mint-100 hover:shadow-2xl hover:shadow-mint-200 hover:-translate-y-0.5 transition-all flex items-center gap-2 whitespace-nowrap">
              <Upload className="w-5 h-5" />
              Tải lên
            </button>
          </div>
        </div>
      </div>

      {/* Grade Selection "4 mục theo 4 lớp" */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-mint-50 text-mint-600">
              <Layers className="w-5 h-5" />
            </div>
            Phân loại theo Lớp
          </h2>
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedGrade('all')}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedGrade === 'all' ? 'bg-white text-mint-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Tất cả
            </button>
            {grades.map(grade => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedGrade === grade ? 'bg-white text-mint-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Lớp {grade}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {grades.map((grade) => {
            const color = getGradeColor(grade);
            const count = allFiles.filter(f => f.grade === grade).length;
            const isActive = selectedGrade === grade;

            return (
              <motion.div
                key={grade}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedGrade(grade)}
                className={`relative p-6 rounded-[32px] border transition-all duration-300 cursor-pointer overflow-hidden group ${isActive
                    ? `bg-${color}-50 border-${color}-200 shadow-lg shadow-${color}-100`
                    : 'bg-white border-slate-100 hover:border-mint-200 shadow-sm hover:shadow-xl'
                  }`}
              >
                <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 bg-${color}-500 transition-opacity`}></div>
                <div className="flex flex-col gap-4 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-${color}-600 ${isActive ? 'bg-white shadow-sm' : `bg-${color}-50`}`}>
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Lớp {grade}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{count} Tài liệu</p>
                  </div>
                </div>
                {isActive && (
                  <div className="absolute top-6 right-6">
                    <div className={`w-6 h-6 rounded-full bg-mint-500 text-white flex items-center justify-center shadow-md`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* File Type Filter & Results */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-mint-50 text-mint-600">
              <FileText className="w-5 h-5" />
            </div>
            Danh sách Tài liệu
          </h2>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Định dạng:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedType === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                Tất cả
              </button>
              {fileTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedType === type
                      ? 'bg-mint-600 text-white border-mint-600 shadow-lg shadow-mint-100'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[40px] p-4 shadow-sm border border-slate-100 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {filteredFiles.length > 0 ? filteredFiles.map((file, i) => (
              <motion.div
                key={file.name}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50 rounded-[28px] transition-all duration-300 group cursor-pointer mb-2 last:mb-0 border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl bg-${file.color}-50 flex items-center justify-center text-${file.color}-500 group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-${file.color}-100`}>
                    {getFileIcon(file.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-black text-slate-900 text-base group-hover:text-mint-600 transition-colors">{file.name}</h4>
                      <span className={`px-2 py-0.5 rounded-md bg-${file.color}-100/50 text-${file.color}-700 text-[9px] font-black uppercase tracking-widest`}>
                        Lớp {file.grade}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                        {file.type}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                      <span>{file.size}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <span>Uploaded by {file.author}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <span>{file.date}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 sm:mt-0 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <button className="p-3 text-slate-400 hover:text-mint-600 hover:bg-white rounded-xl transition-all shadow-sm">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-3 text-slate-400 hover:text-mint-600 hover:bg-white rounded-xl transition-all shadow-sm">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 text-slate-400"
              >
                <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 opacity-20" />
                </div>
                <p className="font-bold text-lg">Không tìm thấy tài liệu nào</p>
                <p className="text-sm font-medium mt-1">Vui lòng thử bộ lọc khác hoặc tìm kiếm lại</p>
                <button
                  onClick={() => { setSelectedGrade('all'); setSelectedType('all'); setSearchQuery(''); }}
                  className="mt-8 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest transition-all"
                >
                  Xóa tất cả bộ lọc
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Action for Mobile or Quick Add */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-10 right-10 w-16 h-16 bg-mint-600 text-white rounded-full shadow-2xl shadow-mint-300 flex items-center justify-center z-50 md:hidden"
      >
        <Plus className="w-8 h-8" />
      </motion.button>
    </div>
  );
}