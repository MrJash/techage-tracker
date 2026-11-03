import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { SelectOption, SelectGroup } from './MultiSelect';
import { SortDropdownOption } from './SortDropdown';

export interface MobileFilterSortProps {
  filterCategories: string[];
  onFilterCategoriesChange: (filters: string[]) => void;
  filterOptions: SelectOption[] | SelectGroup[];
  activeSortOrder: string;
  onSortChange: (sort: string) => void;
  sortOptions: SortDropdownOption[];
  className?: string;
}

export const MobileFilterSort: React.FC<MobileFilterSortProps> = ({
  filterCategories,
  onFilterCategoriesChange,
  filterOptions,
  activeSortOrder,
  onSortChange,
  sortOptions,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isGrouped = filterOptions.length > 0 && 'options' in filterOptions[0];
  const allFilterOptions: SelectOption[] = isGrouped
    ? (filterOptions as SelectGroup[]).flatMap(g => g.options)
    : (filterOptions as SelectOption[]);

  const activeFiltersCount = filterCategories.length;
  const isAllSelected = allFilterOptions.length > 0 && filterCategories.length === allFilterOptions.length;
  const selectedSortOption = sortOptions.find(opt => opt.value === activeSortOrder);

  const toggleFilter = (filterVal: string) => {
    const next = filterCategories.includes(filterVal)
      ? filterCategories.filter(f => f !== filterVal)
      : [...filterCategories, filterVal];
    onFilterCategoriesChange(next);
  };

  const removeFilter = (filterVal: string) => {
    onFilterCategoriesChange(filterCategories.filter(f => f !== filterVal));
  };

  const toggleSelectAllFilters = () => {
    if (isAllSelected) {
      onFilterCategoriesChange([]);
    } else {
      onFilterCategoriesChange(allFilterOptions.map(o => o.value));
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex h-9 items-center justify-between gap-1.5 rounded-[var(--radius)] border border-border bg-card px-2.5 py-1 text-xs font-normal text-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground shrink-0 shadow-xs",
            activeFiltersCount > 0 && "border-primary/50 text-foreground font-medium",
            className
          )}
          title="Sort and Filter items"
          aria-label="Sort and Filter items"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <SlidersHorizontal
              size={14}
              className={cn("shrink-0", activeFiltersCount > 0 ? "text-primary" : "text-foreground")}
            />
            <span className="truncate">Sort & Filter</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground leading-none">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <ChevronDown
            size={13}
            className={cn("text-muted-foreground transition-transform duration-200 shrink-0", isOpen && "rotate-180")}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-[290px] xs:w-[320px] max-w-[calc(100vw-24px)] max-h-[80vh] flex flex-col p-2 bg-popover text-popover-foreground border border-border rounded-[var(--radius)] shadow-xl"
      >
        {/* Scrollable Content Container - Items scroll strictly within this area */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2">
          {/* Active Filters Summary Banner */}
          {activeFiltersCount > 0 && (
            <div className="p-2 rounded-[calc(var(--radius)-2px)] bg-muted/60 border border-border/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  Active Filters
                  <span className="flex h-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activeFiltersCount}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onFilterCategoriesChange([]);
                  }}
                  className="text-[10px] font-medium text-destructive hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                {filterCategories.map((filterVal) => {
                  const opt = allFilterOptions.find((o) => o.value === filterVal);
                  const label = opt ? opt.label : filterVal;
                  return (
                    <span
                      key={filterVal}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-card border border-border text-foreground shadow-2xs"
                    >
                      {opt?.dotColor && (
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: opt.dotColor }}
                        />
                      )}
                      <span className="truncate max-w-[120px]">{label}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFilter(filterVal);
                        }}
                        className="text-muted-foreground hover:text-foreground ml-0.5 cursor-pointer"
                        title={`Remove ${label}`}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 1: Sort By */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1 flex items-center justify-between">
              <span>Sort By</span>
              <span className="text-[10px] text-primary font-medium normal-case">
                {selectedSortOption?.label || 'Newest First'}
              </span>
            </DropdownMenuLabel>
            {sortOptions.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={activeSortOrder === opt.value}
                disabled={opt.disabled}
                onSelect={() => {
                  onSortChange(opt.value);
                }}
                className="cursor-pointer whitespace-nowrap text-xs"
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-2 bg-border" />

          {/* Section 2: Filters */}
          <div className="flex items-center justify-between px-2 py-1">
            <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
              Filter Items
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleSelectAllFilters();
              }}
              className="text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {isGrouped ? (
            (filterOptions as SelectGroup[]).map((group, idx) => (
              <DropdownMenuGroup key={group.label} className="mt-1">
                <DropdownMenuLabel className="font-semibold text-[10px] text-muted-foreground/80 uppercase tracking-wider px-2 py-1">
                  {group.label}
                </DropdownMenuLabel>
                {group.options.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={filterCategories.includes(option.value)}
                    onSelect={(e) => {
                      e.preventDefault();
                      toggleFilter(option.value);
                    }}
                    className="cursor-pointer text-xs flex items-center justify-between"
                  >
                    <span className="truncate flex-1">{option.label}</span>
                    {option.dotColor && (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs ring-1 ring-border ml-2"
                        style={{ backgroundColor: option.dotColor }}
                      />
                    )}
                  </DropdownMenuCheckboxItem>
                ))}
                {idx < (filterOptions as SelectGroup[]).length - 1 && (
                  <DropdownMenuSeparator className="my-1.5 bg-border/50" />
                )}
              </DropdownMenuGroup>
            ))
          ) : (
            <DropdownMenuGroup>
              {(filterOptions as SelectOption[]).map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={filterCategories.includes(option.value)}
                  onSelect={(e) => {
                    e.preventDefault();
                    toggleFilter(option.value);
                  }}
                  className="cursor-pointer text-xs flex items-center justify-between"
                >
                  <span className="truncate flex-1">{option.label}</span>
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

        {/* Separator before Done Button - Fixed at bottom */}
        <DropdownMenuSeparator className="my-1.5 bg-border shrink-0" />

        {/* Fixed Done Button Container - Outside scroll area */}
        <div className="pt-0.5 shrink-0">
          <Button
            size="sm"
            className="w-full h-8 text-xs font-medium cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Done
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
