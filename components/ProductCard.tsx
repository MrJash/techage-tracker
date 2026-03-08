import React, { useRef, useState } from 'react';
import { Product } from '../types';
import { calculateAge, getMonthName, calculateWarrantyStatus, getWarrantyExpirationDate } from '../utils/dateHelpers';
import { Calendar, Trash2, Pencil, IndianRupee, ShieldCheck, ShieldAlert, ShieldX, FileText, Eye, Download, X, GripHorizontal, FolderInput, Check } from 'lucide-react';
import Hamburger from 'hamburger-react';
import { getCollectionIcon } from './Sidebar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "./ui/dropdown-menu";

interface ProductCardProps {
  product: Product;
  onDelete: (id: string, name: string, rect: DOMRect) => void;
  onEdit: (product: Product) => void;
  onDeleteReceipt: (productId: string) => void;
  onMove: (productId: string, targetCollectionId: string) => void;
  availableCollections: { id: string; name: string }[];
  onDragStart: (e: React.DragEvent, productId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, productId: string) => void;
  onDragEnter?: (productId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDraggedOver?: boolean;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (productId: string) => void;
  onLongPress?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, onDelete, onEdit, onDeleteReceipt, onMove, availableCollections, 
  onDragStart, onDragOver, onDragEnter, onDrop, onDragEnd, isDraggedOver, 
  isSelectMode, isSelected, onToggleSelect, onLongPress 
}) => {
  const age = calculateAge(product.purchaseMonth, product.purchaseYear);
  const purchaseDate = `${getMonthName(product.purchaseMonth)} ${product.purchaseYear}`;
  const warrantyStatus = calculateWarrantyStatus(product.purchaseMonth, product.purchaseYear, product.warrantyYears);
  const expiryDate = getWarrantyExpirationDate(product.purchaseMonth, product.purchaseYear, product.warrantyYears);

  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [wasLongPressed, setWasLongPressed] = useState(false);

  const handlePointerDown = () => {
    if (isSelectMode) return;
    setWasLongPressed(false);
    longPressTimerRef.current = setTimeout(() => {
      setWasLongPressed(true);
      onLongPress?.(product.id);
    }, 1000);
  };

  const handlePointerUpOrLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (wasLongPressed) {
      e.preventDefault();
      setWasLongPressed(false);
      return;
    }
    if (isSelectMode) {
      onToggleSelect?.(product.id);
    }
  };


  const handleGripMouseDown = () => {
    setIsDragEnabled(true);
  };

  const handleDragStartInternal = (e: React.DragEvent) => {
    if (!isDragEnabled) {
      e.preventDefault();
      return;
    }
    // Hide the default browser drag ghost with a 1x1 transparent image
    const transparent = document.createElement('canvas');
    transparent.width = 1;
    transparent.height = 1;
    e.dataTransfer.setDragImage(transparent, 0, 0);
    
    setIsDragging(true);
    onDragStart(e, product.id);
  };

  const handleDragEndInternal = (e: React.DragEvent) => {
    setIsDragEnabled(false);
    setIsDragging(false);
    onDragEnd(e);
  };

  return (
    <div 
      ref={cardRef}
      className={`group relative bg-white dark:bg-zinc-900 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between h-full ${
        isSelectMode ? 'cursor-pointer select-none' : ''
      } ${
        isDragging
          ? 'opacity-40 scale-95 border-dashed border-slate-400 dark:border-zinc-600'
          : isDraggedOver 
            ? 'border-slate-900 dark:border-white scale-[1.02] shadow-lg' 
            : isSelected
              ? 'border-slate-800 dark:border-slate-200 ring-1 ring-slate-800 dark:ring-slate-200 bg-slate-50/50 dark:bg-zinc-800/20'
              : 'border-slate-200 dark:border-zinc-800 dark:hover:border-zinc-700'
      }`}
      draggable={!isSelectMode && isDragEnabled}
      onDragStart={handleDragStartInternal}
      onDragOver={isSelectMode ? undefined : onDragOver}
      onDragEnter={isSelectMode ? undefined : () => onDragEnter?.(product.id)}
      onDrop={isSelectMode ? undefined : (e) => onDrop(e, product.id)}
      onDragEnd={isSelectMode ? undefined : handleDragEndInternal}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUpOrLeave}
      onPointerLeave={handlePointerUpOrLeave}
    >
      {isSelectMode && (
        <div className="absolute top-4 right-4 z-10">
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm ${
            isSelected 
              ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white' 
              : 'bg-white border-slate-300 dark:bg-zinc-900 dark:border-zinc-600'
          }`}>
            {isSelected && <Check size={14} className="text-white dark:text-zinc-900" strokeWidth={3} />}
          </div>
        </div>
      )}

      {!isSelectMode && (
        <div 
          className="absolute top-2 right-2 z-20"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <div className={`transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md cursor-pointer`}>
                <Hamburger toggled={isMenuOpen} toggle={setIsMenuOpen} size={20} />
              </div>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-[160px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl p-1.5 flex flex-col gap-1">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger 
                  disabled={availableCollections.length === 0}
                  className="cursor-pointer"
                >
                  <FolderInput />
                  <span>Move to...</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent
                    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 min-w-[180px]"
                  >
                    <DropdownMenuLabel className="font-bold text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider px-2 py-1.5">
                      Move to
                    </DropdownMenuLabel>
                    {availableCollections.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-slate-400 dark:text-zinc-500">No other collections</div>
                    ) : (
                      <DropdownMenuGroup>
                        {availableCollections.map(col => (
                          <DropdownMenuItem
                            key={col.id}
                            onClick={() => {
                              onMove(product.id, col.id);
                              setIsMenuOpen(false);
                            }}
                            className="cursor-pointer text-sm text-slate-700 dark:text-zinc-300 flex items-center gap-2"
                          >
                            {React.createElement(getCollectionIcon(col.name), { size: 14, className: 'text-slate-400 dark:text-zinc-500 shrink-0' })}
                            {col.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              
              <DropdownMenuItem
                onClick={() => { onEdit(product); setIsMenuOpen(false); }}
                className="cursor-pointer text-slate-700 dark:text-zinc-300"
              >
                <Pencil className="text-slate-400 dark:text-zinc-500" />
                Edit
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={(e) => {
                  onDelete(product.id, product.name, e.currentTarget.getBoundingClientRect());
                  setIsMenuOpen(false);
                }}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/30 dark:focus:text-red-300"
              >
                <Trash2 className="text-red-500 dark:text-red-400" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}


      <div>
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 mb-3">
          {React.createElement(getCollectionIcon(product.category), { size: 12, className: 'mr-1.5 flex-shrink-0' })}
          {product.category}
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 leading-tight">
          {product.name}
        </h3>
        
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center text-sm text-slate-500 dark:text-zinc-400">
              <Calendar size={12} className="mr-1.5 shrink-0" />
              {purchaseDate}
            </div>

            {product.price !== undefined && (
              <div className="flex items-center text-sm text-slate-500 dark:text-zinc-400">
                <IndianRupee size={12} className="mr-1 shrink-0" />
                {product.price.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          {warrantyStatus && (() => {
            const isExpired = warrantyStatus === 'Warranty Expired';
            const isThisMonth = warrantyStatus === 'Expires this month';
            const isNextMonth = warrantyStatus === 'Expires in 1 Month';
            const isExpiringSoon = isThisMonth || isNextMonth;
            const colorClass = isExpired 
              ? 'text-red-500 dark:text-red-400' 
              : isExpiringSoon 
                ? 'text-amber-500 dark:text-amber-400' 
                : 'text-slate-600 dark:text-zinc-300';

            let displayText: string;
            if (isExpired) {
              displayText = `Warranty Expired in ${expiryDate}`;
            } else if (isThisMonth) {
              displayText = 'Warranty Expires This Month';
            } else if (isNextMonth) {
              displayText = 'Warranty Expires Next Month';
            } else {
              displayText = `Warranty Expires in ${expiryDate}`;
            }

            const ShieldIcon = isExpired ? ShieldX : isExpiringSoon ? ShieldAlert : ShieldCheck;

            return (
              <div className={`flex items-center text-sm ${colorClass}`}>
                <ShieldIcon size={12} className="mr-1.5 shrink-0" />
                {displayText}
              </div>
            );

          })()}



          {product.receipt && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center text-slate-500 dark:text-zinc-400">
                <FileText size={12} className="mr-1.5 shrink-0" />
                Receipt
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const base64Content = product.receipt!.split(',')[1];
                    const binary = atob(base64Content);
                    const array = [];
                    for (let i = 0; i < binary.length; i++) {
                      array.push(binary.charCodeAt(i));
                    }
                    const blob = new Blob([new Uint8Array(array)], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-colors"
                  title="View Receipt"
                >
                  <Eye size={14} />
                </button>
                <a
                  href={product.receipt}
                  download={`Receipt_${product.name.replace(/\s+/g, '_')}.pdf`}
                  className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-colors flex items-center justify-center"
                  title="Download Receipt"
                >
                  <Download size={14} />
                </a>
                <button
                  onClick={() => onDeleteReceipt(product.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                  title="Remove Receipt"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-end justify-between">
        <div className="min-w-0 pr-3">
          <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            Current Age
          </p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-zinc-100 tracking-tight truncate whitespace-nowrap">
            {age}
          </p>
        </div>
        <div
          onMouseDown={handleGripMouseDown}
          onMouseUp={() => setIsDragEnabled(false)}
          onPointerDown={(e) => e.stopPropagation()}
          className={`transition-opacity ${isDragEnabled ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-grab active:cursor-grabbing rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 mb-1`}
          title="Drag to Reorder"
        >
          <GripHorizontal size={18} />
        </div>
      </div>
    </div>
  );
};