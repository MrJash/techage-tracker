import React from 'react';
import { ChevronDown, Check, type LucideIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  icon?: LucideIcon;
  iconOnly?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Select: React.FC<SelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select", 
  className = '',
  icon: Icon,
  iconOnly = false,
  open,
  onOpenChange: externalOnOpenChange
}) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const isControlled = open !== undefined && externalOnOpenChange !== undefined;
  const isOpen = isControlled ? open : internalIsOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled && externalOnOpenChange) {
      externalOnOpenChange(newOpen);
    } else {
      setInternalIsOpen(newOpen);
    }
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        {iconOnly ? (
          <Button variant="outline" size="icon" className={`h-10 w-10 border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white ${className}`}>
            {Icon && <Icon size={20} className="shrink-0" />}
          </Button>
        ) : (
          <Button variant="outline" className={`flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-normal ring-offset-white dark:ring-offset-black transition-all duration-200 hover:bg-slate-50 dark:hover:bg-zinc-800 ${className}`}>
            <div className="flex items-center min-w-0 flex-1">
              {Icon && <Icon size={16} className={`mr-2 shrink-0 ${!selectedOption ? "text-slate-500 dark:text-zinc-500" : "text-slate-900 dark:text-white"}`} />}
              <span className={`block truncate ${!selectedOption ? "text-slate-500 dark:text-zinc-500" : "text-slate-900 dark:text-white"}`}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            <ChevronDown size={16} className={`ml-2 text-slate-500 dark:text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }} className={`bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 max-h-[210px] overflow-y-auto ${iconOnly ? 'w-48' : ''}`}>
        <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
          {placeholder}
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className="cursor-pointer text-sm font-medium flex items-center justify-between group py-2 px-3"
            >
              <span className={`truncate ${option.value === value ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-400'}`}>
                {option.label}
              </span>
              {option.value === value && (
                <Check size={14} className="text-slate-900 dark:text-white shrink-0 ml-2" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};