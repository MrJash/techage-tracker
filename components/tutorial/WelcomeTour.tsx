import React, { useEffect } from 'react';
import { Compass, X, ArrowRight } from 'lucide-react';
import { Button } from '../Button';

interface WelcomeTourProps {
  isOpen: boolean;
  onStartTour: () => void;
  onDismiss: () => void;
}

export const WelcomeTour: React.FC<WelcomeTourProps> = ({
  isOpen,
  onStartTour,
  onDismiss,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onDismiss}
    >
      <div 
        className="relative bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Dismiss (Esc)"
          aria-label="Close welcome prompt"
        >
          <X size={18} />
        </button>

        {/* Badge Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 ring-1 ring-primary/20">
          <Compass size={24} className="shrink-0 text-primary" />
        </div>

        {/* Header */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Welcome to TechAge Tracker
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
          Monitor your hardware lifespans, track real-time warranty statuses, manage multi-currency valuations, and preserve PDF receipts with cloud sync.
        </p>

        <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium mt-3">
          Would you like a quick 1-minute guided tour of the key features?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-6 mt-2 border-t border-slate-100 dark:border-zinc-800/80">
          <Button
            variant="secondary"
            onClick={onDismiss}
            className="w-full sm:w-auto text-xs py-2 h-9"
          >
            Explore on My Own
          </Button>

          <Button
            variant="primary"
            onClick={onStartTour}
            className="w-full sm:w-auto text-xs py-2 h-9 flex items-center justify-center gap-1.5"
          >
            <span>Take a Tour</span>
            <ArrowRight size={14} className="shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  );
};
