import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  X, 
  Folder, 
  Calendar, 
  FileText, 
  Sparkles, 
  ThumbsUp, 
  AlertTriangle, 
  AlertOctagon, 
  ArrowRight,
  CornerDownLeft
} from 'lucide-react';
import { Collection, Product, MONTHS } from '../types';
import { CurrencyCode, formatPrice } from '../utils/currency';
import { getTagColorDef, DEFAULT_TAG_BADGE_CLASS } from '../utils/tagColors';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  currency: CurrencyCode;
  onSelectProduct: (collectionId: string, productId: string) => void;
  tagColors?: Record<string, string>;
}

interface FlatProductItem {
  product: Product;
  collectionId: string;
  collectionName: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  collections,
  currency,
  onSelectProduct,
  tagColors
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when opened & reset state
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Flatten all products across collections
  const allProducts = useMemo<FlatProductItem[]>(() => {
    return (collections || []).flatMap(col =>
      (col.products || []).map(p => ({
        product: p,
        collectionId: col.id,
        collectionName: col.name,
      }))
    );
  }, [collections]);

  // Filter based on query
  const filteredProducts = useMemo<FlatProductItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // If empty, show newest 8 products by createdAt or purchase date
      return [...allProducts]
        .sort((a, b) => (b.product.createdAt || 0) - (a.product.createdAt || 0))
        .slice(0, 8);
    }
    return allProducts.filter(item => {
      const p = item.product;
      const nameMatch = p.name.toLowerCase().includes(q);
      const categoryMatch = p.category.toLowerCase().includes(q);
      const conditionMatch = p.condition?.toLowerCase().includes(q);
      const collectionMatch = item.collectionName.toLowerCase().includes(q);
      const tagMatch = p.tags?.some(t => t.toLowerCase().includes(q));
      return nameMatch || categoryMatch || conditionMatch || collectionMatch || tagMatch;
    });
  }, [allProducts, query]);

  // Grouped valuation calculation for matched items across different currencies
  const matchedValuations = useMemo(() => {
    const targetItems = query.trim() ? filteredProducts : allProducts;
    const map: Record<string, number> = {};
    for (const item of targetItems) {
      const p = item.product;
      if (p.price && !isNaN(p.price) && p.price > 0) {
        const c = p.currency || currency || 'USD';
        map[c] = (map[c] || 0) + p.price;
      }
    }
    return Object.entries(map).map(([code, val]) => formatPrice(val, code as CurrencyCode));
  }, [filteredProducts, allProducts, query, currency]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (filteredProducts.length > 0 ? (prev + 1) % filteredProducts.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (filteredProducts.length > 0 ? (prev - 1 + filteredProducts.length) % filteredProducts.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredProducts[selectedIndex]) {
          const item = filteredProducts[selectedIndex];
          onSelectProduct(item.collectionId, item.product.id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredProducts, selectedIndex, onClose, onSelectProduct]);

  // Ensure selected item is scrolled into view in list
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const renderConditionIcon = (condition?: string) => {
    switch (condition) {
      case 'Fine':
      case 'Mint':
        return <Sparkles size={11} className="text-emerald-500 shrink-0" />;
      case 'Good':
        return <ThumbsUp size={11} className="text-blue-500 shrink-0" />;
      case 'Poor':
        return <AlertTriangle size={11} className="text-amber-500 shrink-0" />;
      case 'Critical':
        return <AlertOctagon size={11} className="text-red-500 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 my-auto sm:my-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-zinc-800 gap-3">
          <Search size={20} className="text-slate-400 dark:text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search products or categories across all collections..."
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-sm sm:text-base outline-none font-medium"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={16} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center justify-center text-[10px] font-mono leading-none font-semibold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Status / Scope bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50/70 dark:bg-zinc-900/60 border-b border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-400 dark:text-zinc-500">
          <span>
            {query.trim()
              ? `Found ${filteredProducts.length} item${filteredProducts.length === 1 ? '' : 's'} across all collections`
              : `Recently added products (${allProducts.length} total items)`}
          </span>
          {matchedValuations.length > 0 && (
            <span className="font-medium text-slate-600 dark:text-zinc-400">
              Total: {matchedValuations.join(' • ')}
            </span>
          )}
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="max-h-[60vh] sm:max-h-[420px] overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60 p-2 space-y-1"
        >
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-zinc-500">
                <Search size={22} />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">No items found</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                No gadgets matched "{query}". Try searching by category, device name, or collection.
              </p>
            </div>
          ) : (
            filteredProducts.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const prod = item.product;
              const dateStr = `${MONTHS[prod.purchaseMonth]?.slice(0, 3) || ''} ${prod.purchaseYear}`;

              return (
                <div
                  key={`${item.collectionId}-${prod.id}`}
                  data-index={idx}
                  onClick={() => {
                    onSelectProduct(item.collectionId, prod.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 group gap-3 ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-zinc-800/90 text-slate-900 dark:text-white shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm truncate text-slate-900 dark:text-white">
                        {prod.name}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-medium shrink-0">
                        {prod.category}
                      </span>
                      {prod.condition && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200/50 dark:border-zinc-700/50 text-slate-600 dark:text-zinc-400 font-medium">
                          {renderConditionIcon(prod.condition)}
                          {prod.condition}
                        </span>
                      )}
                      {prod.receipt && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <FileText size={10} />
                          Receipt
                        </span>
                      )}
                      {prod.tags && prod.tags.slice(0, 3).map(tag => {
                        const colorDef = getTagColorDef(tagColors?.[tag.toLowerCase()]);
                        const badgeClass = colorDef ? colorDef.badgeClass : DEFAULT_TAG_BADGE_CLASS;
                        return (
                          <span 
                            key={tag} 
                            className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border shadow-2xs ${badgeClass}`}
                          >
                            <span className="opacity-70 mr-0.5">#</span>
                            {tag}
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-zinc-500">
                      <span className="inline-flex items-center gap-1 text-slate-500 dark:text-zinc-400 font-medium truncate">
                        <Folder size={11} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                        {item.collectionName}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 shrink-0">
                        <Calendar size={11} className="shrink-0" />
                        {dateStr}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    {prod.price !== undefined && (
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatPrice(prod.price, (prod.currency as CurrencyCode) || currency || 'USD')}
                      </span>
                    )}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-slate-200/80 dark:bg-zinc-700 text-slate-900 dark:text-white' : 'text-slate-300 dark:text-zinc-600'
                    }`}>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] text-slate-400 dark:text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800 text-[10px] font-mono">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800 text-[10px] font-mono">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800 text-[10px] font-mono flex items-center gap-0.5">
                <CornerDownLeft size={9} />
                enter
              </kbd>
              <span>select</span>
            </span>
          </div>
          <span className="hidden sm:inline">
            Press <kbd className="px-1 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800 text-[10px] font-mono">ESC</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};
