import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sliders, 
  Settings, 
  Info, 
  Check, 
  ChevronDown, 
  FileSpreadsheet, 
  FileJson,
  ShieldCheck,
  Shield,
  Globe,
  LayoutGrid,
  LogOut,
  Clock,
  Folder,
  Moon,
  Sun,
  Laptop,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Heart,
  GitCommit
} from 'lucide-react';
import { 
  CurrencyCode, 
  SUPPORTED_CURRENCIES, 
  setDefaultCurrency, 
  getCurrencyConfig 
} from '../utils/currency';
import { AgeFormat } from '../utils/dateHelpers';
import { Collection } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
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

export type ThemeMode = 'system' | 'dark' | 'light';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Currency
  currency: CurrencyCode;
  onCurrencyChange: (newCurrency: CurrencyCode) => void;
  // Age Format
  ageFormat: AgeFormat;
  onAgeFormatChange: (format: AgeFormat) => void;
  // Default Warranty
  defaultWarranty: number;
  onDefaultWarrantyChange: (years: number) => void;
  // Default Opening Collection
  collections?: Collection[];
  defaultOpeningCollection?: string;
  onDefaultOpeningCollectionChange?: (colId: string) => void;
  // Theme Mode
  themeMode?: ThemeMode;
  onThemeModeChange?: (mode: ThemeMode) => void;
  // Storage Footprint
  totalReceiptsCount?: number;
  totalReceiptsBytes?: number;
  // Cloud & Auth
  user?: {
    displayName: string | null;
    email?: string | null;
    photoURL: string | null;
  } | null;
  isSyncing?: boolean;
  onCloudResync?: () => void;
  // Inventory Counts & Exports
  totalProductsCount?: number;
  totalCollectionsCount?: number;
  onExportCSV?: () => void;
  onExportJSON?: () => void;
  onSignOut?: () => void;
  onSignIn?: () => void;
  // Danger Zone
  onResetAllData?: () => void;
}

type TabType = 'preferences' | 'general' | 'about';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currency,
  onCurrencyChange,
  ageFormat,
  onAgeFormatChange,
  defaultWarranty,
  onDefaultWarrantyChange,
  collections = [],
  defaultOpeningCollection = 'last-active',
  onDefaultOpeningCollectionChange,
  themeMode = 'system',
  onThemeModeChange,
  totalReceiptsCount = 0,
  totalReceiptsBytes = 0,
  user,
  isSyncing = false,
  onCloudResync,
  totalProductsCount = 0,
  totalCollectionsCount = 0,
  onExportCSV,
  onExportJSON,
  onSignOut,
  onSignIn,
  onResetAllData,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('preferences');
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isCollectionDropdownOpen, setIsCollectionDropdownOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isResetConfirmOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isResetConfirmOpen]);

  if (!isOpen) return null;

  const currentCurrencyConfig = getCurrencyConfig(currency);

  const handleSelectCurrency = (code: CurrencyCode) => {
    setDefaultCurrency(code);
    onCurrencyChange(code);
    setIsCurrencyDropdownOpen(false);
  };

  // Format storage bytes into friendly KB or MB
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const ESTIMATED_LOCAL_QUOTA_BYTES = 5 * 1024 * 1024; // 5 MB standard localStorage budget
  const quotaPercent = Math.min(100, Math.round((totalReceiptsBytes / ESTIMATED_LOCAL_QUOTA_BYTES) * 100));

  // Resolved name of opening collection
  const activeOpeningColName = defaultOpeningCollection === 'last-active'
    ? 'Last Active Collection (Auto)'
    : collections.find(c => c.id === defaultOpeningCollection)?.name || 'Last Active Collection (Auto)';

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="relative bg-white dark:bg-zinc-950 w-full h-full sm:h-[760px] sm:max-h-[92vh] sm:max-w-4xl sm:rounded-2xl border-0 sm:border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Top Header with Title and Close Button */}
          <div className="shrink-0 px-5 sm:px-6 pt-5 pb-0 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {activeTab === 'preferences' && 'Configure workspace defaults, date formats, and product preferences.'}
                  {activeTab === 'general' && 'Manage appearance, storage footprint, and system portability.'}
                  {activeTab === 'about' && 'App information, build versions, and cloud architecture.'}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 -mr-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Horizontal Tabs: Preferences (active tab), General, About */}
            <nav className="flex items-center gap-1 sm:gap-2 -mb-px overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('preferences')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'preferences'
                    ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Sliders size={14} className="shrink-0" />
                <span>Preferences</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'general'
                    ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Settings size={14} className="shrink-0" />
                <span>General</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'about'
                    ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Info size={14} className="shrink-0" />
                <span>About</span>
              </button>
            </nav>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* ========================================================================= */}
            {/* Tab: Preferences                                                          */}
            {/* ========================================================================= */}
            {activeTab === 'preferences' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* 1. Default Currency Setting */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Globe size={16} className="text-slate-500 dark:text-zinc-400" />
                        Default Currency
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        Pre-selected currency when creating new products. Individual items can still use any supported currency.
                      </p>
                    </div>

                    <DropdownMenu open={isCurrencyDropdownOpen} onOpenChange={setIsCurrencyDropdownOpen}>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center justify-between gap-2 min-w-[130px] h-9 px-3 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-900 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                        >
                          <span>{currentCurrencyConfig.label} ({currentCurrencyConfig.code})</span>
                          <ChevronDown size={14} className="text-slate-400 shrink-0" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-xl p-1 z-50">
                        {SUPPORTED_CURRENCIES.map((curr) => {
                          const isSelected = curr.code === currency;
                          return (
                            <DropdownMenuItem
                              key={curr.code}
                              onClick={() => handleSelectCurrency(curr.code)}
                              className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer rounded-md transition-colors ${
                                isSelected 
                                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium' 
                                  : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-500 dark:text-zinc-400 w-6 text-center">{curr.symbol}</span>
                                <span>{curr.code} - {curr.name}</span>
                              </div>
                              {isSelected && <Check size={14} className="text-slate-900 dark:text-white shrink-0 ml-2" />}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* 2. Age Display Format */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock size={16} className="text-slate-500 dark:text-zinc-400" />
                      Age Display Format
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      Choose how hardware lifespans are formatted across product cards.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onAgeFormatChange('detailed')}
                      className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        ageFormat === 'detailed'
                          ? 'border-slate-900 dark:border-white bg-white dark:bg-zinc-900 shadow-sm'
                          : 'border-slate-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">Detailed</span>
                        {ageFormat === 'detailed' && <Check size={14} className="text-slate-900 dark:text-white" />}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-mono">
                        3 Years 5 Months Old
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onAgeFormatChange('compact')}
                      className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        ageFormat === 'compact'
                          ? 'border-slate-900 dark:border-white bg-white dark:bg-zinc-900 shadow-sm'
                          : 'border-slate-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">Compact</span>
                        {ageFormat === 'compact' && <Check size={14} className="text-slate-900 dark:text-white" />}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-mono">
                        3.4 yrs
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onAgeFormatChange('short')}
                      className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        ageFormat === 'short'
                          ? 'border-slate-900 dark:border-white bg-white dark:bg-zinc-900 shadow-sm'
                          : 'border-slate-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">Short</span>
                        {ageFormat === 'short' && <Check size={14} className="text-slate-900 dark:text-white" />}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-mono">
                        3y 4m
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onAgeFormatChange('total-months')}
                      className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        ageFormat === 'total-months'
                          ? 'border-slate-900 dark:border-white bg-white dark:bg-zinc-900 shadow-sm'
                          : 'border-slate-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">Total Months</span>
                        {ageFormat === 'total-months' && <Check size={14} className="text-slate-900 dark:text-white" />}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-mono">
                        41 mos
                      </span>
                    </button>
                  </div>
                </div>

                {/* 3. Default Warranty Duration */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Shield size={16} className="text-slate-500 dark:text-zinc-400" />
                      Default Warranty Duration
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      Pre-filled warranty length whenever you create a new product.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { label: 'None', value: 0 },
                      { label: '1 Year', value: 1 },
                      { label: '2 Years', value: 2 },
                      { label: '3 Years', value: 3 },
                      { label: '5 Years', value: 5 },
                    ].map((opt) => {
                      const isSelected = defaultWarranty === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onDefaultWarrantyChange(opt.value)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm'
                              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Default Opening Collection */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Folder size={16} className="text-slate-500 dark:text-zinc-400" />
                        Default Opening Collection
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        Specify whether the app restores your last active collection or starts on a fixed collection.
                      </p>
                    </div>

                    <DropdownMenu open={isCollectionDropdownOpen} onOpenChange={setIsCollectionDropdownOpen}>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center justify-between gap-2 min-w-[160px] h-9 px-3 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-900 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                        >
                          <span className="truncate max-w-[170px]">{activeOpeningColName}</span>
                          <ChevronDown size={14} className="text-slate-400 shrink-0" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-xl p-1 z-50">
                        <DropdownMenuItem
                          onClick={() => {
                            onDefaultOpeningCollectionChange?.('last-active');
                            setIsCollectionDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer rounded-md transition-colors ${
                            defaultOpeningCollection === 'last-active'
                              ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium'
                              : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span>Last Active Collection (Auto)</span>
                          {defaultOpeningCollection === 'last-active' && <Check size={14} className="text-slate-900 dark:text-white shrink-0 ml-2" />}
                        </DropdownMenuItem>

                        {collections.map(col => {
                          const isSelected = defaultOpeningCollection === col.id;
                          return (
                            <DropdownMenuItem
                              key={col.id}
                              onClick={() => {
                                onDefaultOpeningCollectionChange?.(col.id);
                                setIsCollectionDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer rounded-md transition-colors ${
                                isSelected
                                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium'
                                  : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <span className="truncate">{col.name}</span>
                              {isSelected && <Check size={14} className="text-slate-900 dark:text-white shrink-0 ml-2" />}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* 5. Cloud & Receipt Storage Limit Note */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    Receipt Upload Limit
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Receipts are capped at <strong className="text-slate-700 dark:text-zinc-300">750 KB</strong> per item and stored in dedicated cloud subcollections to guarantee rapid sync times and stay well within Firestore free-tier limits.
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* Tab: General                                                              */}
            {/* ========================================================================= */}
            {activeTab === 'general' && (
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
                        onClick={() => setIsResetConfirmOpen(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold transition-colors shadow-xs shrink-0 cursor-pointer"
                      >
                        <Trash2 size={13} className="shrink-0" />
                        <span>Reset All Data</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* Tab: About                                                                */}
            {/* ========================================================================= */}
            {activeTab === 'about' && (
              <div className="space-y-5 animate-in fade-in duration-200 py-1">
                {/* Hero Branding Section (No card) */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-4">
                    {/* Glossy App Icon */}
                    <div className="relative group shrink-0">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-black dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-400 text-white dark:text-black flex items-center justify-center shadow-lg shadow-slate-900/10 dark:shadow-white/5 border border-slate-700/30 dark:border-white/30 transition-transform duration-300 group-hover:scale-105">
                        <LayoutGrid size={32} className="text-white dark:text-black" />
                      </div>
                      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-500 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300 -z-10" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                          TechAge Tracker
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 font-mono">
                          v1.4.0
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400 mt-0.5">
                        Hardware Lifespan, Warranty & Valuation Intelligence
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        <span>Crafted with</span>
                        <Heart size={12} className="text-red-500 fill-red-500 inline shrink-0" />
                        <span>by <strong className="text-slate-800 dark:text-zinc-200 font-semibold">Jash Mewada</strong></span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                    An intuitive personal hardware inventory system designed to monitor device aging, track real-time warranty expirations, manage multi-currency valuations, and preserve PDF receipts with real-time Google Cloud synchronization.
                  </p>

                  {/* Feature highlight pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-800/80">
                      <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                      Cloud Firestore Sync
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-800/80">
                      <Globe size={14} className="text-blue-500 shrink-0" />
                      9 Currencies
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-800/80">
                      <FileSpreadsheet size={14} className="text-purple-500 shrink-0" />
                      CSV & JSON Export
                    </span>
                  </div>
                </div>

                {/* Technical Specifications & Creator Card */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 text-xs text-slate-500 dark:text-zinc-400 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-800/60">
                    <span className="font-medium">Version</span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">1.4.0</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-800/60">
                    <span className="font-medium">Author & Creator</span>
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Jash Mewada</span>
                      <Heart size={12} className="text-red-500 fill-red-500 shrink-0" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Cloud Database</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Cloud Firestore (rules_version 2)</span>
                  </div>
                </div>

                {/* Changelog Card */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <GitCommit size={16} className="text-slate-500 dark:text-zinc-400" />
                      Release Changelog
                    </h4>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      Post-v1.0 Releases
                    </span>
                  </div>

                  <div className="text-xs">
                    {/* v1.4.0 */}
                    <div className="pb-4 border-b border-slate-200/80 dark:border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">v1.4.0</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                            Latest
                          </span>
                        </div>
                      </div>
                      <ul className="space-y-1.5 text-slate-600 dark:text-zinc-300 pl-4 list-disc marker:text-emerald-500">
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Structured</strong> General settings into 2 big cards with nested sections for storage, data portability, and cloud management.</li>
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Enlarged</strong> Settings modal popup dimensions (<code className="font-mono text-[11px] bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded">max-w-4xl</code>) for improved visibility on desktop screens.</li>
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Added</strong> new 'Short' age display format (<code className="font-mono text-[11px] bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded">3y 4m</code>).</li>
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Implemented</strong> real-time synchronization between the header theme toggle and General settings state.</li>
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Fixed</strong> collection launch persistence on browser refresh to strictly honor user preferences.</li>
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Refined</strong> CSV/JSON export buttons with symmetric hover effects and pixel-perfect badge alignment.</li>
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Added</strong> author attribution and in-app release changelog.</li>
                      </ul>
                    </div>

                    {/* v1.3.0 */}
                    <div className="py-4 border-b border-slate-200/80 dark:border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">v1.3.0</span>
                        </div>
                      </div>
                      <ul className="space-y-1.5 text-slate-600 dark:text-zinc-300 pl-4 list-disc marker:text-slate-400">
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Added</strong> curated 8-color palette for product tags with responsive colored filter dots.</li>
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Implemented</strong> Theme Mode selector supporting System (Auto), Dark, and Light mode presets.</li>
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Added</strong> Storage & Receipt Footprint meter with 5 MB localStorage quota tracker.</li>
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Implemented</strong> Cloud Resync troubleshooting utility and guarded Danger Zone workspace reset.</li>
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Added</strong> Default Warranty Duration and Default Opening Collection preferences.</li>
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Updated</strong> Firestore security rules v2 to authorize preference synchronization.</li>
                      </ul>
                    </div>

                    {/* v1.2.0 */}
                    <div className="pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">v1.2.0</span>
                        </div>
                      </div>
                      <ul className="space-y-1.5 text-slate-600 dark:text-zinc-300 pl-4 list-disc marker:text-slate-400">
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Implemented</strong> dedicated multi-tab Settings Modal (Preferences, General, About).</li>
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Added</strong> multi-currency engine supporting 9 global currencies with real-time formatting.</li>
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Implemented</strong> inline morphing export action bar for quick CSV and JSON downloads.</li>
                        <li><strong className="text-slate-800 dark:text-zinc-200 font-medium">Architected</strong> dedicated cloud receipts subcollection with 750 KB item ceiling.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-slate-200 dark:border-zinc-800 shrink-0 flex items-center justify-between px-5 sm:px-6 py-3.5 bg-slate-50/60 dark:bg-zinc-900/40">
            <div>
              {user ? (
                <div className="flex items-center gap-2.5">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover shrink-0" 
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-zinc-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-zinc-200 shrink-0">
                      {user.displayName?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-tight">
                      {user.displayName || 'Signed In'}
                    </p>
                    {user.email && (
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate leading-tight">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                  TechAge Tracker v1.4.0
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Resetting Data (Danger Zone) */}
      <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle size={18} />
              Reset All Workspace Data?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">
              This will permanently delete all your local collections, products, receipt attachments, and custom tags from this browser. If cloud synchronization is active, you can re-fetch your data via Cloud Resync. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsResetConfirmOpen(false);
                onResetAllData?.();
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            >
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
