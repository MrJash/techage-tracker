import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Collection } from '../types';
import {
  Folder, Plus, LayoutGrid, Trash2, Download, Upload, Pencil, Check, X,
  Smartphone, Laptop, Monitor, Tablet, Headphones, PcCase,
  Camera, Gamepad2, Tv, Cpu, HardDrive, Watch, Home, Speaker, LogOut,

  Router, Usb, BatteryCharging, PanelLeft, PanelLeftClose,
  RefreshCw, CloudUpload, AlertCircle,
  type LucideIcon
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './AlertDialog';
import { Button } from './ui/button';

// ---------------------------------------------------------------------------
// Google G icon SVG (inline, no external dependency)
// ---------------------------------------------------------------------------
const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

// ---------------------------------------------------------------------------
// Keyword → Icon mapping
// The collection name is lowercased and checked for keywords in priority order.
// First match wins. Falls back to Folder.
// ---------------------------------------------------------------------------
const LandscapeTablet = (props: any) => <Tablet {...props} className={`${props.className || ''} -rotate-90`} />;

export function getCollectionIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  for (const rule of ICON_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return rule.icon as LucideIcon;
    }
  }
  return Folder;
}

const ICON_RULES: { keywords: string[]; icon: any }[] = [
  
  { keywords: ['headphone', 'headset', 'over-ear', 'on-ear'],                                       icon: Headphones },
  { keywords: ['earbud', 'airpod', 'in-ear', 'tws', 'bud'],                                        icon: Headphones },
  { keywords: ['smartwatch', 'smart watch', 'wearable', 'fitbit', 'garmin', 'apple watch'],        icon: Watch },
  { keywords: ['smartphone', 'phone', 'mobile', 'iphone', 'android', 'samsung', 'pixel', 'oneplus'], icon: Smartphone },
  { keywords: ['laptop', 'macbook', 'notebook', 'chromebook', 'ultrabook'],                         icon: Laptop },
  { keywords: ['pc', 'desktop', 'computer', 'workstation', 'mac mini', 'imac', 'build'],            icon: PcCase },

  { keywords: ['tablet', 'ipad', 'surface', 'kindle'],                                              icon: LandscapeTablet },
  { keywords: ['speaker', 'audio', 'sound', 'sonos', 'bose', 'marshall', 'bluetooth speaker'],      icon: Speaker },
  { keywords: ['camera', 'dslr', 'mirrorless', 'gopro', 'lens', 'photo'],                          icon: Camera },
  { keywords: ['gaming', 'console', 'playstation', 'xbox', 'nintendo', 'gamepad', 'ps5', 'ps4'],   icon: Gamepad2 },
  { keywords: ['television', 'oled', 'qled', 'projector'],                                         icon: Tv },
  { keywords: ['monitor', 'screen', 'ultrawide', 'display'],                                        icon: Monitor },
  { keywords: ['tv'],                                                                                icon: Tv },
  { keywords: ['cpu', 'processor', 'chip', 'gpu', 'graphics', 'nvidia', 'amd', 'intel'],           icon: Cpu },
  { keywords: ['storage', 'ssd', 'hdd', 'hard drive', 'nas', 'flash', 'drive'],                   icon: HardDrive },
  { keywords: ['network', 'router', 'wifi', 'modem', 'lan', 'internet'],                           icon: Router },
  { keywords: ['charger', 'battery', 'powerbank', 'power bank', 'ups', 'cable', 'usb', 'hub', 'adapter'], icon: BatteryCharging },
  { keywords: ['smart home', 'home', 'iot', 'alexa', 'google home', 'smart plug', 'automation'],   icon: Home },
  { keywords: ['electronic', 'gadget', 'tech', 'device', 'gear'],                                   icon: Cpu },
];


interface AuthUser {
  displayName: string | null;
  photoURL: string | null;
}

interface SidebarProps {
  collections: Collection[];
  activeCollectionId: string;
  onSelectCollection: (id: string) => void;
  onAddCollection: (name: string) => void;
  onDeleteCollection: (id: string) => void;
  onRenameCollection: (id: string, newName: string) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (isOpen: boolean) => void;
  user: AuthUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isSyncing: boolean;
  authError?: string | null;
  hasPendingSync?: boolean;
  onManualSync?: () => void;
  syncError?: string | null;
}

interface SidebarContentProps {
  collections: Collection[];
  activeCollectionId: string;
  onSelectCollection: (id: string) => void;
  onAddCollection: (name: string) => void;
  onDeleteCollection: (id: string) => void;
  onRenameCollection: (id: string, newName: string) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  closeMobile?: () => void;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  user: AuthUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isSyncing: boolean;
  authError?: string | null;
  hasPendingSync?: boolean;
  onManualSync?: () => void;
  syncError?: string | null;
}

// ---------------------------------------------------------------------------
// Collapsed Sidebar Profile & Action Menu
// ---------------------------------------------------------------------------
const CollapsedProfileMenu: React.FC<{
  user: AuthUser | null;
  isSyncing: boolean;
  hasPendingSync?: boolean;
  syncError?: string | null;
  onManualSync?: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
  onImportClick: () => void;
  onExportData: () => void;
}> = ({
  user,
  isSyncing,
  hasPendingSync,
  syncError,
  onManualSync,
  onSignOut,
  onSignIn,
  onImportClick,
  onExportData,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<any>(null);
  const [coords, setCoords] = useState<{ left: number; bottom: number } | null>(null);

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
      {/* Profile Icon button: hover trigger bound strictly to button circle, NO scale/movement */}
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

          {/* Hint when hovered only (smoothly collapses when open) */}
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

          {/* Action buttons (smoothly expands when clicked) */}
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

                {/* Export Button */}
                <button
                  type="button"
                  onClick={() => {
                    onExportData();
                    setIsOpen(false);
                    setIsHovered(false);
                  }}
                  className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
                  title="Export backup JSON"
                >
                  <Download size={16} />
                  <span className="text-[10px] mt-1 font-medium">Export</span>
                </button>

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

const SidebarContent: React.FC<SidebarContentProps> = ({ 
  collections, 
  activeCollectionId, 
  onSelectCollection, 
  onAddCollection,
  onDeleteCollection,
  onRenameCollection,
  onExportData,
  onImportData,
  closeMobile,
  isCollapsed = false,
  toggleCollapse,
  user,
  onSignIn,
  onSignOut,
  isSyncing,
  authError,
  hasPendingSync,
  onManualSync,
  syncError,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [collectionToDelete, setCollectionToDelete] = useState<{ id: string, name: string, anchorRect?: DOMRect } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      onAddCollection(newCollectionName.trim());
      setNewCollectionName('');
      setIsAdding(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, collectionId: string, collectionName: string) => {
    e.stopPropagation();
    e.preventDefault();
    const lineElement = (e.currentTarget as HTMLElement).closest('.group');
    const rect = lineElement ? lineElement.getBoundingClientRect() : (e.currentTarget as HTMLElement).getBoundingClientRect();
    setCollectionToDelete({ id: collectionId, name: collectionName, anchorRect: rect });
  };



  const handleRenameClick = (e: React.MouseEvent, collection: Collection) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingId(collection.id);
    setEditingName(collection.name);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && editingName.trim()) {
      onRenameCollection(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-black border-r border-slate-200 dark:border-zinc-800 transition-[width] overflow-hidden duration-300 relative ${isCollapsed ? 'w-[72px]' : 'w-64'}`}>
      <div className={`h-20 flex items-center border-b border-slate-200 dark:border-zinc-800 shrink-0 transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        
        {/* App Logo & Title */}
        <div className={`flex items-center text-slate-900 dark:text-white font-bold text-xl select-none transition-all duration-300 overflow-hidden ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
          <div className="bg-slate-900 dark:bg-white text-white dark:text-black p-1.5 rounded-lg shrink-0">
            <LayoutGrid size={20} />
          </div>
          <span className="whitespace-nowrap ml-2">TechTracker</span>
        </div>

        {/* Collapse toggle — always visible */}
        {toggleCollapse && (
          <button 
            onClick={toggleCollapse} 
            className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-zinc-800 transition-all duration-300 focus:outline-none"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-x-0 space-y-1">
        <div className={`text-xs font-semibold text-slate-400 dark:text-zinc-600 uppercase tracking-wider transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-6 opacity-100 mb-2 px-3'}`}>
          Collections
        </div>
        
        {collections.map(collection => (
          <div 
            key={collection.id}
            className={`group flex items-center w-full rounded-lg transition-colors ${
              activeCollectionId === collection.id 
                ? 'bg-slate-100 dark:bg-zinc-900' 
                : 'hover:bg-slate-50 dark:hover:bg-zinc-900'
            }`}
          >
            {editingId === collection.id ? (
              /* Inline rename form */
              <form
                onSubmit={handleRenameSubmit}
                className="flex-1 flex items-center gap-1 py-1.5 pl-3 pr-1 min-w-0"
                onClick={(e) => e.stopPropagation()}
              >
                {React.createElement(getCollectionIcon(editingName || collection.name), { size: 16, className: 'text-slate-400 dark:text-zinc-500 flex-shrink-0 mr-1' })}
                <input
                  autoFocus
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  maxLength={28}
                  className="flex-1 min-w-0 px-1.5 py-1 text-sm border border-slate-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                  onKeyDown={(e) => e.key === 'Escape' && handleRenameCancel()}
                  onBlur={() => setTimeout(handleRenameCancel, 150)}
                />
                <button
                  type="submit"
                  className="p-1.5 text-slate-500 hover:text-green-600 dark:text-zinc-400 dark:hover:text-green-400 rounded transition-colors flex-shrink-0"
                  title="Save"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleRenameCancel}
                  className="p-1.5 text-slate-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 rounded transition-colors flex-shrink-0"
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </form>
            ) : (
              <>
                {/* Main selection area — name + click zone */}
                <button
                    type="button"
                    title={isCollapsed ? collection.name : undefined}
                    className={`flex-1 flex items-center py-2.5 text-left min-w-0 border-none bg-transparent focus:outline-none cursor-pointer transition-all duration-300 ${isCollapsed ? 'pl-[15px] pr-0' : 'pl-3'} ${
                       activeCollectionId === collection.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    onClick={() => {
                        onSelectCollection(collection.id);
                        if (closeMobile) closeMobile();
                    }}
                >
                  {React.createElement(getCollectionIcon(collection.name), { size: 18, className: `flex-shrink-0 transition-all duration-300 ${isCollapsed ? '' : 'mr-3'} ${activeCollectionId === collection.id ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-500'}` })}
                  <span className={`truncate text-sm font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
                    {collection.name}
                  </span>
                </button>

                <div className={`flex items-center transition-all duration-300 overflow-hidden ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[100px] opacity-100'}`}>
                  {/* Rename button */}
                    <button
                        type="button"
                        onClick={(e) => handleRenameClick(e, collection)}
                        className="p-2 text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Rename collection"
                    >
                        <Pencil size={13} />
                    </button>

                    {/* Delete button */}
                    <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, collection.id, collection.name)}
                        className="p-2 mr-1 text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete collection"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
              </>
            )}
          </div>
        ))}

        {!isCollapsed && isAdding ? (
          <form onSubmit={handleAddSubmit} className="mt-2 px-2">
            <input
              autoFocus
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              maxLength={20}
              placeholder="Collection name..."
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
              onBlur={() => !newCollectionName && setIsAdding(false)}
            />
          </form>
        ) : (
          <button 
            type="button"
            onClick={() => {
              if (toggleCollapse && isCollapsed) toggleCollapse();
              setIsAdding(true);
            }}
            title={isCollapsed ? "New Collection" : undefined}
            className={`flex items-center overflow-hidden w-full text-sm font-medium text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-lg transition-all duration-300 mt-2 ${isCollapsed ? 'pl-[15px] pr-0 py-2.5' : 'px-3 py-2'}`}
          >
            <Plus size={18} className={`shrink-0 transition-all duration-300 ${isCollapsed ? '' : 'mr-3'}`} />
            <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
              New Collection
            </span>
          </button>
        )}
      </div>

      {/* Expanded Sections Container: Cloud Save & Local Save with synchronized smooth collapse */}
      <div 
        className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden shrink-0 border-t border-slate-100 dark:border-zinc-800 ${
          isCollapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[400px] opacity-100 pointer-events-auto'
        }`}
      >
        <div className="w-64">
          {/* Cloud Save */}
          <div className="px-4 pt-3 pb-3">
            <div className="text-xs font-semibold text-slate-400 dark:text-zinc-600 uppercase tracking-wider mb-2.5">Cloud Save</div>
            {user ? (
              <div>
                <div className="flex items-center gap-2.5">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} referrerPolicy="no-referrer" className="w-7 h-7 rounded-full shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-zinc-300 shrink-0">
                      {user.displayName?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 truncate">{user.displayName ?? 'Signed in'}</p>
                    {isSyncing ? (
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full border border-slate-300 dark:border-zinc-600 border-t-slate-600 dark:border-t-zinc-300 animate-spin inline-block" />
                        Syncing…
                      </p>
                    ) : hasPendingSync ? (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Local import not synced</p>
                    ) : syncError ? (
                      <p className="text-[10px] text-red-500 font-medium truncate" title={syncError}>Sync failed</p>
                    ) : (
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500">Synced to cloud</p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {onManualSync && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onManualSync}
                        disabled={isSyncing}
                        title="Sync to Firebase now"
                        className="h-7 w-7 p-0 shrink-0 text-slate-400 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-200"
                      >
                        <RefreshCw size={13} className={isSyncing ? "animate-spin text-blue-500" : ""} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onSignOut}
                      title="Sign out"
                      className="h-7 w-7 p-0 shrink-0 text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
                    >
                      <LogOut size={14} />
                    </Button>
                  </div>
                </div>

                {hasPendingSync && onManualSync && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={onManualSync}
                    disabled={isSyncing}
                    className="w-full mt-2.5 h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium gap-1.5 shadow-sm"
                  >
                    <CloudUpload size={13} />
                    {isSyncing ? 'Syncing...' : 'Sync to Firebase'}
                  </Button>
                )}

                {syncError && !hasPendingSync && onManualSync && (
                  <div className="mt-2 flex items-center justify-between text-[11px] text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded">
                    <span className="truncate mr-1">{syncError}</span>
                    <button 
                      onClick={onManualSync}
                      className="underline font-semibold hover:text-red-700 shrink-0"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSignIn}
                  className="w-full h-8 text-xs gap-2"
                >
                  <GoogleIcon />
                  Sign in with Google
                </Button>
                {authError && (
                  <p className="text-xs text-red-500 mt-1 text-center">{authError}</p>
                )}
              </>
            )}
          </div>

          {/* Local Save */}
          <div className="border-t border-slate-100 dark:border-zinc-800 px-4 pt-3 pb-4">
            <div className="text-xs font-semibold text-slate-400 dark:text-zinc-600 uppercase tracking-wider mb-2.5">Local Save</div>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={handleImportClick}
                className="flex flex-1 items-center justify-center px-3 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-900 hover:text-white dark:hover:bg-zinc-800 dark:hover:text-white rounded-lg transition-colors"
              >
                <Upload size={14} className="mr-2 shrink-0" />
                <span>Import</span>
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json" 
                onChange={onImportData} 
                className="hidden" 
                style={{ display: 'none' }}
              />
              
              <button 
                type="button"
                onClick={onExportData}
                className="flex flex-1 items-center justify-center px-3 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-900 hover:text-white dark:hover:bg-zinc-800 dark:hover:text-white rounded-lg transition-colors"
              >
                <Download size={14} className="mr-2 shrink-0" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed Footer: Profile Icon button with synchronized smooth transition */}
      <div 
        className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden shrink-0 border-t border-slate-100 dark:border-zinc-800 ${
          isCollapsed ? 'max-h-20 opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <CollapsedProfileMenu
          user={user}
          isSyncing={isSyncing}
          hasPendingSync={hasPendingSync}
          syncError={syncError}
          onManualSync={onManualSync}
          onSignOut={onSignOut}
          onSignIn={onSignIn}
          onImportClick={handleImportClick}
          onExportData={onExportData}
        />
      </div>

      <AlertDialog open={!!collectionToDelete} onOpenChange={(open) => !open && setCollectionToDelete(null)}>
        <AlertDialogContent anchorRect={collectionToDelete?.anchorRect}>

          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">"{collectionToDelete?.name}"</span>? This will permanently delete all products inside this collection. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="secondary">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (collectionToDelete) {
                    onDeleteCollection(collectionToDelete.id);
                    setCollectionToDelete(null);
                  }
                }}
              >
                Delete Collection
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  collections, 
  activeCollectionId, 
  onSelectCollection, 
  onAddCollection,
  onDeleteCollection,
  onRenameCollection,
  onExportData,
  onImportData,
  isOpenMobile,
  setIsOpenMobile,
  user,
  onSignIn,
  onSignOut,
  isSyncing,
  authError,
  hasPendingSync,
  onManualSync,
  syncError,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {isOpenMobile && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsOpenMobile(false)}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent 
            collections={collections}
            activeCollectionId={activeCollectionId}
            onSelectCollection={onSelectCollection}
            onAddCollection={onAddCollection}
            onDeleteCollection={onDeleteCollection}
            onRenameCollection={onRenameCollection}
            onExportData={onExportData}
            onImportData={onImportData}
            closeMobile={() => setIsOpenMobile(false)}
            isCollapsed={false}
            user={user}
            onSignIn={onSignIn}
            onSignOut={onSignOut}
            isSyncing={isSyncing}
            authError={authError}
            hasPendingSync={hasPendingSync}
            onManualSync={onManualSync}
            syncError={syncError}
        />
      </div>

      <div className="hidden lg:block h-screen sticky top-0 transition-[width] duration-300">
        <SidebarContent 
            collections={collections}
            activeCollectionId={activeCollectionId}
            onSelectCollection={onSelectCollection}
            onAddCollection={onAddCollection}
            onDeleteCollection={onDeleteCollection}
            onRenameCollection={onRenameCollection}
            onExportData={onExportData}
            onImportData={onImportData}
            isCollapsed={isCollapsed}
            toggleCollapse={() => setIsCollapsed(!isCollapsed)}
            user={user}
            onSignIn={onSignIn}
            onSignOut={onSignOut}
            isSyncing={isSyncing}
            authError={authError}
            hasPendingSync={hasPendingSync}
            onManualSync={onManualSync}
            syncError={syncError}
        />
      </div>
    </>
  );
};