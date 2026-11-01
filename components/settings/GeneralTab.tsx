import React from 'react';
import { 
  Sun, 
  Moon, 
  Laptop, 
  HardDrive, 
  FileSpreadsheet, 
  FileJson, 
  ShieldCheck, 
  LogOut, 
  RefreshCw, 
  AlertTriangle, 
  Trash2 
} from 'lucide-react';

export type ThemeMode = 'system' | 'dark' | 'light';

interface GeneralTabProps {
  themeMode?: ThemeMode;
  onThemeModeChange?: (mode: ThemeMode) => void;
  totalCollectionsCount?: number;
  totalProductsCount?: number;
  totalReceiptsCount?: number;
  totalReceiptsBytes?: number;
  onExportCSV?: () => void;
  onExportJSON?: () => void;
  user?: {
    displayName: string | null;
    email?: string | null;
    photoURL: string | null;
  } | null;
  isSyncing?: boolean;
  onCloudResync?: () => void;
  onSignOut?: () => void;
  onSignIn?: () => void;
  onRequestResetData: () => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  themeMode = 'system',
  onThemeModeChange,
  totalCollectionsCount = 0,
  totalProductsCount = 0,
  totalReceiptsCount = 0,
  totalReceiptsBytes = 0,
  onExportCSV,
  onExportJSON,
  user,
  isSyncing = false,
  onCloudResync,
  onSignOut,
  onSignIn,
  onRequestResetData,
}) => {
  // Format storage bytes into friendly KB or MB
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const ESTIMATED_LOCAL_QUOTA_BYTES = 5 * 1024 * 1024; // 5 MB standard localStorage budget
  const quotaPercent = Math.min(100, Math.round((totalReceiptsBytes / ESTIMATED_LOCAL_QUOTA_BYTES) * 100));

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Theme Mode Selector */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun size={16} className="text-slate-500 dark:text-zinc-400" />
            Theme Mode
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Lock your preferred appearance or dynamically mirror your system theme.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { id: 'system' as ThemeMode, label: 'System (Auto)', icon: Laptop },
            { id: 'light' as ThemeMode, label: 'Light Mode', icon: Sun },
            { id: 'dark' as ThemeMode, label: 'Dark Mode', icon: Moon },
          ].map(item => {
            const isSelected = themeMode === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onThemeModeChange?.(item.id)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <Icon size={14} className="shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Big Card 1: Inventory & Local Storage */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive size={16} className="text-slate-500 dark:text-zinc-400" />
            Inventory & Storage
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
            Overview of your tracked items, offline receipt cache, and data exports.
          </p>
        </div>

        {/* Top Section: Total Collections & Total Products Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Collections
            </span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
              {totalCollectionsCount}
            </p>
          </div>
          <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Products
            </span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
              {totalProductsCount}
            </p>
          </div>
        </div>

        {/* Nested Card 1: Storage & Receipt Footprint */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <HardDrive size={14} className="text-slate-500 dark:text-zinc-400" />
                Storage & Receipt Footprint
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Total local browser storage used by cached offline receipts and item attachments.
              </p>
            </div>

            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono shrink-0">
              {formatBytes(totalReceiptsBytes)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-0.5">
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  quotaPercent > 80 ? 'bg-red-500' : quotaPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`} 
                style={{ width: `${Math.max(4, quotaPercent)}%` }} 
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
              <span>{totalReceiptsCount} receipt{totalReceiptsCount !== 1 ? 's' : ''} stored</span>
              <span>5 MB estimated local quota ({quotaPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Nested Card 2: Backup & Data Portability */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 shadow-2xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet size={14} className="text-slate-500 dark:text-zinc-400" />
                Backup & Data Portability
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Export your entire hardware inventory at any time in either format:
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onExportCSV && (
                <button
                  type="button"
                  onClick={onExportCSV}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" />
                  Export CSV
                </button>
              )}
              {onExportJSON && (
                <button
                  type="button"
                  onClick={onExportJSON}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <FileJson size={14} className="text-blue-600 dark:text-blue-400" />
                  Export JSON
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Big Card 2: Google Account & Cloud Services */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 space-y-4">
        {/* Top Section: Google Account Profile & Auth */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-slate-500 dark:text-zinc-400" />
                Google Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {user ? 'Manage cloud sync authentication and profile.' : 'Sign in to sync your hardware inventory across devices.'}
              </p>
            </div>

            {user && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            )}
          </div>

          {user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-zinc-700" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-zinc-200 shrink-0">
                    {user.displayName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {user.displayName || 'Signed In User'}
                  </p>
                  {user.email && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>

              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 bg-white dark:bg-zinc-900 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-800 transition-colors shadow-2xs shrink-0 cursor-pointer"
                >
                  <LogOut size={14} className="shrink-0" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          ) : (
            onSignIn && (
              <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 shadow-2xs flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Sign in with Google to synchronize your hardware inventory to the cloud.
                </p>
                <button
                  type="button"
                  onClick={onSignIn}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm cursor-pointer shrink-0"
                >
                  Sign in with Google
                </button>
              </div>
            )
          )}
        </div>

        {/* Nested Card 1: Cloud Resync & Cache Refresh */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 shadow-2xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw size={14} className="text-slate-500 dark:text-zinc-400" />
                Cloud Resync & Cache Refresh
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Discard local in-memory receipt caches and pull a fresh, authoritative snapshot from Firestore.
              </p>
            </div>

            <button
              type="button"
              onClick={onCloudResync}
              disabled={!user || isSyncing}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors shadow-2xs shrink-0 cursor-pointer"
              title={!user ? 'Sign in with Google to resync from Cloud' : 'Fetch fresh snapshot from Firestore'}
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Resync from Cloud'}</span>
            </button>
          </div>
        </div>

        {/* Nested Card 2: Danger Zone: Reset Workspace Data */}
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/25 shadow-2xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-600 dark:text-red-400" />
                Danger Zone: Reset Workspace Data
              </h4>
              <p className="text-[11px] text-red-600/80 dark:text-red-300/70 mt-0.5 leading-relaxed">
                Permanently purge all local collections, products, receipts, and preference overrides from this device.
              </p>
            </div>

            <button
              type="button"
              onClick={onRequestResetData}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <Trash2 size={13} className="shrink-0" />
              <span>Reset All Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
