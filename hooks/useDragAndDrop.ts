import React, { useState } from 'react';
import { Collection } from '../types';

export function useDragAndDrop(
    collections: Collection[],
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>,
    activeCollectionId: string
) {
    const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
    const [dragOverProductId, setDragOverProductId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, productId: string) => {
        setDraggedProductId(productId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (productId: string) => {
        if (productId !== draggedProductId) {
            setDragOverProductId(productId);
        }
    };

    const handleDrop = (e: React.DragEvent, targetProductId: string) => {
        e.preventDefault();
        if (!draggedProductId || draggedProductId === targetProductId) {
            setDragOverProductId(null);
            return;
        }

        const updatedCollections = collections.map(col => {
            if (col.id === activeCollectionId) {
                const products = [...col.products];
                const fromIndex = products.findIndex(p => p.id === draggedProductId);
                const toIndex = products.findIndex(p => p.id === targetProductId);

                if (fromIndex === -1 || toIndex === -1) return col;

                const [movedProduct] = products.splice(fromIndex, 1);
                products.splice(toIndex, 0, movedProduct);

                return { ...col, products, hasCustomOrder: true, sortOrder: 'custom' };
            }
            return col;
        });

        setCollections(updatedCollections);
        setDraggedProductId(null);
        setDragOverProductId(null);
    };

    const handleDragEnd = (_e: React.DragEvent) => {
        setDraggedProductId(null);
        setDragOverProductId(null);
    };

    return {
        draggedProductId,
        dragOverProductId,
        handleDragStart,
        handleDragOver,
        handleDragEnter,
        handleDrop,
        handleDragEnd,
    };
}
