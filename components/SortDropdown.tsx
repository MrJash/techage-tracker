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
          <Button variant="outline" size="icon" className="h-10 w-10 border-border bg-card hover:bg-accent hover:text-accent-foreground text-foreground rounded-[var(--radius)]">
            <ArrowUpDown size={20} className="shrink-0" />
          </Button>
        ) : (
          <Button variant="outline" className="flex h-10 w-[176px] items-center justify-between rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-sm font-normal ring-offset-background transition-all duration-200 hover:bg-accent hover:text-accent-foreground text-foreground">
            <div className="flex items-center min-w-0 flex-1">
              <ArrowUpDown size={16} className="mr-2 text-foreground shrink-0" />
              <span className="block truncate text-foreground">
                {selectedOption ? selectedOption.label : 'Sort Order'}
              </span>
            </div>
            <ChevronDown size={16} className={`ml-2 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[176px] bg-popover text-popover-foreground border-border">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal text-muted-foreground px-2 py-1.5 pt-2">
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
