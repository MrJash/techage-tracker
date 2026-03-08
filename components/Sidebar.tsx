import React, { useState, useRef } from 'react';
import { Collection } from '../types';
import {
  Folder, Plus, LayoutGrid, Trash2, Download, Upload, Pencil, Check, X,
  Smartphone, Laptop, Monitor, Tablet, Headphones, PcCase,
  Camera, Gamepad2, Tv, Cpu, HardDrive, Watch, Home, Speaker, LogOut,

  Router, Usb, BatteryCharging, PanelLeft, PanelLeftClose,
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
}

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

      <div className={`border-t border-slate-100 dark:border-zinc-800 transition-all duration-300 overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 p-0' : 'max-h-40 opacity-100 px-4 py-3'}`}>
        {user ? (
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
              ) : (
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">Synced to cloud</p>
              )}
            </div>
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
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onSignIn}
            className="w-full h-8 text-xs gap-2"
          >
            <GoogleIcon />
            Sign in with Google
          </Button>
        )}
      </div>

      <div className={`p-4 border-t border-slate-100 dark:border-zinc-800 flex overflow-hidden ${isCollapsed ? 'flex-col gap-2' : 'gap-2'}`}>
            <button 
                type="button"
                onClick={handleImportClick}
                title={isCollapsed ? "Import" : undefined}
                className="flex flex-1 items-center justify-center px-3 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-900 hover:text-white dark:hover:bg-zinc-800 dark:hover:text-white rounded-lg transition-all duration-300"
            >
                <Upload size={14} className={`shrink-0 transition-all duration-300 ${isCollapsed ? '' : 'mr-2'}`} />
                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[60px] opacity-100'}`}>Import</span>
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
                title={isCollapsed ? "Export" : undefined}
                className="flex flex-1 items-center justify-center px-3 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-900 hover:text-white dark:hover:bg-zinc-800 dark:hover:text-white rounded-lg transition-all duration-300"
            >
                <Download size={14} className={`shrink-0 transition-all duration-300 ${isCollapsed ? '' : 'mr-2'}`} />
                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[60px] opacity-100'}`}>Export</span>
            </button>
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
        />
      </div>
    </>
  );
};