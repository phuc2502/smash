import React, { useMemo, useState } from "react";
import { BarChart3, RotateCcw, Printer } from "lucide-react";
import { motion } from "motion/react";
import { useAppContext } from "../context/AppContext";

export interface ClassStudyRow {
  id: string;
  studentName: string;
  classId: string;
  /** Hiển thị tag cột Lớp (ví dụ Lớp 6A) */
  classLabel: string;
  avgGrade: number;
  submissionRate: number;
  sessionsAttended: number;
}

/** Dữ liệu mẫu — căn `classId` với `initialClasses` trong AppContext */
const MOCK_STUDY_ROWS: ClassStudyRow[] = [
  { id: "r1", studentName: "Hoàng Văn Việt", classId: "MATH-06-01", classLabel: "Lớp 6A", avgGrade: 8.4, submissionRate: 95, sessionsAttended: 20 },
  { id: "r2", studentName: "Lê Hoàng Cường", classId: "MATH-06-01", classLabel: "Lớp 6A", avgGrade: 7.8, submissionRate: 88, sessionsAttended: 19 },
  { id: "r3", studentName: "Nguyễn Thu Hà", classId: "MATH-06-01", classLabel: "Lớp 6A", avgGrade: 9.1, submissionRate: 100, sessionsAttended: 21 },
  { id: "r4", studentName: "Phạm Thị Lan Anh", classId: "MATH-07-02", classLabel: "Lớp 7B", avgGrade: 6.9, submissionRate: 72, sessionsAttended: 16 },
  { id: "r5", studentName: "Trần Minh Đức", classId: "MATH-07-02", classLabel: "Lớp 7B", avgGrade: 8.0, submissionRate: 90, sessionsAttended: 18 },
  { id: "r6", studentName: "Đỗ Khánh Linh", classId: "MATH-09-EX", classLabel: "Lớp 9B", avgGrade: 8.7, submissionRate: 96, sessionsAttended: 24 },
  { id: "r7", studentName: "Bùi Gia Bảo", classId: "MATH-09-EX", classLabel: "Lớp 9B", avgGrade: 7.5, submissionRate: 85, sessionsAttended: 22 },
  { id: "r8", studentName: "Võ Thị Mai", classId: "MATH-09-EX", classLabel: "Lớp 9B", avgGrade: 9.4, submissionRate: 100, sessionsAttended: 25 },
];

export default function ClassReportPage() {
  const { classes, canAccess } = useAppContext();
  const [classFilter, setClassFilter] = useState<string>("all");
  const canExport = canAccess('export_grades');

  const classOptions = useMemo(
    () => classes.map((c) => ({ id: c.id, label: c.title })),
    [classes],
  );

  const rows = useMemo(() => {
    if (classFilter === "all") return MOCK_STUDY_ROWS;
    return MOCK_STUDY_ROWS.filter((r) => r.classId === classFilter);
  }, [classFilter]);

  return (
    <div className="space-y-8 pb-16">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-500 to-mint-600 text-white flex items-center justify-center shadow-lg shadow-mint-200/60">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Báo cáo &amp; Thống kê học tập
            </h1>
          </div>
        </div>
        {canExport && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-3 bg-white text-slate-800 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm border border-slate-200"
          >
            <Printer className="w-5 h-5" />
            Xuất báo cáo
          </button>
        )}
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="bg-white/80 backdrop-blur-xl rounded-[24px] border border-slate-100 shadow-sm p-5 md:p-6 flex flex-col sm:flex-row sm:items-end gap-4"
      >
        <div className="flex-1 space-y-1.5 min-w-[200px]">
          <label className="text-[10px] font-black uppercase tracking-wider text-mint-600">Lọc theo lớp</label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full max-w-md bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-mint-500/25 focus:border-mint-400/50"
          >
            <option value="all">Tất cả lớp</option>
            {classOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setClassFilter("all")}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm font-bold hover:bg-slate-50 hover:border-mint-200 transition-colors shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          Đặt lại
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-xl rounded-[28px] border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="px-5 md:px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-slate-700">
            Danh sách học viên
            <span className="ml-2 text-xs font-semibold text-slate-400">({rows.length} dòng)</span>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="py-4 px-5">Học viên</th>
                <th className="py-4 px-3">Lớp</th>
                <th className="py-4 px-3">Điểm trung bình</th>
                <th className="py-4 px-3">Tỷ lệ nộp bài</th>
                <th className="py-4 px-5 text-right">Số buổi tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-slate-500 font-medium">
                    Không có dữ liệu cho lớp đã chọn
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.24) }}
                    className="hover:bg-mint-50/25 transition-colors"
                  >
                    <td className="py-4 px-5 font-semibold text-slate-900">{row.studentName}</td>
                    <td className="py-4 px-3">
                      <span className="inline-flex text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80">
                        {row.classLabel}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-semibold tabular-nums text-slate-800">{row.avgGrade.toFixed(1)}</td>
                    <td className="py-4 px-3">
                      <span className="font-semibold tabular-nums text-mint-700">{row.submissionRate}%</span>
                    </td>
                    <td className="py-4 px-5 text-right font-semibold tabular-nums text-slate-800">
                      {row.sessionsAttended}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
