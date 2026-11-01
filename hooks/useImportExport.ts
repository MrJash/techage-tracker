import React from 'react';
import { Collection, MONTHS } from '../types';
import { calculateWarrantyStatus } from '../utils/dateHelpers';

export function useImportExport(
    collections: Collection[],
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>,
    setFilterCategories: React.Dispatch<React.SetStateAction<string[]>>,
    setActiveCollectionId: React.Dispatch<React.SetStateAction<string>>,
    setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>,
    onProcessImport?: (importedCollections: Collection[]) => void
) {
    const handleExportData = () => {
        const dataStr = JSON.stringify(collections, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `tech-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportCSV = () => {
        const escapeCsvCell = (val: any): string => {
            if (val === null || val === undefined) return '';
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const headers = [
            'Collection',
            'Product Name',
            'Category',
            'Price',
            'Currency',
            'Purchase Month',
            'Purchase Year',
            'Purchase Date',
            'Warranty (Years)',
            'Warranty Status',
            'Condition',
            'Tags',
            'Has Receipt'
        ];

        const rows: string[][] = [headers];

        collections.forEach(col => {
            (col.products || []).forEach(p => {
                const monthName = MONTHS[p.purchaseMonth] || '';
                const purchaseDate = `${monthName} ${p.purchaseYear}`.trim();
                const warrantyStatus = calculateWarrantyStatus(p.purchaseMonth, p.purchaseYear, p.warrantyYears);
                const tagsStr = (p.tags || []).join('; ');
                const hasReceipt = p.receipt ? 'Yes' : 'No';

                rows.push([
                    col.name,
                    p.name,
                    p.category,
                    p.price !== undefined && p.price !== null ? String(p.price) : '',
                    p.currency || 'USD',
                    monthName,
                    String(p.purchaseYear),
                    purchaseDate,
                    p.warrantyYears !== undefined && p.warrantyYears !== null ? String(p.warrantyYears) : '',
                    warrantyStatus || '',
                    p.condition || '',
                    tagsStr,
                    hasReceipt
                ]);
            });
        });

        // Add UTF-8 BOM so Excel opens non-ASCII characters correctly
        const csvContent = '\uFEFF' + rows.map(r => r.map(escapeCsvCell).join(',')).join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tech-tracker-inventory-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                let parsed = JSON.parse(content);

                // Normalize single object vs array
                if (!Array.isArray(parsed) && typeof parsed === 'object' && parsed !== null && 'products' in parsed) {
                    parsed = [parsed];
                }

                if (Array.isArray(parsed) && parsed.length > 0) {
                    if (onProcessImport) {
                        onProcessImport(parsed);
                    } else {
                        if (window.confirm("Overwrite current data with this backup?")) {
                            setFilterCategories([]);
                            setCollections(parsed);
                            if (parsed[0].id) {
                                setActiveCollectionId(parsed[0].id);
                            }
                            setIsMobileMenuOpen(false);
                        }
                    }
                } else {
                    alert('Invalid backup file structure.');
                }
            } catch (err) {
                console.error('Import failed:', err);
                alert('Failed to read backup file. Make sure it is a valid JSON exported from this app.');
            } finally {
                input.value = '';
            }
        };
        reader.readAsText(file);
    };

    return {
        handleExportData,
        handleExportCSV,
        handleImportData
    };
}
