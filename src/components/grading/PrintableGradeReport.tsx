/**
 * PrintableGradeReport — Component bảng điểm tối ưu cho in ấn.
 * Được bọc trong <div id="printable-area"> để CSS @media print chỉ hiển thị vùng này.
 *
 * Feature: missing-features-rbac
 * Validates: Yêu cầu 8.5, 8.7, 8.9, 9.4
 */

import type { GradeClassification } from '../../utils/gradeUtils';

export interface GradeRow {
  studentId: string;
  studentName: string;
  scores: { title: string; score: number }[];
  average: number | null;
  classification: GradeClassification;
}

interface PrintableGradeReportProps {
  className: string;
  instructor: string;
  exportedAt: string;
  students: GradeRow[];
}

/** Màu chữ xếp loại theo yêu cầu 9.4 */
function classificationColor(cls: GradeClassification): string {
  switch (cls) {
    case 'Xuất sắc':
    case 'Giỏi':
      return 'text-emerald-600';
    case 'Khá':
      return 'text-blue-600';
    case 'Trung bình':
      return 'text-amber-600';
    case 'Yếu':
      return 'text-rose-600';
    default:
      return 'text-slate-500';
  }
}

export default function PrintableGradeReport({
  className,
  instructor,
  exportedAt,
  students,
}: PrintableGradeReportProps) {
  // Lấy danh sách tiêu đề cột điểm từ học viên đầu tiên (nếu có)
  const scoreTitles: string[] =
    students.length > 0 ? students[0].scores.map((s) => s.title) : [];

  return (
    <div id="printable-area" className="p-8 font-sans text-slate-900 bg-white">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black uppercase tracking-wide">SMASH Math Center</h1>
        <h2 className="text-lg font-bold mt-1">BẢNG ĐIỂM HỌC VIÊN</h2>
        <div className="mt-3 text-sm space-y-0.5">
          <p>
            <span className="font-semibold">Lớp:</span> {className}
          </p>
          <p>
            <span className="font-semibold">Giáo viên phụ trách:</span> {instructor}
          </p>
          <p>
            <span className="font-semibold">Ngày xuất báo cáo:</span> {exportedAt}
          </p>
        </div>
      </div>

      {/* Table */}
      {students.length === 0 ? (
        <p className="text-center text-slate-500 py-10">Chưa có dữ liệu điểm</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-3 py-2 text-center font-bold">STT</th>
              <th className="border border-slate-300 px-3 py-2 text-left font-bold">Họ tên</th>
              {scoreTitles.map((title) => (
                <th
                  key={title}
                  className="border border-slate-300 px-3 py-2 text-center font-bold whitespace-nowrap"
                >
                  {title}
                </th>
              ))}
              <th className="border border-slate-300 px-3 py-2 text-center font-bold">Điểm TB</th>
              <th className="border border-slate-300 px-3 py-2 text-center font-bold">Xếp loại</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.studentId} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="border border-slate-300 px-3 py-2 text-center">{index + 1}</td>
                <td className="border border-slate-300 px-3 py-2 font-medium">{student.studentName}</td>
                {student.scores.map((s) => (
                  <td key={s.title} className="border border-slate-300 px-3 py-2 text-center tabular-nums">
                    {s.score}
                  </td>
                ))}
                <td className="border border-slate-300 px-3 py-2 text-center font-bold tabular-nums">
                  {student.average !== null ? student.average.toFixed(1) : '—'}
                </td>
                <td
                  className={`border border-slate-300 px-3 py-2 text-center font-bold ${classificationColor(student.classification)}`}
                >
                  {student.classification}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Footer */}
      <div className="mt-8 text-xs text-slate-500 text-right">
        Xuất lúc: {exportedAt} — SMASH Math Center
      </div>
    </div>
  );
}
