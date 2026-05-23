import React from 'react';
import { Eye, Edit3, Trash2, FileText } from 'lucide-react';

export interface ActionColumnProps {
  actions: ('view' | 'edit' | 'delete' | 'note')[];
  onAction: (type: 'view' | 'edit' | 'delete' | 'note', itemId: string) => void;
  itemId: string;
  disabledActions?: ('view' | 'edit' | 'delete' | 'note')[];
}

export default function ActionColumn({
  actions,
  onAction,
  itemId,
  disabledActions = [],
}: ActionColumnProps) {
  const config = {
    view: {
      icon: Eye,
      label: 'Xem',
      className: 'text-slate-500 hover:text-mint-600 hover:bg-mint-50 border-slate-100 hover:border-mint-200',
    },
    edit: {
      icon: Edit3,
      label: 'Sửa',
      className: 'text-slate-500 hover:text-amber-600 hover:bg-amber-50 border-slate-100 hover:border-amber-200',
    },
    delete: {
      icon: Trash2,
      label: 'Xóa',
      className: 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-slate-100 hover:border-rose-200',
    },
    note: {
      icon: FileText,
      label: 'Ghi chú',
      className: 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border-slate-100 hover:border-indigo-200',
    },
  };

  return (
    <div className="flex items-center gap-2">
      {actions.map((act) => {
        const item = config[act];
        if (!item) return null;
        const Icon = item.icon;
        const isDisabled = disabledActions.includes(act);

        return (
          <button
            key={act}
            onClick={(e) => {
              e.stopPropagation();
              if (!isDisabled) onAction(act, itemId);
            }}
            disabled={isDisabled}
            title={item.label}
            className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95 shadow-sm bg-white/90 ${
              isDisabled
                ? 'opacity-30 cursor-not-allowed border-slate-100 text-slate-300'
                : item.className
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
