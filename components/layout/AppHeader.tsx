import React from 'react';
import { Menu, Search, Trash2, FolderInput, XSquare, ListChecks, Filter, Settings, Command } from 'lucide-react';
import { Button } from '../ui/button';
import { MultiSelect, Option } from '../MultiSelect';
import { SortDropdown, SortOption, SortDropdownOption } from '../SortDropdown';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';
import { Collection } from '../../types';
import { ThemeMode } from '../SettingsModal';
import { CurrencyCode, formatPrice } from '../../utils/currency';
import { getCollectionIcon } from '../Sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export interface AppHeaderProps {
  activeCollection: Collection;
  collections: Collection[];
  valuationEntries: [string, number][];
  filterCategories: string[];
  onFilterCategoriesChange: (val: string[]) => void;
  filterOptions: Option[];
  activeSortOrder: SortOption;
  onSortChange: (val: SortOption) => void;
  sortOptions: SortDropdownOption[];
  isSelectMode: boolean;
  onToggleSelectMode: (val: boolean) => void;
  selectedProductIds: string[];
  onClearSelection: () => void;
  onBatchDelete: () => void;
  onBatchMove: (colId: string) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onThemeToggle: (newMode: ThemeMode) => void;
  onOpenMobileMenu: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeCollection,
  collections,
  valuationEntries,
  filterCategories,
  onFilterCategoriesChange,
  filterOptions,
  activeSortOrder,
  onSortChange,
  sortOptions,
  isSelectMode,
  onToggleSelectMode,
  selectedProductIds,
  onClearSelection,
  onBatchDelete,
  onBatchMove,
  onOpenSearch,
  onOpenSettings,
  onThemeToggle,
  onOpenMobileMenu,
}) => {
  return (
    <header className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border shrink-0 transition-colors duration-200 h-auto md:h-20">
      {/* Mobile 2-line layout (< md:) */}
      <div className="md:hidden px-4 py-2.5 flex flex-col gap-2">
        {/* Top row: Hamburger on left, all action icons on right */}
        <div className="flex items-center justify-between">
          <button 
            type="button"
            data-tour="mobile-menu-btn"
            className="shrink-0 p-2 -ml-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-[var(--radius)] transition-colors"
            onClick={onOpenMobileMenu}
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu size={22} className="shrink-0" />
          </button>

          <div className="flex items-center gap-1 sm:gap-1.5" data-tour="mobile-filters-group">
            <button
              type="button"
              onClick={onOpenSearch}
              className="h-9 w-9 flex items-center justify-center rounded-[var(--radius)] border border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors shrink-0 cursor-pointer"
              title="Search all products (Ctrl+K)"
              aria-label="Search all products"
            >
              <Search size={16} />
            </button>

            {isSelectMode ? (
              <>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={onBatchDelete} 
                  disabled={selectedProductIds.length === 0} 
                  title="Delete Selected" 
                  className="h-9 w-9 shrink-0"
                >
                  <Trash2 size={15} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      disabled={selectedProductIds.length === 0} 
                      title="Move Selected" 
                      className="h-9 w-9 shrink-0 border border-border"
                    >
                      <FolderInput size={15} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px] bg-popover text-popover-foreground border border-border rounded-[var(--radius)]">
                    <DropdownMenuLabel className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                      Move to
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      {collections.filter(c => c.id !== activeCollection.id).map(col => (
                        <DropdownMenuItem 
                          key={col.id} 
                          onClick={() => onBatchMove(col.id)} 
                          className="gap-2 cursor-pointer text-xs"
                        >
                          {col.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground shrink-0"
                  onClick={onClearSelection}
                  title="Cancel Selection"
                >
                  <XSquare size={15} />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground shrink-0"
                  onClick={() => onToggleSelectMode(true)}
                  title="Select Items"
                >
                  <ListChecks size={16} />
                </Button>
                <MultiSelect
                  value={filterCategories}
                  onChange={onFilterCategoriesChange}
                  options={filterOptions}
                  placeholder="Filter"
                  icon={Filter}
                  iconOnly={true}
                />
                <SortDropdown
                  value={activeSortOrder}
                  onChange={onSortChange}
                  options={sortOptions}
                  iconOnly={true}
                />
              </>
            )}

            <button
              type="button"
              data-tour="settings-btn"
              onClick={onOpenSettings}
              className="p-2 rounded-[var(--radius)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Settings"
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>

            <AnimatedThemeToggler 
              onThemeToggle={onThemeToggle}
              className="p-2 rounded-[var(--radius)] text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center shrink-0"
            />
          </div>
        </div>

        {/* Bottom row: Collection Name + Count on left, Valuation on right */}
        <div className="flex items-center justify-between pt-0.5" data-tour="inventory-overview">
          <div className="min-w-0 pr-2">
            <h1 className="text-xl font-bold text-foreground truncate leading-tight">
              {activeCollection.name}
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              {activeCollection.products.length} Items
            </p>
          </div>

          {valuationEntries.length > 0 && (
            <div 
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius)] bg-muted text-xs font-semibold text-foreground border border-border"
              title="Total Valuation of Collection"
            >
              {valuationEntries.map(([currCode, sum], i) => (
                <React.Fragment key={currCode}>
                  {i > 0 && <span className="text-muted-foreground/60 font-normal">•</span>}
                  <span>{formatPrice(sum as number, currCode as CurrencyCode)}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop & Tablet 1-line layout (md: and above) */}
      <div className="hidden md:flex h-full px-6 items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-2" data-tour="inventory-overview">
          <button 
            type="button"
            data-tour="mobile-menu-btn"
            className="lg:hidden shrink-0 p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-[var(--radius)] transition-colors"
            onClick={onOpenMobileMenu}
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu size={22} className="shrink-0" />
          </button>
          <div className="min-w-0 truncate">
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
              {activeCollection.name}
            </h1>
            <p className="text-xs text-muted-foreground font-medium truncate">
              {activeCollection.products.length} Items
            </p>
          </div>
          
          {valuationEntries.length > 0 && (
            <div 
              className="hidden xl:flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius)] bg-muted text-sm font-semibold text-foreground border border-border cursor-default"
              title="Total Valuation of Collection"
            >
              {valuationEntries.map(([currCode, sum], i) => (
                <React.Fragment key={currCode}>
                  {i > 0 && <span className="text-muted-foreground/60 font-normal">•</span>}
                  <span>{formatPrice(sum as number, currCode as CurrencyCode)}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Desktop Full View (xl and above: >= 1280px) */}
          <div className="hidden xl:flex items-center gap-3" data-tour="filters-group">
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-xs group min-w-[210px] cursor-pointer"
              title="Search all products (Ctrl+K)"
            >
              <Search size={15} className="text-muted-foreground group-hover:text-accent-foreground shrink-0 transition-colors duration-200" />
              <span className="flex-1 text-left truncate text-xs text-muted-foreground group-hover:text-accent-foreground font-normal transition-colors duration-200">
                Search all items...
              </span>
              <kbd className="inline-flex items-center justify-center gap-1 h-5 px-1.5 text-[10px] font-mono leading-none shrink-0 font-medium text-muted-foreground bg-muted rounded border border-border shadow-xs transition-colors duration-200 select-none">
                <Command size={10} strokeWidth={2.5} className="shrink-0" />
                <span className="font-semibold text-[10px] leading-none">K</span>
              </kbd>
            </button>
            {isSelectMode ? (
              <>
                <Button variant="destructive" onClick={onBatchDelete} disabled={selectedProductIds.length === 0} title="Delete Selected" className="h-10 px-3">
                  <Trash2 />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" disabled={selectedProductIds.length === 0} title="Move Selected" className="h-10 px-3 border border-border">
                      <FolderInput />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px] bg-popover text-popover-foreground border border-border rounded-[var(--radius)]">
                    <DropdownMenuLabel className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                      Move to
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      {collections.filter(c => c.id !== activeCollection.id).length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No other collections
                        </div>
                      ) : (
                        collections
                          .filter(c => c.id !== activeCollection.id)
                          .map(col => (
                            <DropdownMenuItem 
                              key={col.id} 
                              onClick={() => onBatchMove(col.id)} 
                              className="gap-2 cursor-pointer"
                            >
                              {React.createElement(getCollectionIcon(col.name), { size: 14, className: 'text-muted-foreground shrink-0' })}
                              {col.name}
                            </DropdownMenuItem>
                          ))
                      )}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  className="h-10 rounded-[var(--radius)] font-normal border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-xs"
                  onClick={onClearSelection}
                >
                  <XSquare size={16} className="mr-2" />
                  Cancel Selection
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="h-10 rounded-[var(--radius)] font-normal border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-xs"
                  onClick={() => onToggleSelectMode(true)}
                >
                  <ListChecks size={16} className="mr-2" />
                  Select
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <MultiSelect
                  value={filterCategories}
                  onChange={onFilterCategoriesChange}
                  options={filterOptions}
                  placeholder="Filter Items"
                  icon={Filter}
                />
                <SortDropdown
                  value={activeSortOrder}
                  onChange={onSortChange}
                  options={sortOptions}
                />
              </>
            )}
          </div>

          {/* Tablet Compact View (md to xl: 768px - 1279px, including iPad Landscape 1024px) */}
          <div className="flex xl:hidden items-center gap-1.5" data-tour="tablet-filters-group">
            <button
              type="button"
              onClick={onOpenSearch}
              className="h-10 w-10 flex items-center justify-center rounded-[var(--radius)] border border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors shrink-0 cursor-pointer"
              title="Search all products (Ctrl+K)"
              aria-label="Search all products"
            >
              <Search size={18} />
            </button>

            {isSelectMode ? (
              <>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={onBatchDelete} 
                  disabled={selectedProductIds.length === 0} 
                  title="Delete Selected" 
                  className="h-10 w-10 shrink-0"
                >
                  <Trash2 size={16} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      disabled={selectedProductIds.length === 0} 
                      title="Move Selected" 
                      className="h-10 w-10 shrink-0 border border-border"
                    >
                      <FolderInput size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px] bg-popover text-popover-foreground border border-border rounded-[var(--radius)]">
                    <DropdownMenuLabel className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                      Move to
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      {collections.filter(c => c.id !== activeCollection.id).map(col => (
                        <DropdownMenuItem 
                          key={col.id} 
                          onClick={() => onBatchMove(col.id)} 
                          className="gap-2 cursor-pointer text-xs"
                        >
                          {col.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground shrink-0 rounded-[var(--radius)]"
                  onClick={onClearSelection}
                  title="Cancel Selection"
                >
                  <XSquare size={16} />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground shrink-0 rounded-[var(--radius)]"
                  onClick={() => onToggleSelectMode(true)}
                  title="Select Items"
                >
                  <ListChecks size={18} />
                </Button>
                <MultiSelect
                  value={filterCategories}
                  onChange={onFilterCategoriesChange}
                  options={filterOptions}
                  placeholder="Filter"
                  icon={Filter}
                  iconOnly={true}
                />
                <SortDropdown
                  value={activeSortOrder}
                  onChange={onSortChange}
                  options={sortOptions}
                  iconOnly={true}
                />
              </>
            )}
          </div>

          <button
            type="button"
            data-tour="settings-btn"
            onClick={onOpenSettings}
            className="p-2.5 rounded-[var(--radius)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>

          <AnimatedThemeToggler 
            onThemeToggle={onThemeToggle}
            className="p-2.5 rounded-[var(--radius)] text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center shrink-0"
          />
        </div>
      </div>
    </header>
  );
};
