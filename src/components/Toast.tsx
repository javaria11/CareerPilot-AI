import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgBorderMap = {
    success: 'bg-white border-[#006c49]/30 text-[#0b1c30] shadow-lg shadow-[#006c49]/10',
    error: 'bg-white border-[#ba1a1a]/30 text-[#0b1c30] shadow-lg shadow-[#ba1a1a]/10',
    info: 'bg-white border-[#0051cd]/30 text-[#0b1c30] shadow-lg shadow-[#0051cd]/10',
  };

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-[#006c49] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#ba1a1a] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#0051cd] shrink-0" />,
  };

  return (
    <div
      className={`pointer-events-auto p-4 rounded-xl border flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-300 ${
        bgBorderMap[toast.type]
      }`}
    >
      {iconMap[toast.type]}
      <div className="flex-1 min-w-0 pr-1">
        <h5 className="text-xs font-bold leading-tight">{toast.title}</h5>
        {toast.description && (
          <p className="text-[11px] text-[#6c7a71] mt-0.5 leading-normal">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#6c7a71] hover:text-[#0b1c30] p-0.5 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
