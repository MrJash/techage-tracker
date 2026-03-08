import React from 'react';
import { Filter, ChevronDown, CheckSquare, Square, type LucideIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[] | SelectGroup[];
  placeholder?: string;
  className?: string;
  icon?: LucideIcon;
  iconOnly?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select...", 
  className = '',
  icon: Icon,
  iconOnly = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isGrouped = options.length > 0 && 'options' in options[0];
  const allOptions = isGrouped 
    ? (options as SelectGroup[]).flatMap(g => g.options)
    : (options as SelectOption[]);

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const isAllSelected = allOptions.length > 0 && value.length === allOptions.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(allOptions.map(o => o.value));
    }
  };

  const displayValue = value.length === 0 
    ? placeholder 
    : value.length === allOptions.length
      ? "All Selected"
      : value.length === 1 
        ? allOptions.find(o => o.value === value[0])?.label 
        : `${value.length} selected`;

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {iconOnly ? (
          <Button variant="outline" size="icon" className="h-10 w-10 border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white">
            {Icon ? <Icon size={20} className="shrink-0" /> : <Filter size={20} className="shrink-0" />}
          </Button>
        ) : (
          <Button variant="outline" className="flex h-10 w-[200px] items-center justify-between rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-normal ring-offset-white dark:ring-offset-black transition-all duration-200 hover:bg-slate-50 dark:hover:bg-zinc-800">
            <div className="flex items-center min-w-0 flex-1">
              {Icon && <Icon size={16} className={`mr-2 shrink-0 ${value.length === 0 ? "text-slate-500 dark:text-zinc-500" : "text-slate-900 dark:text-white"}`} />}
              <span className={`block truncate ${value.length === 0 ? "text-slate-500 dark:text-zinc-500" : "text-slate-900 dark:text-white"}`}>
                {displayValue}
              </span>
            </div>
            <ChevronDown size={16} className={`ml-2 text-slate-500 dark:text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 max-h-80 overflow-y-auto ${iconOnly ? 'w-64' : 'w-[200px]'}`}>
        <DropdownMenuItem
          onSelect={(e) => { e.preventDefault(); toggleSelectAll(); }}
          className="cursor-pointer font-medium mb-1 flex items-center gap-2"
        >
          {isAllSelected ? <CheckSquare size={16} className="text-slate-900 dark:text-white" /> : <Square size={16} className="text-slate-400 dark:text-zinc-500" />}
          Select All
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-800" />
        
        {isGrouped ? (
          (options as SelectGroup[]).map((group, idx) => (
            <DropdownMenuGroup key={group.label}>
              <DropdownMenuLabel className="font-bold text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider px-2 py-1.5 pt-2">
                {group.label}
              </DropdownMenuLabel>
              {group.options.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={(e) => { e.preventDefault(); toggleOption(option.value); }}
                  className="cursor-pointer flex items-center gap-2"
                >
                  {value.includes(option.value) ? <CheckSquare size={16} className="text-slate-900 dark:text-white shrink-0" /> : <Square size={16} className="text-slate-400 dark:text-zinc-500 shrink-0" />}
                  {option.label}
                </DropdownMenuItem>
              ))}
              {idx < options.length - 1 && <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-800 my-1" />}
            </DropdownMenuGroup>
          ))
        ) : (
          <DropdownMenuGroup>
            {(options as SelectOption[]).map(option => (
              <DropdownMenuItem
                key={option.value}
                onSelect={(e) => { e.preventDefault(); toggleOption(option.value); }}
                className="cursor-pointer flex items-center gap-2"
              >
                {value.includes(option.value) ? <CheckSquare size={16} className="text-slate-900 dark:text-white shrink-0" /> : <Square size={16} className="text-slate-400 dark:text-zinc-500 shrink-0" />}
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};