/**
 * CommentTab — Tab nhận xét học viên.
 * Feature: grading-and-feedback
 * Validates: Yêu cầu 6.1–6.7
 */

import React, { useState } from 'react';
import { MessageSquare, Save, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import type { StudentComment, User } from '../../context/AppContext';

interface CommentTabProps {
  classId: string;
  students: User[];
  comments: StudentComment[];
  readOnly: boolean;
  teacherId: string;
  onSave: (comment: Omit<StudentComment, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const MAX_COMMENT_LENGTH = 1000;

/** Validate nhận xét: không rỗng/khoảng trắng và không vượt 1000 ký tự */
export function isValidComment(content: string): boolean {
  return content.trim().length > 0 && content.length <= MAX_COMMENT_LENGTH;
}

export default function CommentTab({
  classId,
  students,
  comments,
  readOnly,
  teacherId,
  onSave,
}: CommentTabProps) {
  // Local draft state per student
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    students.forEach(s => {
      const existing = comments.find(c => c.studentId === s.id && c.classId === classId);
      init[s.id] = existing?.content ?? '';
    });
    return init;
  });
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const getDraft = (studentId: string) => drafts[studentId] ?? '';
  const setDraft = (studentId: string, value: string) =>
    setDrafts(prev => ({ ...prev, [studentId]: value }));

  const getExistingComment = (studentId: string) =>
    comments.find(c => c.studentId === studentId && c.classId === classId);

  const handleSave = (studentId: string) => {
    const content = getDraft(studentId);
    if (!isValidComment(content)) return;
    onSave({ studentId, classId, teacherId, content });
    setSavedIds(prev => new Set([...prev, studentId]));
    // Clear saved indicator after 3s
    setTimeout(() => {
      setSavedIds(prev => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    }, 3000);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <MessageSquare className="w-16 h-16 mb-4 text-slate-200" />
        <p className="text-lg font-bold text-slate-500">Không có học viên trong lớp này</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {students.map((student, idx) => {
        const draft = getDraft(student.id);
        const existing = getExistingComment(student.id);
        const charCount = draft.length;
        const isOverLimit = charCount > MAX_COMMENT_LENGTH;
        const isEmpty = draft.trim().length === 0;
        const canSave = !isEmpty && !isOverLimit;
        const justSaved = savedIds.has(student.id);

        return (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6"
          >
            {/* Student header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-mint-50 text-mint-600 flex items-center justify-center font-black text-sm flex-shrink-0">
                {student.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 truncate">{student.name}</p>
                <p className="text-xs text-slate-400">{student.id}</p>
              </div>
              {existing && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Cập nhật: {formatDate(existing.updatedAt)}</span>
                </div>
              )}
            </div>

            {readOnly ? (
              /* Read-only: static text */
              <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed min-h-[80px]">
                {existing?.content ? (
                  <p className="whitespace-pre-wrap">{existing.content}</p>
                ) : (
                  <p className="text-slate-400 italic">Chưa có nhận xét.</p>
                )}
              </div>
            ) : (
              /* Editable */
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    value={draft}
                    onChange={e => setDraft(student.id, e.target.value)}
                    placeholder="Nhập nhận xét cho học viên..."
                    rows={4}
                    maxLength={MAX_COMMENT_LENGTH + 100} // allow typing past limit to show error
                    className={`w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none transition-all resize-none ${
                      isOverLimit
                        ? 'border-rose-400 bg-rose-50 focus:ring-4 focus:ring-rose-100'
                        : 'border-slate-200 bg-white focus:border-mint-400 focus:ring-4 focus:ring-mint-100'
                    }`}
                  />
                  {/* Char counter */}
                  <div
                    className={`absolute bottom-3 right-4 text-[11px] font-semibold ${
                      isOverLimit ? 'text-rose-600' : charCount > 900 ? 'text-amber-500' : 'text-slate-400'
                    }`}
                  >
                    {charCount}/{MAX_COMMENT_LENGTH}
                  </div>
                </div>

                {isOverLimit && (
                  <p className="text-xs text-rose-600 font-semibold">
                    Nhận xét không được vượt quá {MAX_COMMENT_LENGTH} ký tự.
                  </p>
                )}

                <div className="flex items-center justify-between">
                  {justSaved ? (
                    <div className="flex items-center gap-2 text-mint-600 text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      Đã lưu nhận xét
                    </div>
                  ) : (
                    <div />
                  )}
                  <button
                    onClick={() => handleSave(student.id)}
                    disabled={!canSave}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                      canSave
                        ? 'bg-gradient-to-r from-mint-600 to-mint-400 text-white shadow-md shadow-mint-100 hover:shadow-lg hover:-translate-y-0.5'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Lưu nhận xét
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
