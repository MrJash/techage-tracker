import React from 'react';
import { Filter, ChevronDown, CheckSquare, Square, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

export interface SelectOption {
  value: string;
  label: string;
  dotColor?: string;
}

export interface SelectGroup {
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
          <Button 
            variant="outline" 
            size="icon" 
            className={cn("h-10 w-10 border-border bg-card hover:bg-accent hover:text-accent-foreground text-foreground rounded-[var(--radius)] shrink-0", className)}
          >
            {Icon ? <Icon size={16} className="shrink-0" /> : <Filter size={16} className="shrink-0" />}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className={cn("flex h-10 w-[200px] items-center justify-between rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-sm font-normal ring-offset-background transition-all duration-200 hover:bg-accent hover:text-accent-foreground text-foreground", className)}
          >
            <div className="flex items-center min-w-0 flex-1">
              {Icon && <Icon size={16} className={`mr-2 shrink-0 ${value.length === 0 ? "text-muted-foreground" : "text-foreground"}`} />}
              <span className={`block truncate ${value.length === 0 ? "text-muted-foreground" : "text-foreground"}`}>
                {displayValue}
              </span>
            </div>
            <ChevronDown size={16} className={`ml-2 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          "w-[200px] overflow-x-hidden bg-popover text-popover-foreground border-border p-1 shadow-xl rounded-[var(--radius)]",
          iconOnly && "w-64"
        )}
      >
        <div className="max-h-80 overflow-y-auto overflow-x-hidden pr-0.5 space-y-0.5">
          <DropdownMenuCheckboxItem
            checked={isAllSelected}
            onSelect={(e) => {
              e.preventDefault();
              toggleSelectAll();
            }}
            className="cursor-pointer font-medium text-xs mb-1 min-w-0"
          >
            <span className="truncate flex-1 min-w-0">Select All</span>
          </DropdownMenuCheckboxItem>

          {value.length > 0 && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => {
                e.preventDefault();
                onChange([]);
              }}
              className="cursor-pointer text-xs min-w-0 flex items-center justify-between mb-1"
            >
              <span className="truncate flex-1 min-w-0">Clear all filters</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive shrink-0 ml-1 leading-none">
                {value.length}
              </span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-border my-1" />
          
          {isGrouped ? (
            (options as SelectGroup[]).map((group, idx) => (
              <DropdownMenuGroup key={group.label}>
                <DropdownMenuLabel className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1 pt-1.5">
                  {group.label}
                </DropdownMenuLabel>
                {group.options.map(option => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={value.includes(option.value)}
                    onSelect={(e) => {
                      e.preventDefault();
                      toggleOption(option.value);
                    }}
                    className="cursor-pointer text-xs flex items-center justify-between min-w-0"
                  >
                    <span className="truncate flex-1 min-w-0">{option.label}</span>
                    {option.dotColor && (
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs ring-1 ring-border ml-2" 
                        style={{ backgroundColor: option.dotColor }}
                      />
                    )}
                  </DropdownMenuCheckboxItem>
                ))}
                {idx < (options as SelectGroup[]).length - 1 && <DropdownMenuSeparator className="bg-border my-1" />}
              </DropdownMenuGroup>
            ))
          ) : (
            <DropdownMenuGroup>
              {(options as SelectOption[]).map(option => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={value.includes(option.value)}
                  onSelect={(e) => {
                    e.preventDefault();
                    toggleOption(option.value);
                  }}
                  className="cursor-pointer text-xs flex items-center justify-between min-w-0"
                >
                  <span className="truncate flex-1 min-w-0">{option.label}</span>
                  {option.dotColor && (
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs ring-1 ring-border ml-2" 
                      style={{ backgroundColor: option.dotColor }}
                    />
                  )}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};