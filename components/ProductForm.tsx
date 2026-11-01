import React from 'react';
import { Select } from './Select';
import { Eye, Download, X, Upload, Sparkles, ThumbsUp, AlertTriangle, AlertOctagon, ChevronDown, Check, Plus, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { CurrencyCode, SUPPORTED_CURRENCIES, getCurrencyConfig, getDefaultCurrency } from '../utils/currency';
import { 
  PREDEFINED_TAG_COLORS, 
  TagColorId, 
  getTagColorDef, 
  DEFAULT_TAG_BADGE_CLASS, 
  DEFAULT_TAG_DOT_COLOR 
} from '../utils/tagColors';

interface ProductFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  categoryOptions: { label: string; value: string }[];
  monthOptions: { label: string; value: number }[];
  yearOptions: { label: string; value: number }[];
  conditionOptions?: { label: string; value: string; icon?: any }[];
  currency?: CurrencyCode;
  availableTags?: string[];
  tagColors?: Record<string, string>;
  onSetTagColor?: (tagName: string, colorId: TagColorId) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  setFormData,
  handleFileChange,
  categoryOptions,
  monthOptions,
  yearOptions,
  conditionOptions,
  currency,
  availableTags,
  tagColors,
  onSetTagColor,
}) => {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const activeCurrencyCode = formData.currency || currency || getDefaultCurrency();
  const currConfig = getCurrencyConfig(activeCurrencyCode);
  const priceContainerRef = React.useRef<HTMLDivElement>(null);
  const [priceBoxWidth, setPriceBoxWidth] = React.useState<number | undefined>(undefined);

  const updatePriceBoxWidth = React.useCallback(() => {
    if (priceContainerRef.current) {
      setPriceBoxWidth(priceContainerRef.current.getBoundingClientRect().width);
    }
  }, []);

  React.useEffect(() => {
    updatePriceBoxWidth();
    window.addEventListener('resize', updatePriceBoxWidth);
    return () => window.removeEventListener('resize', updatePriceBoxWidth);
  }, [updatePriceBoxWidth]);

  const receiptSizeKb = React.useMemo(() => {
    if (!formData.receipt || typeof formData.receipt !== 'string') return null;
    if (formData.receipt.startsWith('data:')) {
      const base64Data = formData.receipt.split(',')[1] || '';
      return Math.round((base64Data.length * 3) / 4 / 1024);
    }
    return null;
  }, [formData.receipt]);

  const [tagInput, setTagInput] = React.useState('');
  const [selectedNewTagColor, setSelectedNewTagColor] = React.useState<TagColorId>('blue');
  const [openTagColorDropdown, setOpenTagColorDropdown] = React.useState<string | null>(null);
  const [isNewTagColorOpen, setIsNewTagColorOpen] = React.useState(false);
  const currentTags: string[] = Array.isArray(formData.tags) ? formData.tags : [];

  const handleAddTag = (rawTag: string, colorToAssign?: TagColorId) => {
    const cleaned = rawTag.trim().replace(/^#+/, '');
    if (!cleaned) return;
    if (!currentTags.some(t => t.toLowerCase() === cleaned.toLowerCase())) {
      setFormData({
        ...formData,
        tags: [...currentTags, cleaned]
      });
      const chosenColor = colorToAssign || selectedNewTagColor;
      if (onSetTagColor) {
        onSetTagColor(cleaned, chosenColor);
      }
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: currentTags.filter(t => t !== tagToRemove)
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
          Product Name
        </label>
        <input 
          required
          autoFocus
          type="text"
          placeholder="e.g. MacBook Pro M3"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          className="flex min-h-10 w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm leading-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
        />
      </div>

      <div className="grid grid-cols-[3fr_2fr] sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
            Category
          </label>
          <Select 
            value={formData.category}
            onChange={(val) => setFormData({...formData, category: String(val)})}
            options={categoryOptions}
            open={openDropdown === 'category'}
            onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'category' : null)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
            Price
          </label>
          <div 
            ref={priceContainerRef}
            className="flex items-center min-h-10 w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-slate-900 dark:focus-within:ring-white focus-within:border-transparent transition-all overflow-hidden"
          >
            <DropdownMenu
              open={openDropdown === 'currency'}
              onOpenChange={(isOpen) => {
                if (isOpen) updatePriceBoxWidth();
                setOpenDropdown(isOpen ? 'currency' : null);
              }}
            >
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 px-2.5 h-10 border-r border-slate-200 dark:border-zinc-800 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-sm font-semibold transition-colors shrink-0 outline-none"
                  title="Select Currency"
                >
                  <span className="min-w-[14px] text-center">{currConfig.symbol}</span>
                  <ChevronDown size={14} className={`text-slate-500 dark:text-zinc-500 transition-transform duration-200 ${openDropdown === 'currency' ? 'rotate-180' : ''}`} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                alignOffset={-1}
                sideOffset={4}
                style={{ width: priceBoxWidth ? `${priceBoxWidth}px` : undefined }} 
                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 max-h-[220px] overflow-y-auto"
              >
                <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                  Select Currency
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  {SUPPORTED_CURRENCIES.map(curr => {
                    const isSelected = activeCurrencyCode === curr.code;
                    return (
                      <DropdownMenuItem
                        key={curr.code}
                        onClick={() => {
                          setFormData((prev: any) => ({ ...prev, currency: curr.code }));
                          try {
                            localStorage.setItem('tech_tracker_currency', curr.code);
                          } catch (e) {}
                        }}
                        className="cursor-pointer text-sm font-medium flex items-center justify-between group py-2 px-3"
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <span className={`w-7 shrink-0 text-center font-bold mr-2 text-xs ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-zinc-400'}`}>
                            {curr.symbol}
                          </span>
                          <span className="text-slate-300 dark:text-zinc-600 mr-2 text-xs">-</span>
                          <span className={`font-semibold text-sm ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-400'}`}>
                            {curr.code}
                          </span>
                        </div>
                        {isSelected && (
                          <Check size={14} className="text-slate-900 dark:text-white shrink-0 ml-2" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <input 
              type="number"
              placeholder="0.00"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              className="flex-1 min-h-10 px-3 py-2 text-sm leading-normal text-slate-900 dark:text-white bg-transparent outline-none border-none focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
          Purchase Date
        </label>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Select 
            value={formData.purchaseMonth}
            onChange={(val) => setFormData({...formData, purchaseMonth: Number(val)})}
            options={monthOptions}
            open={openDropdown === 'month'}
            onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'month' : null)}
          />
          <Select 
            value={formData.purchaseYear}
            onChange={(val) => setFormData({...formData, purchaseYear: Number(val)})}
            options={yearOptions}
            open={openDropdown === 'year'}
            onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'year' : null)}
          />
        </div>
      </div>

      <div className="grid grid-cols-[2fr_3fr] sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <div className="flex items-center h-7 mb-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
              Warranty Duration
            </label>
          </div>
          <div className="relative">
            <input 
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 1 or 0.5"
              value={formData.warrantyYears}
              onChange={e => setFormData({...formData, warrantyYears: e.target.value})}
              className="flex min-h-10 w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-3 pr-14 py-2 text-sm leading-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-zinc-500 font-medium pointer-events-none">
              Year
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center h-7 mb-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
              Choose Condition
            </label>
          </div>
          <ToggleGroup
            type="single"
            value={formData.condition === 'Mint' ? 'Fine' : formData.condition}
            onValueChange={(val) => {
              if (val) setFormData({...formData, condition: val});
            }}
            className="flex items-stretch h-10 w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1 gap-1"
          >
            <ToggleGroupItem
              value="Fine"
              aria-label="Fine"
              className={`flex-1 h-full rounded-md text-slate-400 hover:text-emerald-600 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 dark:hover:text-emerald-400 data-[state=on]:bg-emerald-100 data-[state=on]:text-emerald-700 dark:data-[state=on]:bg-emerald-900/40 dark:data-[state=on]:text-emerald-400 transition-all duration-200 ${(formData.condition === 'Fine' || formData.condition === 'Mint') ? 'shadow-sm' : ''}`}
              title="Fine"
            >
              <Sparkles size={18} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Good"
              aria-label="Good"
              className={`flex-1 h-full rounded-md text-slate-400 hover:text-blue-600 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 dark:hover:text-blue-400 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 dark:data-[state=on]:bg-blue-900/40 dark:data-[state=on]:text-blue-400 transition-all duration-200 ${formData.condition === 'Good' ? 'shadow-sm' : ''}`}
              title="Good"
            >
              <ThumbsUp size={18} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Poor"
              aria-label="Poor"
              className={`flex-1 h-full rounded-md text-slate-400 hover:text-amber-600 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 dark:hover:text-amber-400 data-[state=on]:bg-amber-100 data-[state=on]:text-amber-700 dark:data-[state=on]:bg-amber-900/40 dark:data-[state=on]:text-amber-400 transition-all duration-200 ${formData.condition === 'Poor' ? 'shadow-sm' : ''}`}
              title="Poor"
            >
              <AlertTriangle size={18} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Critical"
              aria-label="Critical"
              className={`flex-1 h-full rounded-md text-slate-400 hover:text-red-600 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 dark:hover:text-red-400 data-[state=on]:bg-red-100 data-[state=on]:text-red-700 dark:data-[state=on]:bg-red-900/40 dark:data-[state=on]:text-red-400 transition-all duration-200 ${formData.condition === 'Critical' ? 'shadow-sm' : ''}`}
              title="Critical"
            >
              <AlertOctagon size={18} />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
          Tags / Labels
        </label>
        
        {/* Selected tags chip bar */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2 min-h-6">
          {currentTags.length > 0 ? (
            currentTags.map(tag => {
              const colorId = tagColors?.[tag.toLowerCase()];
              const colorDef = getTagColorDef(colorId);
              const badgeClass = colorDef ? colorDef.badgeClass : DEFAULT_TAG_BADGE_CLASS;
              const dotColor = colorDef ? colorDef.dotColor : DEFAULT_TAG_DOT_COLOR;

              return (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-full text-xs font-medium border shadow-2xs transition-all ${badgeClass}`}
                >
                  {/* Clickable color dot dropdown to reassign color */}
                  <DropdownMenu
                    open={openTagColorDropdown === tag}
                    onOpenChange={(isOpen) => setOpenTagColorDropdown(isOpen ? tag : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-3 h-3 rounded-full hover:scale-125 transition-transform shrink-0 cursor-pointer ring-1 ring-black/10 dark:ring-white/20"
                        style={{ backgroundColor: dotColor }}
                        title={`Change color for #${tag}`}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="p-2 w-auto min-w-0 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-xl rounded-xl z-50">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 px-1">
                        Tag Color
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {PREDEFINED_TAG_COLORS.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              onSetTagColor?.(tag, c.id);
                              setOpenTagColorDropdown(null);
                            }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ring-1 ring-black/15 dark:ring-white/20 ${
                              colorId === c.id ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-zinc-900' : ''
                            }`}
                            style={{ backgroundColor: c.dotColor }}
                            title={c.name}
                          >
                            {colorId === c.id && (
                              <Check 
                                size={12} 
                                className={c.id === 'platinum' ? 'text-slate-900 drop-shadow-xs' : 'text-white drop-shadow-xs'} 
                                strokeWidth={3} 
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <span className="font-semibold">{tag}</span>

                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                    title="Remove tag"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })
          ) : (
            <span className="text-xs text-slate-400 dark:text-zinc-500 italic">No tags added yet</span>
          )}
        </div>

        {/* Tag input, color picker, and add button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 font-mono text-sm pointer-events-none">#</span>
            <input
              type="text"
              placeholder="e.g. work, gifted, loaned"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="flex min-h-10 w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-7 pr-3 py-2 text-sm leading-normal text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
            />
          </div>

          {/* Color selector for new tag */}
          <DropdownMenu open={isNewTagColorOpen} onOpenChange={setIsNewTagColorOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-10 px-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                title="Select tag color"
              >
                <span 
                  className="w-3.5 h-3.5 rounded-full shadow-2xs shrink-0 ring-1 ring-black/15 dark:ring-white/20" 
                  style={{ backgroundColor: getTagColorDef(selectedNewTagColor)?.dotColor || '#2563eb' }} 
                />
                <ChevronDown size={13} className="text-slate-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-2 w-auto min-w-0 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-xl rounded-xl z-50">
              <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 px-1">
                Choose Color
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {PREDEFINED_TAG_COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedNewTagColor(c.id);
                      setIsNewTagColorOpen(false);
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ring-1 ring-black/15 dark:ring-white/20 ${
                      selectedNewTagColor === c.id ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-zinc-900' : ''
                    }`}
                    style={{ backgroundColor: c.dotColor }}
                    title={c.name}
                  >
                    {selectedNewTagColor === c.id && (
                      <Check 
                        size={12} 
                        className={c.id === 'platinum' ? 'text-slate-900 drop-shadow-xs' : 'text-white drop-shadow-xs'} 
                        strokeWidth={3} 
                      />
                    )}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleAddTag(tagInput)}
            disabled={!tagInput.trim()}
            className="h-10 px-3 text-xs font-medium border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Plus size={14} className="mr-1" />
            Add
          </Button>
        </div>

        {/* Suggested tags from other products */}
        {availableTags && availableTags.filter(t => !currentTags.some(ct => ct.toLowerCase() === t.toLowerCase())).length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mr-1">Suggested:</span>
            {availableTags
              .filter(t => !currentTags.some(ct => ct.toLowerCase() === t.toLowerCase()))
              .slice(0, 8)
              .map(tag => {
                const colorId = tagColors?.[tag.toLowerCase()];
                const colorDef = getTagColorDef(colorId);
                const dotColor = colorDef ? colorDef.dotColor : DEFAULT_TAG_DOT_COLOR;

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag, colorId as TagColorId)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700/60 transition-colors cursor-pointer"
                  >
                    <span 
                      className="w-1.5 h-1.5 rounded-full shrink-0" 
                      style={{ backgroundColor: dotColor }} 
                    />
                    <Plus size={10} className="text-slate-400" />
                    <span>{tag}</span>
                  </button>
                );
              })}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between h-7 mb-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
              Receipt (PDF)
            </label>
            {formData.receipt && (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                  onClick={() => {
                    const base64Content = formData.receipt!.split(',')[1];
                    const binary = atob(base64Content);
                    const array = [];
                    for (let i = 0; i < binary.length; i++) {
                      array.push(binary.charCodeAt(i));
                    }
                    const blob = new Blob([new Uint8Array(array)], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                  }}
                  title="View Receipt"
                >
                  <Eye size={13} />
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                  title="Download Receipt"
                >
                  <a href={formData.receipt} download={`Receipt_${formData.name.replace(/\s+/g, '_')}.pdf`}>
                    <Download size={13} />
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFormData({ ...formData, receipt: undefined })}
                  className="h-7 w-7 text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                  title="Remove Receipt"
                >
                  <X size={13} />
                </Button>
              </div>
            )}
          </div>
          <div className="relative">
            <input 
              type="file" 
              accept="application/pdf"
              onChange={handleFileChange}
              id="receipt-upload"
              className="hidden"
            />
            <Button 
              asChild
              variant="outline"
              className={`flex h-10 w-full rounded-lg border-dashed font-normal cursor-pointer transition-all duration-200 ${
                formData.receipt 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300' 
                  : 'border-slate-300 dark:border-zinc-700 bg-transparent text-slate-500 dark:text-zinc-500 hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <label htmlFor="receipt-upload">
                <Upload size={16} className="mr-2" />
                {formData.receipt ? 'PDF Uploaded' : 'Upload PDF'}
              </label>
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-zinc-500 mt-1.5 px-0.5">
            <span>PDF format only • Max limit 750 KB</span>
            {receiptSizeKb !== null && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Attached (~{receiptSizeKb} KB)
              </span>
            )}
          </div>
        </div>
    </>
  );
};
