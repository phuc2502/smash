import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, AlertTriangle, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Xóa',
  cancelText = 'Hủy',
  type = 'danger',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="w-14 h-14 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-lg shadow-rose-100/50">
            <Trash2 className="w-6 h-6 animate-pulse" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-100/50">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          </div>
        );
      default:
        return (
          <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-100/50">
            <HelpCircle className="w-6 h-6" />
          </div>
        );
    }
  };

  const getConfirmButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-gradient-to-r from-rose-600 to-rose-500 hover:shadow-rose-100 hover:from-rose-700 hover:to-rose-600 text-white shadow-rose-50';
      case 'warning':
        return 'bg-gradient-to-r from-amber-600 to-amber-500 hover:shadow-amber-100 hover:from-amber-700 hover:to-amber-600 text-white shadow-amber-50';
      default:
        return 'bg-gradient-to-r from-mint-600 to-mint-500 hover:shadow-mint-100 hover:from-mint-700 hover:to-mint-600 text-white shadow-mint-50';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white w-full max-w-sm rounded-[36px] shadow-2xl border border-slate-100 overflow-hidden p-6 text-center space-y-6"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Banner */}
            <div className="flex justify-center pt-2">
              {getIcon()}
            </div>

            {/* Header Content */}
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
              <p className="text-sm text-slate-500 font-medium px-2 leading-relaxed">{message}</p>
            </div>

            {/* Button Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-600 rounded-full font-bold text-xs uppercase tracking-widest transition-all"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg ${getConfirmButtonStyles()}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
