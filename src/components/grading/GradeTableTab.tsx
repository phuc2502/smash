/**
 * GradeTableTab — Bảng điểm thành phần theo lớp học với cấu hình động,
 * nhập điểm hàng loạt spreadsheet-style, và ghi chú đầu điểm cao cấp.
 * Feature: grading-and-feedback
 * Validates: Yêu cầu 5.1–5.10
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Check,
  X,
  MessageSquare,
  Settings,
  Save,
  AlertCircle,
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { calcWeightedAverage, classifyGrade, type GradeClassification } from '../../utils/gradeUtils';
import type { GradeEntry, User, ScoreType, GradeColumnConfig } from '../../context/AppContext';
import { useAppContext } from '../../context/AppContext';

interface GradeTableTabProps {
  classId: string;
  students: User[];
  gradeEntries: GradeEntry[];
  readOnly: boolean;
  onAdd: (entry: Omit<GradeEntry, 'id'>) => void;
  onUpdate: (id: string, data: Partial<GradeEntry>) => void;
  onDelete: (id: string) => void;
}

// Cấu hình mặc định cho các cột điểm nếu lớp chưa được thiết lập cột động
const getDefaultColumnConfigs = (classId: string): GradeColumnConfig[] => [
  { id: 'oral', classId, name: 'Kiểm tra miệng', weight: 10, isBonus: false, sourceType: 'manual', displayOrder: 1 },
  { id: 'quiz_15', classId, name: '15 phút', weight: 10, isBonus: false, sourceType: 'manual', displayOrder: 2 },
  { id: 'quiz_45', classId, name: '1 tiết', weight: 20, isBonus: false, sourceType: 'manual', displayOrder: 3 },
  { id: 'homework', classId, name: 'BTVN', weight: 10, isBonus: false, sourceType: 'manual', displayOrder: 4 },
  { id: 'midterm', classId, name: 'Giữa kỳ', weight: 20, isBonus: false, sourceType: 'manual', displayOrder: 5 },
  { id: 'final', classId, name: 'Cuối kỳ', weight: 30, isBonus: false, sourceType: 'manual', displayOrder: 6 },
];

function classificationBadgeClass(cls: GradeClassification): string {
  switch (cls) {
    case 'Xuất sắc':
    case 'Giỏi':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Khá':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Trung bình':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Yếu':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-500 border-slate-200';
  }
}

export default function GradeTableTab({
  classId,
  students,
  gradeEntries,
  readOnly,
  onAdd,
  onUpdate,
  onDelete,
}: GradeTableTabProps) {
  const { currentAccount, gradeColumnConfigs, updateGradeColumnConfigs, saveStudentComment, studentComments } = useAppContext();
  const gradedBy = currentAccount?.id ?? 'TCH-109';
  const isAdmin = currentAccount?.role === 'Admin';

  // ── States ───────────────────────────────────────────────────
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkScores, setBulkScores] = useState<
    Record<string, { score: string; is_na: boolean; note: string }>
  >({});
  const [bulkError, setBulkError] = useState('');

  // Config Column Panel
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tempConfigs, setTempConfigs] = useState<GradeColumnConfig[]>([]);
  const [configError, setConfigError] = useState('');

  // Comment & Absence Popup
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<User | null>(null);
  const [popupScores, setPopupScores] = useState<Record<string, { score: string; is_na: boolean }>>({});
  const [noteText, setNoteText] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [noteError, setNoteError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter(
      s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // ── Column Configuration ──────────────────────────────────────
  const activeConfigs = useMemo(() => {
    return gradeColumnConfigs[classId] || getDefaultColumnConfigs(classId);
  }, [gradeColumnConfigs, classId]);

  // Lấy danh sách điểm của một học viên
  const getEntriesForStudent = (studentId: string) =>
    gradeEntries.filter(e => e.studentId === studentId && e.classId === classId);

  // Tìm điểm cụ thể dựa trên studentId và columnId (id hoặc name trùng khớp)
  const getEntryForCell = (studentId: string, columnId: string) => {
    const col = activeConfigs.find(c => c.id === columnId);
    return gradeEntries.find(
      e =>
        e.studentId === studentId &&
        e.classId === classId &&
        (e.scoreType === columnId || (col && e.title.toLowerCase() === col.name.toLowerCase()))
    );
  };

  // Validate điểm số hợp lệ từ 0 đến 10
  const validateScore = (value: string): string => {
    if (value === '') return ''; // Cho phép trống (chưa có điểm)
    const n = parseFloat(value);
    if (isNaN(n) || !isFinite(n)) return 'Điểm phải là số';
    if (n < 0 || n > 10) return 'Điểm từ 0 đến 10';
    return '';
  };

  const studentHasNote = (studentId: string) => {
    const studentEntries = getEntriesForStudent(studentId);
    return studentEntries.some(e => 
      isAdmin ? (e.adminNote && e.adminNote.trim() !== '') : (e.note && e.note.trim() !== '')
    );
  };

  // ── Trigger Bulk Mode ──────────────────────────────────────────
  const toggleBulkMode = () => {
    if (isBulkMode) {
      setIsBulkMode(false);
      setBulkError('');
    } else {
      // Khởi tạo trạng thái nhập điểm hàng loạt từ dữ liệu hiện tại
      const initialBulk: typeof bulkScores = {};
      students.forEach(student => {
        activeConfigs.forEach(col => {
          const entry = getEntryForCell(student.id, col.id);
          initialBulk[`${student.id}_${col.id}`] = {
            score: entry ? entry.score.toString() : '',
            is_na: entry?.is_na ?? false,
            note: entry?.note ?? '',
          };
        });
      });
      setBulkScores(initialBulk);
      setBulkError('');
      setIsBulkMode(true);
    }
  };

  // Lưu toàn bộ bảng điểm nhập hàng loạt
  const saveBulkChanges = () => {
    // 1. Kiểm tra tính hợp lệ của tất cả các ô điểm
    let hasError = false;
    students.forEach(student => {
      activeConfigs.forEach(col => {
        const val = bulkScores[`${student.id}_${col.id}`];
        if (val && !val.is_na && val.score !== '') {
          const err = validateScore(val.score);
          if (err) hasError = true;
        }
      });
    });

    if (hasError) {
      setBulkError('Vui lòng sửa các điểm số không hợp lệ (phải từ 0 đến 10) trước khi lưu.');
      return;
    }

    // 2. Tiến hành cập nhật hoặc thêm mới hàng loạt vào AppContext
    students.forEach(student => {
      activeConfigs.forEach(col => {
        const val = bulkScores[`${student.id}_${col.id}`];
        if (!val) return;

        const originalEntry = getEntryForCell(student.id, col.id);
        const scoreVal = val.score !== '' ? parseFloat(val.score) : null;

        if (scoreVal === null && !val.is_na) {
          // Nếu ô điểm bị xóa trống và không phải vắng mặt, tiến hành xóa entry cũ nếu có
          if (originalEntry) {
            onDelete(originalEntry.id);
          }
        } else {
          const finalScore = scoreVal !== null ? scoreVal : 0;
          if (originalEntry) {
            // Cập nhật entry hiện có
            onUpdate(originalEntry.id, {
              score: finalScore,
              is_na: val.is_na,
              note: val.note,
            });
          } else {
            // Tạo entry mới tinh
            onAdd({
              studentId: student.id,
              classId,
              title: col.name,
              scoreType: col.id as ScoreType,
              score: finalScore,
              maxScore: 10,
              gradedBy,
              gradedAt: new Date().toISOString(),
              is_na: val.is_na,
              note: val.note,
            });
          }
        }
      });
    });

    setIsBulkMode(false);
    setBulkError('');
  };

  // ── Column Configuration Actions ──────────────────────────────
  const openConfigPanel = () => {
    setTempConfigs(JSON.parse(JSON.stringify(activeConfigs))); // Deep copy
    setConfigError('');
    setIsConfigOpen(true);
  };

  const handleAddConfigColumn = () => {
    const newCol: GradeColumnConfig = {
      id: `col-${Date.now()}`,
      classId,
      name: '',
      weight: 0,
      isBonus: false,
      sourceType: 'manual',
      displayOrder: tempConfigs.length + 1,
    };
    setTempConfigs(prev => [...prev, newCol]);
  };

  const handleRemoveConfigColumn = (id: string) => {
    setTempConfigs(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateConfigColumn = (id: string, fields: Partial<GradeColumnConfig>) => {
    setTempConfigs(prev =>
      prev.map(c => (c.id === id ? { ...c, ...fields } : c))
    );
  };

  const saveColumnConfig = () => {
    // Validate tên các cột
    if (tempConfigs.some(c => c.name.trim() === '')) {
      setConfigError('Tên của tất cả các cột điểm không được để trống.');
      return;
    }

    // Validate tổng trọng số cột thường
    const regularCols = tempConfigs.filter(c => !c.isBonus);
    const totalWeight = regularCols.reduce((sum, c) => sum + c.weight, 0);

    if (totalWeight !== 100) {
      setConfigError(
        `Tổng trọng số của các cột điểm thường phải bằng đúng 100% (Hiện tại: ${totalWeight}%).`
      );
      return;
    }

    updateGradeColumnConfigs(classId, tempConfigs);
    setIsConfigOpen(false);
    setConfigError('');
  };

  // ── Note Modal Functions ──────────────────────────────────────
  const openNotePopup = (student: User) => {
    setSelectedStudentForNote(student);
    
    const initialScores: Record<string, { score: string; is_na: boolean }> = {};
    let currentNote = '';
    let currentFeedback = '';
    
    activeConfigs.forEach(col => {
      const entry = getEntryForCell(student.id, col.id);
      initialScores[col.id] = {
        score: entry && entry.score !== null && entry.score !== undefined ? entry.score.toString() : '',
        is_na: entry?.is_na ?? false,
      };
      if (entry) {
        if (isAdmin) {
          if (entry.adminNote) currentNote = entry.adminNote;
        } else {
          if (entry.note) currentNote = entry.note;
        }
      }
      if (entry?.feedback) currentFeedback = entry.feedback;
    });

    const existingGeneralComment = studentComments?.find(
      c => c.studentId === student.id && c.classId === classId
    );
    if (existingGeneralComment) {
      currentFeedback = existingGeneralComment.content;
    }
    
    setPopupScores(initialScores);
    setNoteText(currentNote);
    setFeedbackText(currentFeedback);
    setNoteError('');
  };

  const saveNotePopup = () => {
    if (!selectedStudentForNote) return;

    let hasError = false;
    activeConfigs.forEach(col => {
      const val = popupScores[col.id];
      if (val && !val.is_na && val.score !== '') {
        const err = validateScore(val.score);
        if (err) hasError = true;
      }
    });

    if (hasError) {
      setNoteError('Vui lòng sửa các điểm số không hợp lệ (phải từ 0 đến 10) trước khi lưu.');
      return;
    }

    activeConfigs.forEach(col => {
      const val = popupScores[col.id];
      if (!val) return;

      const originalEntry = getEntryForCell(selectedStudentForNote.id, col.id);
      const scoreVal = val.score !== '' ? parseFloat(val.score) : null;

      if (scoreVal === null && !val.is_na) {
        if (originalEntry) {
          onDelete(originalEntry.id);
        }
      } else {
        const finalScore = scoreVal !== null ? scoreVal : 0;
        if (originalEntry) {
          onUpdate(originalEntry.id, {
            score: finalScore,
            is_na: val.is_na,
            feedback: feedbackText,
            ...(isAdmin ? { adminNote: noteText } : { note: noteText }),
          });
        } else {
          onAdd({
            studentId: selectedStudentForNote.id,
            classId,
            title: col.name,
            scoreType: col.id as ScoreType,
            score: finalScore,
            maxScore: 10,
            gradedBy,
            gradedAt: new Date().toISOString(),
            is_na: val.is_na,
            feedback: feedbackText,
            ...(isAdmin ? { adminNote: noteText } : { note: noteText }),
          });
        }
      }
    });

    if (saveStudentComment) {
      saveStudentComment({
        studentId: selectedStudentForNote.id,
        classId,
        teacherId: gradedBy,
        content: feedbackText,
      });
    }

    setSelectedStudentForNote(null);
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <HelpCircle className="w-16 h-16 text-slate-200 mb-4 animate-pulse" />
        <p className="text-lg font-bold text-slate-500">Không có học viên trong lớp này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Toolbar ── */}
      {(!readOnly || isAdmin) && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 backdrop-blur-sm">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            {/* Search Input */}
            <div className="relative w-full max-w-xs group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-mint-600 transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm học viên..."
                className="w-full bg-white border border-slate-200 rounded-full py-2 pl-10 pr-4 text-xs focus:ring-4 focus:ring-mint-500/10 focus:border-mint-400 outline-none transition-all placeholder:text-slate-400 font-bold"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {isBulkMode && (
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs rounded-full flex items-center gap-1.5 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                Đang ở chế độ nhập hàng loạt
              </span>
            )}
          </div>
          {!isAdmin && (
            <div className="flex gap-3">
              <button
                onClick={openConfigPanel}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-full transition-all shadow-sm"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                Cấu hình cột điểm
              </button>
              <button
                onClick={toggleBulkMode}
                className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-full transition-all shadow-sm ${
                  isBulkMode
                    ? 'bg-slate-800 text-white hover:bg-slate-900'
                    : 'bg-mint-50 border border-mint-200 text-mint-700 hover:bg-mint-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                {isBulkMode ? 'Thoát nhập hàng loạt' : 'Nhập hàng loạt'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Spreadsheet / Table ── */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200">
                {(!readOnly || isAdmin) && (
                  <th className="w-4 pl-3 pr-0 py-4"></th>
                )}
                <th className="pl-2 pr-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Học viên
                </th>
                {activeConfigs.map(col => (
                  <th
                    key={col.id}
                    className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap text-center"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-slate-800 font-black">{col.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 lowercase">
                        {col.isBonus ? 'điểm thưởng' : `trọng số: ${col.weight}%`}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">
                  Điểm TB tích lũy
                </th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">
                  Xếp loại
                </th>
                {(!readOnly || isAdmin) && (
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">
                    Hành động
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => {
                const entries = getEntriesForStudent(student.id);
                // Tính điểm trung bình có trọng số & điểm thưởng
                const average = calcWeightedAverage(entries, activeConfigs);
                const classification = classifyGrade(average);

                return (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-slate-50/30 transition-colors"
                  >
                    {(!readOnly || isAdmin) && (
                      <td className="w-4 pl-3 pr-0 py-4 text-right">
                        {studentHasNote(student.id) && (
                          <span className="inline-block w-2 h-2 bg-rose-500 rounded-full" title="Có ghi chú nội bộ" />
                        )}
                      </td>
                    )}
                    {/* Student details */}
                    <td className="pl-2 pr-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-mint-500/10 text-mint-700 flex items-center justify-center text-sm font-black flex-shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{student.name}</p>
                          <p className="text-[11px] font-bold text-slate-400 tracking-wide">{student.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Columns dynamically rendered */}
                    {activeConfigs.map(col => {
                      const entry = getEntryForCell(student.id, col.id);

                      if (isBulkMode) {
                        const cellKey = `${student.id}_${col.id}`;
                        const cellData = bulkScores[cellKey] || { score: '', is_na: false, note: '' };
                        const isCellNa = cellData.is_na;
                        const cellErr = validateScore(cellData.score);

                        return (
                          <td key={col.id} className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <input
                                type="number"
                                min={0}
                                max={10}
                                step={0.5}
                                value={cellData.score}
                                disabled={isCellNa}
                                placeholder={isCellNa ? 'Vắng' : '0-10'}
                                onChange={e => {
                                  const val = e.target.value;
                                  setBulkScores(prev => ({
                                    ...prev,
                                    [cellKey]: { ...prev[cellKey], score: val },
                                  }));
                                }}
                                className={`w-16 h-9 text-center text-sm font-bold border-2 rounded-xl outline-none transition-all ${
                                  isCellNa
                                    ? 'bg-slate-100 border-slate-200 text-slate-400'
                                    : cellErr
                                    ? 'border-rose-400 bg-rose-50 text-rose-700 focus:ring-4 focus:ring-rose-100'
                                    : 'border-slate-200 bg-white text-slate-800 focus:border-mint-400 focus:ring-4 focus:ring-mint-50'
                                }`}
                              />
                              <button
                                onClick={() => {
                                  const nextNa = !isCellNa;
                                  setBulkScores(prev => ({
                                    ...prev,
                                    [cellKey]: {
                                      ...prev[cellKey],
                                      is_na: nextNa,
                                      score: nextNa ? '' : prev[cellKey]?.score || '',
                                    },
                                  }));
                                }}
                                title={isCellNa ? 'Có mặt' : 'Báo vắng mặt'}
                                className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-wide border transition-all ${
                                  isCellNa
                                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                                    : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                {isCellNa ? 'N/A' : 'Vắng'}
                              </button>
                            </div>
                          </td>
                        );
                      }

                      // Normal Mode
                      return (
                        <td key={col.id} className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center justify-center">
                            {entry ? (
                              entry.is_na ? (
                                <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black rounded-lg">
                                  Vắng (N/A)
                                </span>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span className="text-sm font-bold text-slate-800 tabular-nums">
                                    {entry.score.toFixed(1)}
                                  </span>
                                </div>
                              )
                            ) : (
                              <span className="text-slate-300 text-sm font-semibold">—</span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Weighted Average Cumulative */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-base font-black text-slate-900 tabular-nums">
                        {average !== null ? average.toFixed(1) : '—'}
                      </span>
                    </td>

                    {/* Classify */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3.5 py-1.5 rounded-full text-xs font-black border whitespace-nowrap ${classificationBadgeClass(
                          classification
                        )}`}
                      >
                        {classification}
                      </span>
                    </td>

                    {/* Action Column */}
                    {(!readOnly || isAdmin) && (
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openNotePopup(student)}
                          title="Ghi chú & Sửa điểm"
                          className="p-2 rounded-xl bg-slate-50 hover:bg-mint-50 text-slate-500 hover:text-mint-600 border border-slate-100 hover:border-mint-200 transition-all"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Bulk Save Floating Footer ── */}
        <AnimatePresence>
          {isBulkMode && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="border-t border-slate-200 bg-slate-50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Bảng điểm đang ở chế độ Nhập điểm hàng loạt
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Hãy điền điểm số hoặc báo vắng mặt cho từng ô. Nhấn "Lưu" để đồng bộ ngay.
                  </p>
                  {bulkError && (
                    <p className="text-xs text-rose-600 font-black mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {bulkError}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={toggleBulkMode}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-black text-sm rounded-xl transition-all"
                >
                  Hủy bỏ thay đổi
                </button>
                <button
                  onClick={saveBulkChanges}
                  className="flex items-center gap-2 px-6 py-2.5 bg-mint-500 hover:bg-mint-600 text-white font-black text-sm rounded-xl transition-all shadow-md shadow-mint-100"
                >
                  <Save className="w-4 h-4" />
                  Lưu
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Modal Cấu hình Cột điểm ── */}
      <AnimatePresence>
        {isConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] border border-slate-100 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Thiết lập cấu trúc Cột điểm</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">
                    Tùy chỉnh hệ số trọng số (%) điểm thường và thêm các đầu điểm thưởng.
                  </p>
                </div>
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body list of configs */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {configError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <p className="text-sm text-rose-700 font-bold leading-normal">{configError}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {tempConfigs.map((col, cidx) => (
                    <div
                      key={col.id}
                      className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">
                        {cidx + 1}
                      </span>
                      {/* Name input */}
                      <div className="flex-1 min-w-[150px]">
                        <input
                          type="text"
                          placeholder="Tên đầu điểm (Ví dụ: Miệng, 15 phút, v.v.)"
                          value={col.name}
                          onChange={e => handleUpdateConfigColumn(col.id, { name: e.target.value })}
                          className="w-full border-2 border-slate-200 focus:border-mint-400 bg-white rounded-xl px-3 py-2 text-sm font-bold outline-none transition-all"
                        />
                      </div>

                      {/* Weight input */}
                      <div className="w-28 flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          disabled={col.isBonus}
                          value={col.isBonus ? '' : col.weight}
                          placeholder={col.isBonus ? '—' : 'Trọng số'}
                          onChange={e =>
                            handleUpdateConfigColumn(col.id, {
                              weight: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full border-2 border-slate-200 focus:border-mint-400 bg-white rounded-xl px-3 py-2 text-sm font-bold text-center outline-none transition-all disabled:bg-slate-100 disabled:text-slate-300"
                        />
                        {!col.isBonus && <span className="text-sm font-black text-slate-500">%</span>}
                      </div>

                      {/* Bonus Checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={col.isBonus}
                          onChange={e => {
                            const isCh = e.target.checked;
                            handleUpdateConfigColumn(col.id, {
                              isBonus: isCh,
                              weight: isCh ? 0 : 10,
                            });
                          }}
                          className="w-4 h-4 rounded text-mint-500 border-slate-300 focus:ring-mint-500 transition-all cursor-pointer"
                        />
                        <span className="text-xs font-black text-slate-600 whitespace-nowrap">Điểm thưởng</span>
                      </label>

                      {/* Delete col */}
                      <button
                        onClick={() => handleRemoveConfigColumn(col.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddConfigColumn}
                  className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-slate-200 hover:border-mint-400 text-slate-500 hover:text-mint-600 rounded-2xl font-bold text-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Thêm cột điểm mới
                </button>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">
                  * Điểm thưởng sẽ cộng trực tiếp vào điểm trung bình và không tính vào hạn mức 100% trọng số.
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsConfigOpen(false)}
                    className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-black text-sm rounded-xl transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={saveColumnConfig}
                    className="flex items-center gap-2 px-6 py-2.5 bg-mint-500 hover:bg-mint-600 text-white font-black text-sm rounded-xl transition-all shadow-md shadow-mint-100"
                  >
                    <Check className="w-4 h-4" />
                    Lưu cấu hình
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal Ghi chú & Nhận xét Đầu điểm ── */}
      <AnimatePresence>
        {selectedStudentForNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Chi tiết đầu điểm học sinh</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">
                    Học viên: <span className="text-mint-600 font-black">{selectedStudentForNote.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudentForNote(null);
                  }}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {noteError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <p className="text-xs text-rose-700 font-black">{noteError}</p>
                  </div>
                )}

                {/* Score Table */}
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-200">
                        <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Đầu điểm</th>
                        <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider text-center">Điểm số</th>
                        <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider text-center">Trạng thái đi học</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeConfigs.map(col => {
                        const cellData = popupScores[col.id] || { score: '', is_na: false };
                        return (
                          <tr key={col.id} className="hover:bg-slate-50/30">
                            <td className="px-4 py-3 text-sm font-bold text-slate-800">
                              {col.name} <span className="text-[10px] text-slate-400 font-normal">{col.isBonus ? '(Thưởng)' : `(${col.weight}%)`}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={10}
                                step={0.5}
                                disabled={cellData.is_na && !isAdmin}
                                readOnly={isAdmin}
                                value={cellData.score}
                                placeholder={cellData.is_na ? 'Vắng' : '0-10'}
                                onChange={e => {
                                  if (isAdmin) return;
                                  setPopupScores(prev => ({
                                    ...prev,
                                    [col.id]: { ...prev[col.id], score: e.target.value }
                                  }));
                                  setNoteError('');
                                }}
                                className="w-16 h-9 text-center text-sm font-bold border-2 border-slate-200 focus:border-mint-400 bg-white rounded-xl outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <label className={`inline-flex items-center justify-center gap-2 select-none ${isAdmin ? 'cursor-default' : 'cursor-pointer'}`}>
                                <input
                                  type="checkbox"
                                  checked={cellData.is_na}
                                  onClick={e => {
                                    if (isAdmin) e.preventDefault();
                                  }}
                                  onChange={e => {
                                    if (isAdmin) return;
                                    const nextNa = e.target.checked;
                                    setPopupScores(prev => ({
                                      ...prev,
                                      [col.id]: {
                                        ...prev[col.id],
                                        is_na: nextNa,
                                        score: nextNa ? '' : prev[col.id]?.score || ''
                                      }
                                    }));
                                  }}
                                  className={`w-4 h-4 rounded text-rose-500 border-slate-300 focus:ring-rose-500 transition-all ${isAdmin ? 'cursor-default' : 'cursor-pointer'}`}
                                />
                                <span className="text-xs font-bold text-slate-600">Vắng (N/A)</span>
                              </label>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Notes and Comments */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Nhập ghi chú...."
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      className="w-full border-2 border-slate-200 focus:border-mint-400 bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                      Nhận xét
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Nhập nhận xét"
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      className="w-full border-2 border-slate-200 focus:border-mint-400 bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedStudentForNote(null);
                  }}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-black text-sm rounded-xl transition-all"
                >
                  Đóng
                </button>
                <button
                  onClick={saveNotePopup}
                  className="flex items-center gap-2 px-6 py-2.5 bg-mint-500 hover:bg-mint-600 text-white font-black text-sm rounded-xl transition-all shadow-md"
                >
                  <Check className="w-4 h-4" />
                  Lưu thay đổi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
