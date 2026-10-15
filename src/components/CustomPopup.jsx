import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function CustomPopup({
  isOpen,
  title = "Are you sure?",
  message = "Are you sure you want to proceed?",
  confirmText = "OK",
  cancelText = "Cancel",
  type = "danger", // 'danger' | 'warning' | 'info' | 'success'
  isAlert = false,
  onConfirm,
  onCancel
}) {
  // Lock body scroll while popup is open & listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onCancel) onCancel();
        else if (onConfirm) onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel, onConfirm]);

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mb-3.5 shadow-2xs">
            <Trash2 className="w-7 h-7 stroke-[1.8]" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-3.5 shadow-2xs">
            <AlertTriangle className="w-7 h-7 stroke-[1.8]" />
          </div>
        );
      case 'success':
        return (
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-3.5 shadow-2xs">
            <CheckCircle2 className="w-7 h-7 stroke-[1.8]" />
          </div>
        );
      default:
        return (
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1944F1] border border-blue-100 flex items-center justify-center mb-3.5 shadow-2xs">
            <AlertCircle className="w-7 h-7 stroke-[1.8]" />
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={onCancel || onConfirm}
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 14 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white rounded-[28px] p-6 max-w-[340px] w-full shadow-2xl border border-slate-100 relative z-10 flex flex-col items-center text-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Icon Button */}
            {!isAlert && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors active:scale-95"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Header Icon */}
            {getIcon()}

            {/* Title */}
            <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight leading-snug">
              {title}
            </h3>

            {/* Message Body */}
            {message && (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed px-1">
                {message}
              </p>
            )}

            {/* Buttons Row */}
            <div className="flex items-center gap-2.5 w-full mt-6">
              {!isAlert && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all active:scale-[0.98]"
                >
                  {cancelText}
                </button>
              )}

              <button
                type="button"
                onClick={onConfirm}
                className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs transition-all active:scale-[0.98] shadow-md ${
                  type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25'
                    : 'bg-[#1944F1] hover:bg-blue-700 text-white shadow-blue-500/25'
                }`}
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
