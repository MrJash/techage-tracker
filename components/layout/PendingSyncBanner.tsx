import React from 'react';
import { AlertTriangle, CloudUpload } from 'lucide-react';
import { Button } from '../ui/button';

interface PendingSyncBannerProps {
  onSync: () => void;
  isSyncing: boolean;
}

export const PendingSyncBanner: React.FC<PendingSyncBannerProps> = ({ onSync, isSyncing }) => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs text-amber-700 dark:text-amber-400 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
        <span className="truncate">Imported data is kept local. Cloud save has not been updated yet.</span>
      </div>
      <Button
        size="sm"
        onClick={onSync}
        disabled={isSyncing}
        className="h-6 text-[11px] bg-amber-600 hover:bg-amber-700 text-white gap-1 px-2.5 py-0 shrink-0"
      >
        <CloudUpload size={12} />
        {isSyncing ? 'Syncing...' : 'Sync to Firebase'}
      </Button>
    </div>
  );
};
