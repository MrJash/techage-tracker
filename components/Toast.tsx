import React, { useEffect, useState } from 'react';
import { Undo2, X, Trash2 } from 'lucide-react';


interface ToastProps {
  message: string;
  onUndo: () => void;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onUndo, onClose, duration = 5000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
        onClose();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="relative overflow-hidden bg-slate-900 dark:bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-4 min-w-[320px] border border-slate-800 dark:border-zinc-800">
        <div className="flex-1 flex items-center gap-3">
          <div className="bg-red-500/10 p-1.5 rounded-lg text-red-500/80">
            <Trash2 size={16} />
          </div>
          <span className="text-sm font-medium text-slate-200">{message}</span>
        </div>

        
        <button 
          onClick={onUndo}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors"
        >
          <Undo2 size={14} />
          Undo
        </button>

        <button 
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
          <div 
            className="h-full bg-red-500/60 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%`, transitionDuration: '10ms' }}
          />
        </div>

      </div>
    </div>
  );
};
