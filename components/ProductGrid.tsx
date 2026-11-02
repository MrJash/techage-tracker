import React from 'react';
import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';
import { Product, Collection } from '../types';
import { CurrencyCode } from '../utils/currency';
import { AgeFormat } from '../utils/dateHelpers';
import { TagColorId } from '../utils/tagColors';

export interface ProductGridProps {
  products: Product[];
  activeCollectionId: string;
  collections: Collection[];
  currency: CurrencyCode;
  ageFormat: AgeFormat;
  tagColors: Record<string, TagColorId>;
  highlightedProductId: string | null;
  dragOverProductId: string | null;
  isSelectMode: boolean;
  selectedProductIds: string[];
  onOpenAddModal: () => void;
  onOpenEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onDeleteReceipt: (productId: string) => void;
  onMoveProduct: (productId: string, targetCollectionId: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (id: string) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onToggleSelect: (id: string) => void;
  onLongPress: (id: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  activeCollectionId,
  collections,
  currency,
  ageFormat,
  tagColors,
  highlightedProductId,
  dragOverProductId,
  isSelectMode,
  selectedProductIds,
  onOpenAddModal,
  onOpenEditProduct,
  onDeleteProduct,
  onDeleteReceipt,
  onMoveProduct,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDrop,
  onDragEnd,
  onToggleSelect,
  onLongPress,
}) => {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth custom-scrollbar" data-tour="inventory-area">
      <div className="max-w-[1600px] w-full mx-auto space-y-6">
        {products.length === 0 ? (
          <EmptyState onAdd={onOpenAddModal} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 pb-24">
            {products.map((product) => (
              <div 
                key={product.id}
                id={`product-${product.id}`}
                onDragOver={onDragOver}
                className="relative"
              >
                <ProductCard
                  product={product}
                  onEdit={onOpenEditProduct}
                  onDelete={onDeleteProduct}
                  onDeleteReceipt={onDeleteReceipt}
                  onMove={onMoveProduct}
                  availableCollections={collections.filter(c => c.id !== activeCollectionId)}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDragEnter={() => onDragEnter(product.id)}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  isDraggedOver={dragOverProductId === product.id}
                  isSelectMode={isSelectMode}
                  isSelected={selectedProductIds.includes(product.id)}
                  onToggleSelect={onToggleSelect}
                  onLongPress={onLongPress}
                  currency={currency}
                  isHighlighted={highlightedProductId === product.id}
                  tagColors={tagColors}
                  ageFormat={ageFormat}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
