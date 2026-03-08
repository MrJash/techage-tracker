import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  onAdd: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAdd }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="bg-slate-100 dark:bg-zinc-900 p-4 rounded-full mb-4">
        <PackageOpen size={48} className="text-slate-400 dark:text-zinc-600" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        No products yet
      </h3>
      <p className="text-slate-500 dark:text-zinc-400 max-w-sm mb-8">
        This collection is empty. Add your electronic devices to start tracking their age.
      </p>
      <Button onClick={onAdd} size="lg">
        Add Your First Product
      </Button>
    </div>
  );
};