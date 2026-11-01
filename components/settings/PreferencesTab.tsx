import React, { useState } from 'react';
import { 
  Globe, 
  ChevronDown, 
  Check, 
  Clock, 
  Shield, 
  Folder, 
  ShieldCheck 
} from 'lucide-react';
import { 
  CurrencyCode, 
  SUPPORTED_CURRENCIES, 
  setDefaultCurrency, 
  getCurrencyConfig 
} from '../../utils/currency';
import { AgeFormat } from '../../utils/dateHelpers';
import { Collection } from '../../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface PreferencesTabProps {
  currency: CurrencyCode;
  onCurrencyChange: (newCurrency: CurrencyCode) => void;
  ageFormat: AgeFormat;
  onAgeFormatChange: (format: AgeFormat) => void;
  defaultWarranty: number;
  onDefaultWarrantyChange: (years: number) => void;
  collections?: Collection[];
  defaultOpeningCollection?: string;
  onDefaultOpeningCollectionChange?: (colId: string) => void;
}

export const PreferencesTab: React.FC<PreferencesTabProps> = ({
  currency,
  onCurrencyChange,
  ageFormat,
  onAgeFormatChange,
  defaultWarranty,
  onDefaultWarrantyChange,
  collections = [],
  defaultOpeningCollection = 'last-active',
  onDefaultOpeningCollectionChange,
}) => {
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isCollectionDropdownOpen, setIsCollectionDropdownOpen] = useState(false);

  const currentCurrencyConfig = getCurrencyConfig(currency);

  const handleSelectCurrency = (code: CurrencyCode) => {
    setDefaultCurrency(code);
    onCurrencyChange(code);
    setIsCurrencyDropdownOpen(false);
  };

  const activeOpeningColName = defaultOpeningCollection === 'last-active'
    ? 'Last Active Collection (Auto)'
    : collections.find(c => c.id === defaultOpeningCollection)?.name || 'Last Active Collection (Auto)';

  return (
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
  );
};
