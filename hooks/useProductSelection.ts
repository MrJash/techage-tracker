import { useState, useEffect } from 'react';
import { Collection, Product } from '../types';
import { deleteReceiptFromFirestore } from '../lib/firestoreService';

export function useProductSelection(
  collections: Collection[],
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>,
  userId?: string
) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Cancel selection on Escape key
  useEffect(() => {
    if (!isSelectMode) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSelectMode(false);
        setSelectedProductIds([]);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isSelectMode]);

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleLongPress = (id: string) => {
    setIsSelectMode(true);
    setSelectedProductIds([id]);
  };

  const handleBatchDelete = () => {
    if (!window.confirm(`Delete ${selectedProductIds.length} items?`)) return;
    if (userId) {
      selectedProductIds.forEach(id => {
        deleteReceiptFromFirestore(userId, id).catch(() => {});
      });
    }
    setCollections(prev => prev.map(col => ({
      ...col,
      products: col.products.filter(p => !selectedProductIds.includes(p.id))
    })));
    setIsSelectMode(false);
    setSelectedProductIds([]);
  };

  const handleBatchMove = (targetCollectionId: string) => {
    let productsToMove: Product[] = [];
    
    // Remove from all collections
    const removedCollections = collections.map(col => {
      const remaining = col.products.filter(p => !selectedProductIds.includes(p.id));
      const removed = col.products.filter(p => selectedProductIds.includes(p.id));
      productsToMove = [...productsToMove, ...removed];
      return { ...col, products: remaining };
    });

    // Add to target collection
    const finalCollections = removedCollections.map(col => {
      if (col.id === targetCollectionId) {
        return { ...col, products: [...col.products, ...productsToMove] };
      }
      return col;
    });

    setCollections(finalCollections);
    setIsSelectMode(false);
    setSelectedProductIds([]);
  };

  const clearSelection = () => {
    setIsSelectMode(false);
    setSelectedProductIds([]);
  };

  return {
    isSelectMode,
    setIsSelectMode,
    selectedProductIds,
    setSelectedProductIds,
    toggleSelectProduct,
    handleLongPress,
    handleBatchDelete,
    handleBatchMove,
    clearSelection,
  };
}
