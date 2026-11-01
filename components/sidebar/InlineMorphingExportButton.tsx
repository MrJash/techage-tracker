import React, { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';

export interface InlineMorphingExportButtonProps {
  onExportCSV?: () => void;
  onExportJSON: () => void;
  className?: string;
}

export const InlineMorphingExportButton: React.FC<InlineMorphingExportButtonProps> = ({
  onExportCSV,
  onExportJSON,
  className = '',
}) => {
  const [isChoosing, setIsChoosing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const handleStartChoosing = () => {
    clearTimer();
    setIsChoosing(true);
    timerRef.current = setTimeout(() => {
      setIsChoosing(false);
    }, 5000);
  };

  const handleSelectCSV = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearTimer();
    setIsChoosing(false);
    onExportCSV?.();
  };

  const handleSelectJSON = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearTimer();
    setIsChoosing(false);
    onExportJSON();
  };

  return (
    <div className={`relative w-full h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-900 transition-colors ${className}`}>
      {/* 1. Default State: Download Icon + "Export" text */}
      <button
        type="button"
        onClick={handleStartChoosing}
        className={`absolute inset-0 w-full h-full flex items-center justify-center px-3 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-900 hover:text-white dark:hover:bg-zinc-800 dark:hover:text-white rounded-lg transition-all duration-300 ${
          isChoosing 
            ? 'opacity-0 scale-90 pointer-events-none' 
            : 'opacity-100 scale-100 pointer-events-auto'
        }`}
        title="Export options"
      >
        <Download size={14} className="mr-2 shrink-0 transition-transform duration-300" />
        <span>Export</span>
      </button>

      {/* 2. Choice State: [ (CSV in box) (JSON in box) ] - Full-bleed hover areas */}
      <div
        className={`absolute inset-0 w-full h-full flex items-stretch transition-all duration-300 ${
          isChoosing 
            ? 'opacity-100 scale-100 pointer-events-auto' 
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* CSV Option - Fills entire left half with matching rounded radius */}
        <button
          type="button"
          onClick={handleSelectCSV}
          className="flex-1 h-full flex items-center justify-center rounded-l-lg hover:bg-slate-200/90 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 active:bg-slate-300 dark:active:bg-zinc-700 transition-colors cursor-pointer group/csv"
          title="Export as CSV"
        >
          <span className="w-12 h-5 rounded border border-emerald-500/80 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] tracking-wider flex items-center justify-center group-hover/csv:bg-emerald-600 group-hover/csv:text-white transition-colors shadow-2xs">
            CSV
          </span>
        </button>

        {/* JSON Option - Fills entire right half with matching rounded radius */}
        <button
          type="button"
          onClick={handleSelectJSON}
          className="flex-1 h-full flex items-center justify-center rounded-r-lg hover:bg-slate-200/90 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 active:bg-slate-300 dark:active:bg-zinc-700 transition-colors cursor-pointer group/json"
          title="Export as JSON"
        >
          <span className="w-12 h-5 rounded border border-blue-500/80 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-[10px] tracking-wider flex items-center justify-center group-hover/json:bg-blue-600 group-hover/json:text-white transition-colors shadow-2xs">
            JSON
          </span>
        </button>
      </div>
    </div>
  );
};
