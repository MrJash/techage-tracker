import React from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string; disabled?: boolean }[];
  iconOnly?: boolean;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange, options, iconOnly }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {iconOnly ? (
          <Button variant="outline" size="icon" className="h-10 w-10 border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white">
            <ArrowUpDown size={20} className="shrink-0" />
          </Button>
        ) : (
          <Button variant="outline" className="flex h-10 w-[176px] items-center justify-between rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-normal ring-offset-white dark:ring-offset-black transition-all duration-200 hover:bg-slate-50 dark:hover:bg-zinc-800">
            <div className="flex items-center min-w-0 flex-1">
              <ArrowUpDown size={16} className="mr-2 text-slate-900 dark:text-white shrink-0" />
              <span className="block truncate text-slate-900 dark:text-white">
                {selectedOption ? selectedOption.label : 'Sort Order'}
              </span>
            </div>
            <ChevronDown size={16} className={`ml-2 text-slate-500 dark:text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[176px] bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal text-slate-500 dark:text-zinc-400 px-2 py-1.5 pt-2">
            Sort By
          </DropdownMenuLabel>
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={value === option.value}
              onCheckedChange={() => onChange(option.value)}
              disabled={option.disabled}
              className="cursor-pointer"
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
