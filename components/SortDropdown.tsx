import React from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

export type SortOption = 'custom' | 'newest' | 'oldest' | 'price-high' | 'price-low';

export interface SortDropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SortDropdownOption[];
  iconOnly?: boolean;
  className?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange, options, iconOnly, className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {iconOnly ? (
          <Button 
            variant="outline" 
            size="icon" 
            className={cn("h-10 w-10 border-border bg-card hover:bg-accent hover:text-accent-foreground text-foreground rounded-[var(--radius)] shrink-0", className)}
          >
            <ArrowUpDown size={16} className="shrink-0" />
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className={cn("flex h-10 w-[225px] items-center justify-between rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-sm font-normal ring-offset-background transition-all duration-200 hover:bg-accent hover:text-accent-foreground text-foreground shrink-0", className)}
          >
            <div className="flex items-center min-w-0 flex-1">
              <ArrowUpDown size={14} className="mr-1.5 text-foreground shrink-0" />
              <span className="block truncate text-foreground text-left">
                {selectedOption ? selectedOption.label : 'Sort Order'}
              </span>
            </div>
            <ChevronDown size={14} className={`ml-1 text-muted-foreground transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px] bg-popover text-popover-foreground border-border">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal text-muted-foreground px-2 py-1.5 pt-2">
            SORT BY
          </DropdownMenuLabel>
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={value === option.value}
              onCheckedChange={() => onChange(option.value)}
              disabled={option.disabled}
              className="cursor-pointer whitespace-nowrap"
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
