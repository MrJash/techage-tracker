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
  dotColor?: string;
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
          <Button variant="outline" size="icon" className="h-10 w-10 border-border bg-card hover:bg-accent hover:text-accent-foreground text-foreground rounded-[var(--radius)]">
            {Icon ? <Icon size={20} className="shrink-0" /> : <Filter size={20} className="shrink-0" />}
          </Button>
        ) : (
          <Button variant="outline" className="flex h-10 w-[200px] items-center justify-between rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-sm font-normal ring-offset-background transition-all duration-200 hover:bg-accent hover:text-accent-foreground text-foreground">
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
      <DropdownMenuContent align="end" className={`bg-popover text-popover-foreground border-border max-h-80 overflow-y-auto ${iconOnly ? 'w-64' : 'w-[200px]'}`}>
        <DropdownMenuItem
          onSelect={(e) => { e.preventDefault(); toggleSelectAll(); }}
          className="cursor-pointer font-medium mb-1 flex items-center gap-2"
        >
          {isAllSelected ? <CheckSquare size={16} className="text-foreground" /> : <Square size={16} className="text-muted-foreground" />}
          Select All
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        
        {isGrouped ? (
          (options as SelectGroup[]).map((group, idx) => (
            <DropdownMenuGroup key={group.label}>
              <DropdownMenuLabel className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1.5 pt-2">
                {group.label}
              </DropdownMenuLabel>
              {group.options.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={(e) => { e.preventDefault(); toggleOption(option.value); }}
                  className="cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {value.includes(option.value) ? (
                      <CheckSquare size={16} className="text-primary shrink-0" />
                    ) : (
                      <Square size={16} className="text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {option.dotColor && (
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs ring-1 ring-border" 
                      style={{ backgroundColor: option.dotColor }}
                    />
                  )}
                </DropdownMenuItem>
              ))}
              {idx < options.length - 1 && <DropdownMenuSeparator className="bg-border my-1" />}
            </DropdownMenuGroup>
          ))
        ) : (
          <DropdownMenuGroup>
            {(options as SelectOption[]).map(option => (
              <DropdownMenuItem
                key={option.value}
                onSelect={(e) => { e.preventDefault(); toggleOption(option.value); }}
                className="cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {value.includes(option.value) ? (
                    <CheckSquare size={16} className="text-primary shrink-0" />
                  ) : (
                    <Square size={16} className="text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate">{option.label}</span>
                </div>
                {option.dotColor && (
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs ring-1 ring-border" 
                    style={{ backgroundColor: option.dotColor }}
                  />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};