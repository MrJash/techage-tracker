import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw, Upload, Download, LogOut } from 'lucide-react';
import { AuthUser, GoogleIcon } from './sidebarUtils';

export interface CollapsedProfileMenuProps {
  user: AuthUser | null;
  isSyncing: boolean;
  hasPendingSync?: boolean;
  syncError?: string | null;
  onManualSync?: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
  onImportClick: () => void;
  onExportData: () => void;
  onExportCSV?: () => void;
}

export const CollapsedProfileMenu: React.FC<CollapsedProfileMenuProps> = ({
  user,
  isSyncing,
  hasPendingSync,
  syncError,
  onManualSync,
  onSignOut,
  onSignIn,
  onImportClick,
  onExportData,
  onExportCSV,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<any>(null);
  const [coords, setCoords] = useState<{ left: number; bottom: number } | null>(null);
  const [isExportChoosing, setIsExportChoosing] = useState(false);
  const exportTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearExportTimer = () => {
    if (exportTimerRef.current) {
      clearTimeout(exportTimerRef.current);
      exportTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearExportTimer();
  }, []);

  const handleStartExportChoice = () => {
    clearExportTimer();
    setIsExportChoosing(true);
    exportTimerRef.current = setTimeout(() => {
      setIsExportChoosing(false);
    }, 5000);
  };

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        left: rect.right + 12,
        bottom: Math.max(16, window.innerHeight - rect.bottom),
      });
    }
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    updateCoords();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCoords();
    setIsOpen(prev => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
        setIsHovered(false);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, [isOpen]);

  const showPopover = isHovered || isOpen;

  return (
    <div className="py-3 flex justify-center items-center shrink-0 relative">
      {/* Profile Icon button */}
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleToggleClick}
        title={user?.displayName || (user ? 'Account' : 'Sign in')}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 outline-none focus:outline-none ${
          isOpen 
            ? 'ring-2 ring-slate-900 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-black' 
            : 'hover:ring-2 hover:ring-slate-400 dark:hover:ring-zinc-500 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-black'
        }`}
      >
        {user ? (
          user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              referrerPolicy="no-referrer" 
              className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-zinc-200 shadow-sm">
              {user.displayName?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-sm">
            <GoogleIcon />
          </div>
        )}

        {/* Status dot */}
        {user && (
          <span 
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white dark:ring-black ${
              isSyncing 
                ? 'bg-blue-500 animate-pulse' 
                : hasPendingSync 
                ? 'bg-amber-500' 
                : syncError 
                ? 'bg-red-500' 
                : 'bg-emerald-500'
            }`} 
          />
        )}
      </button>

      {/* Animated Popover */}
      {showPopover && coords && createPortal(
        <div
          ref={popoverRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'fixed',
            left: `${coords.left}px`,
            bottom: `${coords.bottom}px`,
            zIndex: 9999,
          }}
          className="w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3.5 animate-in fade-in zoom-in-95 slide-in-from-left-2 duration-200 text-slate-900 dark:text-white"
        >
          {/* Top: Account Profile Details */}
          <div className="flex items-center gap-3">
            {user ? (
              user.photoURL ? (
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
              )
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                <GoogleIcon />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {user?.displayName || (user ? 'Signed in' : 'Not signed in')}
              </p>
              {user ? (
                isSyncing ? (
                  <p className="text-[10px] text-blue-500 flex items-center gap-1 font-medium mt-0.5">
                    <span className="w-2 h-2 rounded-full border border-blue-300 dark:border-blue-600 border-t-blue-600 dark:border-t-blue-300 animate-spin inline-block" />
                    Syncing to cloud…
                  </p>
                ) : hasPendingSync ? (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                    Local import not synced
                  </p>
                ) : syncError ? (
                  <p className="text-[10px] text-red-500 font-medium mt-0.5 truncate" title={syncError}>
                    Sync failed
                  </p>
                ) : (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Synced to cloud
                  </p>
                )
              ) : (
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                  Local mode only
                </p>
              )}
            </div>
          </div>

          {/* Hint when hovered only */}
          <div 
            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
              !isOpen ? 'grid-rows-[1fr] opacity-100 mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
            }`}
          >
            <div className="overflow-hidden flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500">
              <span>Click icon to open options</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-medium">Actions</span>
            </div>
          </div>

          {/* Action buttons */}
          <div 
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
              isOpen ? 'grid-rows-[1fr] opacity-100 mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
            }`}
          >
            <div className="overflow-hidden">
              {hasPendingSync && (
                <div className="mb-2 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                  Local imported data not synced to cloud
                </div>
              )}

              <div className="grid grid-cols-4 gap-1.5">
                {/* Sync Button */}
                <button
                  type="button"
                  onClick={() => {
                    onManualSync?.();
                  }}
                  disabled={isSyncing || !user}
                  className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-40"
                  title="Manual Sync to Firebase"
                >
                  <RefreshCw size={16} className={isSyncing ? "animate-spin text-blue-500" : ""} />
                  <span className="text-[10px] mt-1 font-medium">Sync</span>
                </button>

                {/* Import Button */}
                <button
                  type="button"
                  onClick={() => {
                    onImportClick();
                    setIsOpen(false);
                    setIsHovered(false);
                  }}
                  className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
                  title="Import backup JSON"
                >
                  <Upload size={16} />
                  <span className="text-[10px] mt-1 font-medium">Import</span>
                </button>

                {/* Export Button with Morphing Choice */}
                {isExportChoosing ? (
                  <div className="flex flex-col items-center justify-center py-1 px-0.5 rounded-xl bg-slate-100 dark:bg-zinc-800 transition-all animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-1 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          clearExportTimer();
                          setIsExportChoosing(false);
                          setIsOpen(false);
                          setIsHovered(false);
                          onExportCSV?.();
                        }}
                        className="w-5 h-5 rounded border border-emerald-500/80 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold text-[8px] flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
                        title="Export CSV"
                      >
                        CSV
                      </button>
                      <div className="w-px h-3 bg-slate-300 dark:bg-zinc-700" />
                      <button
                        type="button"
                        onClick={() => {
                          clearExportTimer();
                          setIsExportChoosing(false);
                          setIsOpen(false);
                          setIsHovered(false);
                          onExportData();
                        }}
                        className="w-5 h-5 rounded border border-blue-500/80 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold text-[7.5px] flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                        title="Export JSON"
                      >
                        JSON
                      </button>
                    </div>
                    <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">Format</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartExportChoice}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-95 transition-all outline-none"
                    title="Export options"
                  >
                    <Download size={16} />
                    <span className="text-[10px] mt-1 font-medium">Export</span>
                  </button>
                )}

                {/* Sign Out or Sign In */}
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSignOut();
                      setIsOpen(false);
                      setIsHovered(false);
                    }}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-95 transition-all"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                    <span className="text-[10px] mt-1 font-medium">Sign Out</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onSignIn();
                      setIsOpen(false);
                      setIsHovered(false);
                    }}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 active:scale-95 transition-all"
                    title="Sign in with Google"
                  >
                    <GoogleIcon />
                    <span className="text-[10px] mt-1 font-medium">Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
