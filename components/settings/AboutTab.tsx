import React from 'react';
import { 
  LayoutGrid, 
  ShieldCheck, 
  Globe, 
  FileSpreadsheet, 
  Heart, 
  GitCommit 
} from 'lucide-react';

export const AboutTab: React.FC = () => {
  return (
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
  );
};
