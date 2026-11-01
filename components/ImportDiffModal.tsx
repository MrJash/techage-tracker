import React from 'react';
import { ImportDiffResult } from '../utils/diffHelpers';
import { Button } from './ui/button';
import { 
  Cloud, 
  HardDrive, 
  X, 
  Plus, 
  Minus, 
  RefreshCw, 
  AlertTriangle, 
  ArrowRight, 
  Folder
} from 'lucide-react';

interface ImportDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  diffResult: ImportDiffResult;
  onConfirmOverrideCloud: () => void;
  onConfirmKeepLocal: () => void;
  isProcessing?: boolean;
}

export const ImportDiffModal: React.FC<ImportDiffModalProps> = ({
  isOpen,
  onClose,
  diffResult,
  onConfirmOverrideCloud,
  onConfirmKeepLocal,
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Import Difference Detected
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Your imported file differs from the data saved in Firebase Cloud.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Diff Summary Cards */}
        <div className="px-6 py-3 bg-slate-50/70 dark:bg-zinc-950/40 border-b border-slate-100 dark:border-zinc-800 grid grid-cols-2 gap-3 shrink-0">
          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">
              <Cloud size={14} className="text-blue-500" />
              <span>Current Cloud Save</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {diffResult.cloudProductsCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                items in {diffResult.cloudCollectionsCount} collections
              </span>
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">
              <HardDrive size={14} className="text-emerald-500" />
              <span>Imported File</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {diffResult.importedProductsCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                items in {diffResult.importedCollectionsCount} collections
              </span>
            </div>
          </div>
        </div>

        {/* Change Counts Banner */}
        <div className="px-6 py-2.5 bg-slate-100/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-3 text-xs shrink-0">
          <span className="font-medium text-slate-600 dark:text-zinc-400">Changes:</span>
          {diffResult.addedProductsCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
              <Plus size={12} /> {diffResult.addedProductsCount} New Item{diffResult.addedProductsCount > 1 ? 's' : ''}
            </span>
          )}
          {diffResult.modifiedProductsCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
              <RefreshCw size={12} /> {diffResult.modifiedProductsCount} Modified Item{diffResult.modifiedProductsCount > 1 ? 's' : ''}
            </span>
          )}
          {diffResult.removedProductsCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium">
              <Minus size={12} /> {diffResult.removedProductsCount} Missing/Removed Item{diffResult.removedProductsCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Scrollable Detailed Changes List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[45vh]">
          {diffResult.collections.map((col) => {
            if (col.type === 'unchanged' && col.productDiffs.length === 0) return null;

            return (
              <div 
                key={col.id} 
                className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-slate-50/50 dark:bg-zinc-950/20"
              >
                {/* Collection Header */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100/70 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <Folder size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate">
                      {col.name}
                    </span>
                    {col.oldName && (
                      <span className="text-xs text-slate-400 line-through truncate">
                        (was: {col.oldName})
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                    col.type === 'added'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : col.type === 'removed'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  }`}>
                    {col.type}
                  </span>
                </div>

                {/* Product Differences */}
                <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {col.productDiffs.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 dark:text-zinc-500 italic">
                      No product changes in this collection
                    </div>
                  ) : (
                    col.productDiffs.map((diff, idx) => {
                      const hasChanges = Boolean(diff.changes && diff.changes.length > 0);
                      return (
                        <div 
                          key={diff.product.id || idx} 
                          className={`p-3 flex gap-2.5 text-xs ${hasChanges ? 'items-start' : 'items-center'}`}
                        >
                          {diff.type === 'added' && (
                            <span className={`p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 ${hasChanges ? 'mt-0.5' : ''}`}>
                              <Plus size={12} />
                            </span>
                          )}
                          {diff.type === 'removed' && (
                            <span className={`p-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0 ${hasChanges ? 'mt-0.5' : ''}`}>
                              <Minus size={12} />
                            </span>
                          )}
                          {diff.type === 'modified' && (
                            <span className={`p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 ${hasChanges ? 'mt-0.5' : ''}`}>
                              <RefreshCw size={12} />
                            </span>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                {diff.product.name}
                              </span>
                              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                                ({diff.product.category})
                              </span>
                            </div>

                            {hasChanges && (
                              <div className="mt-1.5 space-y-1">
                                {diff.changes!.map((ch, cIdx) => (
                                  <div key={cIdx} className="flex items-center gap-1.5 text-[11px]">
                                    <span className="text-slate-400 dark:text-zinc-500 font-medium">
                                      {ch.field}:
                                    </span>
                                    <span className="text-rose-500 dark:text-rose-400 line-through">
                                      {ch.oldValue}
                                    </span>
                                    <ArrowRight size={10} className="text-slate-400 shrink-0" />
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                      {ch.newValue}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-zinc-950/60 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 text-center sm:text-left">
            Choose how to handle the difference with your cloud backup.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isProcessing}
              className="text-xs"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onConfirmKeepLocal}
              disabled={isProcessing}
              className="text-xs gap-1.5 border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800"
              title="Apply imported data only in this browser without updating Firebase cloud data"
            >
              <HardDrive size={13} />
              Keep Local Only
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onConfirmOverrideCloud}
              disabled={isProcessing}
              className="text-xs gap-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-semibold"
              title="Apply imported data and immediately overwrite Firebase cloud save"
            >
              <Cloud size={13} />
              Override Cloud Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
