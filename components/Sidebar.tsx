import React, { useState, useRef, useEffect } from 'react';
import { Collection } from '../types';
import {
  Folder, Plus, LayoutGrid, Trash2, Upload, Pencil, Check, X,
  LogOut, PanelLeft, PanelLeftClose, RefreshCw, CloudUpload,
  Download, FileSpreadsheet, FileCode
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

import { GoogleIcon, getCollectionIcon, AuthUser } from './sidebar/sidebarUtils';
import { CollapsedProfileMenu } from './sidebar/CollapsedProfileMenu';
import { ActionButton } from './arc/action-button/action-button';

export { getCollectionIcon, type AuthUser };

interface SidebarProps {
  collections: Collection[];
  activeCollectionId: string;
  onSelectCollection: (id: string) => void;
  onAddCollection: (name: string) => void;
  onDeleteCollection: (id: string) => void;
  onRenameCollection: (id: string, newName: string) => void;
  onExportData: () => void;
  onExportCSV?: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => Promise<boolean | void> | void;
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
  onExportCSV?: () => void;
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

const SidebarContent: React.FC<SidebarContentProps> = ({ 
  collections, 
  activeCollectionId, 
  onSelectCollection, 
  onAddCollection,
  onDeleteCollection,
  onRenameCollection,
  onExportData,
  onExportCSV,
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

  const [importStatus, setImportStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const importResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (importResetTimer.current) clearTimeout(importResetTimer.current);
    };
  }, []);

  const handleImportClick = () => {
    if (importStatus === 'pending') return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (importResetTimer.current) clearTimeout(importResetTimer.current);
    setImportStatus('pending');

    try {
      const [success] = await Promise.all([
        Promise.resolve(onImportData(e)),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);

      if (success !== false) {
        setImportStatus('success');
        importResetTimer.current = setTimeout(() => {
          setImportStatus('idle');
        }, 2200);
      } else {
        setImportStatus('idle');
      }
    } catch (err) {
      console.error('Import failed:', err);
      setImportStatus('idle');
    }
  };

  return (
    <div className={`flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] overflow-hidden duration-300 relative ${isCollapsed ? 'w-[72px]' : 'w-64'}`}>
      <div className={`h-20 flex items-center border-b border-sidebar-border shrink-0 transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        
        {/* App Logo & Title */}
        <div className={`flex items-center text-slate-900 dark:text-white font-bold text-xl select-none transition-all duration-300 overflow-hidden ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shrink-0">
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

      <div className="flex-1 overflow-y-auto py-4 px-3 space-x-0 space-y-1" data-tour="collections-nav">
        <div className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-6 opacity-100 mb-2 px-3'}`}>
          Collections
        </div>
        
        {collections.map(collection => (
          <div 
            key={collection.id}
            className={`group flex items-center w-full rounded-lg transition-colors ${
              activeCollectionId === collection.id 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
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
                    title={collection.name}
                    className={`flex-1 flex items-center py-2.5 text-left min-w-0 border-none bg-transparent focus:outline-none cursor-pointer transition-all duration-300 ${isCollapsed ? 'pl-[15px] pr-0' : 'pl-3'} ${
                       activeCollectionId === collection.id ? 'text-sidebar-accent-foreground font-semibold' : 'text-sidebar-foreground/75 hover:text-sidebar-foreground'
                    }`}
                    onClick={() => {
                        onSelectCollection(collection.id);
                        if (closeMobile) closeMobile();
                    }}
                >
                  {React.createElement(getCollectionIcon(collection.name), { size: 18, className: `flex-shrink-0 transition-all duration-300 ${isCollapsed ? '' : 'mr-3'} ${activeCollectionId === collection.id ? 'text-sidebar-primary' : 'text-sidebar-foreground/50'}` })}
                  <span 
                    title={collection.name}
                    className={`truncate text-sm font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}
                  >
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
                        disabled={collections.length <= 1}
                        onClick={(e) => {
                          if (collections.length <= 1) return;
                          handleDeleteClick(e, collection.id, collection.name);
                        }}
                        className={`p-2 mr-1 rounded-md transition-colors ${
                          collections.length <= 1
                            ? 'text-slate-300 dark:text-zinc-700 cursor-not-allowed opacity-0 group-hover:opacity-40 focus:opacity-40'
                            : 'text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer'
                        }`}
                        title={collections.length <= 1 ? "You must have at least one collection" : "Delete collection"}
                        aria-disabled={collections.length <= 1}
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
            className={`flex items-center overflow-hidden w-full text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-all duration-300 mt-2 ${isCollapsed ? 'pl-[15px] pr-0 py-2.5' : 'px-3 py-2'}`}
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
        className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden shrink-0 border-t border-sidebar-border ${
          isCollapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[400px] opacity-100 pointer-events-auto'
        }`}
      >
        <div className="w-64">
          {/* Cloud Save */}
          <div className="px-4 pt-3 pb-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Cloud Save</div>
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
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full border border-slate-300 dark:border-zinc-600 border-t-slate-600 dark:border-t-zinc-300 animate-spin inline-block" />
                        Syncing…
                      </p>
                    ) : hasPendingSync ? (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Local import not synced</p>
                    ) : syncError ? (
                      <p className="text-[10px] text-red-500 font-medium truncate" title={syncError}>Sync failed</p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground">Synced to cloud</p>
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
          <div className="border-t border-sidebar-border px-4 pt-3 pb-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Local Save</div>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                label="Import"
                pendingLabel="Importing..."
                successLabel="Imported!"
                icon={<Upload size={14} className="shrink-0" />}
                iconPosition="leading"
                state={importStatus}
                onClick={handleImportClick}
                disabled={importStatus === 'pending'}
                className="w-full h-9 bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground border border-sidebar-border hover:text-sidebar-accent-foreground rounded-lg transition-colors cursor-pointer text-xs font-medium"
                title="Import backup JSON"
              />
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json" 
                onChange={handleImportFileChange} 
                className="hidden" 
                style={{ display: 'none' }}
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-9 bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground border border-sidebar-border hover:text-sidebar-accent-foreground rounded-lg transition-colors cursor-pointer text-xs font-medium flex items-center justify-center gap-1.5 outline-none"
                    title="Export options"
                  >
                    <Download size={14} className="shrink-0" />
                    <span>Export</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  side="top" 
                  align="end" 
                  sideOffset={8}
                  className="w-44 bg-popover text-popover-foreground border border-border rounded-[var(--radius)] shadow-lg p-1 z-50"
                >
                  <DropdownMenuItem 
                    onClick={onExportCSV} 
                    className="gap-2 py-2 px-2.5 cursor-pointer text-xs font-medium focus:bg-accent focus:text-accent-foreground"
                  >
                    <FileSpreadsheet size={15} className="text-emerald-500 shrink-0" />
                    <span>Export as CSV</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onExportData} 
                    className="gap-2 py-2 px-2.5 cursor-pointer text-xs font-medium focus:bg-accent focus:text-accent-foreground"
                  >
                    <FileCode size={15} className="text-blue-500 shrink-0" />
                    <span>Export as JSON</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed Footer: Profile Icon button with synchronized smooth transition */}
      <div 
        className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden shrink-0 border-t border-sidebar-border ${
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
          onExportCSV={onExportCSV}
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
  onExportCSV,
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
      
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent 
            collections={collections}
            activeCollectionId={activeCollectionId}
            onSelectCollection={onSelectCollection}
            onAddCollection={onAddCollection}
            onDeleteCollection={onDeleteCollection}
            onRenameCollection={onRenameCollection}
            onExportData={onExportData}
            onExportCSV={onExportCSV}
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
            onExportCSV={onExportCSV}
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