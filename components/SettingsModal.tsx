import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Sliders, 
  Settings, 
  Info, 
  AlertTriangle 
} from 'lucide-react';
import { CurrencyCode } from '../utils/currency';
import { AgeFormat } from '../utils/dateHelpers';
import { Collection } from '../types';
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

import { PreferencesTab } from './settings/PreferencesTab';
import { GeneralTab, ThemeMode, ThemePreset } from './settings/GeneralTab';
import { AboutTab } from './settings/AboutTab';

export type { ThemeMode, ThemePreset };

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
  // Theme Mode & Preset
  themeMode?: ThemeMode;
  onThemeModeChange?: (mode: ThemeMode) => void;
  themePreset?: ThemePreset;
  onThemePresetChange?: (preset: ThemePreset) => void;
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
  // Guided Tour
  onStartTour?: () => void;
}

type TabType = 'preferences' | 'general' | 'about';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

const SETTINGS_TABS: TabItem[] = [
  { id: 'preferences', label: 'Preferences', icon: Sliders },
  { id: 'general', label: 'General', icon: Settings },
  { id: 'about', label: 'About', icon: Info },
];

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
  themePreset = 'default',
  onThemePresetChange,
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
  onStartTour,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('preferences');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navRef = useRef<HTMLElement | null>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updateUnderline = () => {
      const activeIndex = SETTINGS_TABS.findIndex(tab => tab.id === activeTab);
      const activeTabElement = tabRefs.current[activeIndex];

      if (activeTabElement) {
        setUnderlineStyle({
          left: activeTabElement.offsetLeft,
          width: activeTabElement.offsetWidth,
        });
      }
    };

    updateUnderline();
    const rafId = requestAnimationFrame(updateUnderline);

    // Re-measure after web fonts finish loading (e.g. Antic in Sage theme)
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(updateUnderline).catch(() => {});
    }

    // ResizeObserver dynamically measures tab size changes (theme font swap, reflows)
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateUnderline();
      });

      if (navRef.current) {
        resizeObserver.observe(navRef.current);
      }
      tabRefs.current.forEach(el => {
        if (el) resizeObserver?.observe(el);
      });
    }

    window.addEventListener('resize', updateUnderline);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateUnderline);
      resizeObserver?.disconnect();
    };
  }, [activeTab, isOpen, themePreset, themeMode]);

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

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          data-tour="settings-modal"
          className="relative bg-white dark:bg-zinc-950 w-full h-full sm:h-[760px] sm:max-h-[92vh] sm:max-w-4xl sm:rounded-2xl border-0 sm:border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Top Header with Title, Tabs, and Close Button */}
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
                className="p-2 -mr-1.5 rounded-[var(--radius)] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Horizontal Tabs: Preferences, General, About with Animated Motion Underline */}
            <nav ref={navRef} className="relative flex items-center gap-1 sm:gap-2 -mb-px overflow-x-auto no-scrollbar">
              {SETTINGS_TABS.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    ref={el => {
                      tabRefs.current[index] = el;
                    }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative z-10 flex items-center gap-2 px-3.5 py-2.5 text-xs transition-colors cursor-pointer shrink-0 rounded-t-lg ${
                      isActive
                        ? 'text-primary font-bold'
                        : 'font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={14} className="shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              {/* Theme-aware smooth animated underline indicator */}
              <motion.div
                className="bg-primary absolute bottom-0 h-0.5 rounded-full z-20 pointer-events-none"
                animate={{
                  left: underlineStyle.left,
                  width: underlineStyle.width,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 35,
                }}
              />
            </nav>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5">
            {activeTab === 'preferences' && (
              <PreferencesTab
                currency={currency}
                onCurrencyChange={onCurrencyChange}
                ageFormat={ageFormat}
                onAgeFormatChange={onAgeFormatChange}
                defaultWarranty={defaultWarranty}
                onDefaultWarrantyChange={onDefaultWarrantyChange}
                collections={collections}
                defaultOpeningCollection={defaultOpeningCollection}
                onDefaultOpeningCollectionChange={onDefaultOpeningCollectionChange}
              />
            )}

            {activeTab === 'general' && (
              <GeneralTab
                themeMode={themeMode}
                onThemeModeChange={onThemeModeChange}
                themePreset={themePreset}
                onThemePresetChange={onThemePresetChange}
                totalCollectionsCount={totalCollectionsCount}
                totalProductsCount={totalProductsCount}
                totalReceiptsCount={totalReceiptsCount}
                totalReceiptsBytes={totalReceiptsBytes}
                onExportCSV={onExportCSV}
                onExportJSON={onExportJSON}
                user={user}
                isSyncing={isSyncing}
                onCloudResync={onCloudResync}
                onSignOut={onSignOut}
                onSignIn={onSignIn}
                onRequestResetData={() => setIsResetConfirmOpen(true)}
              />
            )}

            {activeTab === 'about' && (
              <AboutTab 
                onStartTour={onStartTour ? () => {
                  onClose();
                  onStartTour();
                } : undefined} 
              />
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
                  TechAge Tracker v1.5.3
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-[var(--radius)] bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
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
