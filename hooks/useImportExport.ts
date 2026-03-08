import React from 'react';
import { Collection } from '../types';

export function useImportExport(
    collections: Collection[],
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>,
    setFilterCategories: React.Dispatch<React.SetStateAction<string[]>>,
    setActiveCollectionId: React.Dispatch<React.SetStateAction<string>>,
    setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
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
                    if (window.confirm("Overwrite current data with this backup?")) {
                        setFilterCategories([]);

                        setCollections(parsed);

                        if (parsed[0].id) {
                            setActiveCollectionId(parsed[0].id);
                        }


                        setIsMobileMenuOpen(false);
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
        handleImportData
    };
}
