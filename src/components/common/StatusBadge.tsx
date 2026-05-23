import React from 'react';

export type StatusBadgeType = 'status' | 'assignment_type' | 'custom';

export interface StatusBadgeProps {
  type: StatusBadgeType;
  value?: string;
  color?: string;
  label?: string;
  className?: string;
}

export default function StatusBadge({ type, value = '', color, label, className = '' }: StatusBadgeProps) {
  if (type === 'custom') {
    const colorMap: Record<string, { bg: string, text: string, border: string, dot: string }> = {
      mint: { bg: 'rgba(34, 197, 94, 0.08)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.15)', dot: 'bg-green-500 animate-pulse' },
      blue: { bg: 'rgba(59, 130, 246, 0.08)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.15)', dot: 'bg-blue-500' },
      slate: { bg: 'rgba(148, 163, 184, 0.08)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.15)', dot: 'bg-slate-500' },
      rose: { bg: 'rgba(244, 63, 94, 0.08)', text: '#f43f5e', border: 'rgba(244, 63, 94, 0.15)', dot: 'bg-rose-500' },
      yellow: { bg: 'rgba(234, 179, 8, 0.08)', text: '#eab308', border: 'rgba(234, 179, 8, 0.15)', dot: 'bg-yellow-500' },
    };

    const style = colorMap[color || 'blue'] || colorMap.blue;
    return (
      <span
        style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} style={{ backgroundColor: style.text }}></span>
        {label || value || ''}
      </span>
    );
  }

  // Normalize value for matching
  const norm = value.trim().toLowerCase();

  if (type === 'status') {
    let color = '#3b82f6'; // default graded blue
    let label = value;
    let dotClass = 'bg-blue-500';
    let bgStyle = { backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.15)' };

    if (norm === 'open' || norm === 'đang mở') {
      color = '#22c55e'; // Green
      label = 'Đang mở';
      dotClass = 'bg-green-500 animate-pulse';
      bgStyle = { backgroundColor: 'rgba(34, 197, 94, 0.08)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.15)' };
    } else if (norm === 'pending_grade' || norm === 'chờ chấm' || norm === 'chờ chấm điểm') {
      color = '#eab308'; // Yellow
      label = 'Chờ chấm';
      dotClass = 'bg-yellow-500';
      bgStyle = { backgroundColor: 'rgba(234, 179, 8, 0.08)', color: '#eab308', borderColor: 'rgba(234, 179, 8, 0.15)' };
    } else if (norm === 'graded' || norm === 'đã chấm') {
      color = '#3b82f6'; // Blue
      label = 'Đã chấm';
      dotClass = 'bg-blue-500';
      bgStyle = { backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.15)' };
    } else if (norm === 'overdue' || norm === 'quá hạn') {
      color = '#ef4444'; // Red
      label = 'Quá hạn';
      dotClass = 'bg-red-500';
      bgStyle = { backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.15)' };
    }

    return (
      <span
        style={bgStyle}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} style={{ backgroundColor: color }}></span>
        {label}
      </span>
    );
  } else {
    // assignment_type
    let color = '#a855f7'; // default essay purple
    let label = value;
    let bgStyle = { backgroundColor: 'rgba(168, 85, 247, 0.08)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.15)' };

    if (norm === 'essay' || norm === 'tự luận') {
      color = '#a855f7'; // Purple
      label = 'Tự luận';
      bgStyle = { backgroundColor: 'rgba(168, 85, 247, 0.08)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.15)' };
    } else if (norm === 'multiple_choice' || norm === 'trắc nghiệm') {
      color = '#f97316'; // Orange
      label = 'Trắc nghiệm';
      bgStyle = { backgroundColor: 'rgba(249, 115, 22, 0.08)', color: '#f97316', borderColor: 'rgba(249, 115, 22, 0.15)' };
    } else if (norm === 'video') {
      color = '#06b6d4'; // Cyan for video
      label = 'Video';
      bgStyle = { backgroundColor: 'rgba(6, 182, 212, 0.08)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.15)' };
    } else if (norm === 'giáo án') {
      color = '#ec4899'; // Pink for lesson plan
      label = 'Giáo án';
      bgStyle = { backgroundColor: 'rgba(236, 72, 153, 0.08)', color: '#ec4899', borderColor: 'rgba(236, 72, 153, 0.15)' };
    }

    return (
      <span
        style={bgStyle}
        className={`inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${className}`}
      >
        {label}
      </span>
    );
  }
}
