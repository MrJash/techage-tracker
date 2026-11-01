import { Collection, Product, MONTHS } from '../types';
import { CurrencyCode, formatPrice as formatCurrencyPrice } from './currency';

export interface ProductFieldChange {
  field: string;
  oldValue: string;
  newValue: string;
}

export interface ProductDiffItem {
  type: 'added' | 'removed' | 'modified';
  product: Product;
  changes?: ProductFieldChange[];
}

export interface CollectionDiffItem {
  id: string;
  name: string;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  oldName?: string;
  productDiffs: ProductDiffItem[];
}

export interface ImportDiffResult {
  hasDifference: boolean;
  cloudCollectionsCount: number;
  importedCollectionsCount: number;
  cloudProductsCount: number;
  importedProductsCount: number;
  addedProductsCount: number;
  removedProductsCount: number;
  modifiedProductsCount: number;
  collections: CollectionDiffItem[];
}

function formatPrice(val?: number, currencyCode: CurrencyCode = 'INR'): string {
  if (val === undefined || val === null || isNaN(val)) return 'None';
  return formatCurrencyPrice(val, currencyCode);
}

function formatDate(month: number, year: number): string {
  const m = MONTHS[month] || `Month ${month}`;
  return `${m} ${year}`;
}

function formatWarranty(val?: number): string {
  if (val === undefined || val === null || isNaN(val) || val === 0) return 'None';
  return `${val} yr${val > 1 ? 's' : ''}`;
}

export function compareCollections(
  cloudCollections: Collection[],
  importedCollections: Collection[],
  currencyCode: CurrencyCode = 'USD'
): ImportDiffResult {
  const cloudCols = cloudCollections || [];
  const importedCols = importedCollections || [];

  let totalCloudProducts = 0;
  cloudCols.forEach(c => totalCloudProducts += (c.products?.length || 0));

  let totalImportedProducts = 0;
  importedCols.forEach(c => totalImportedProducts += (c.products?.length || 0));

  let addedProductsCount = 0;
  let removedProductsCount = 0;
  let modifiedProductsCount = 0;

  const resultCollections: CollectionDiffItem[] = [];

  // 1. Process imported collections against cloud
  importedCols.forEach(importedCol => {
    const cloudCol = cloudCols.find(c => c.id === importedCol.id) ||
                     cloudCols.find(c => c.name.toLowerCase() === importedCol.name.toLowerCase());

    if (!cloudCol) {
      // Entire collection is newly added in imported
      const productDiffs: ProductDiffItem[] = (importedCol.products || []).map(p => {
        addedProductsCount++;
        return {
          type: 'added',
          product: p,
        };
      });

      resultCollections.push({
        id: importedCol.id,
        name: importedCol.name,
        type: 'added',
        productDiffs,
      });
      return;
    }

    // Collection exists in both — compare products
    const productDiffs: ProductDiffItem[] = [];
    const cloudProducts = cloudCol.products || [];
    const importedProducts = importedCol.products || [];

    // Check for added or modified products
    importedProducts.forEach(impProd => {
      const cloudProd = cloudProducts.find(cp => cp.id === impProd.id) ||
                        cloudProducts.find(cp => cp.name.toLowerCase() === impProd.name.toLowerCase() && cp.createdAt === impProd.createdAt);

      if (!cloudProd) {
        addedProductsCount++;
        productDiffs.push({
          type: 'added',
          product: impProd,
        });
        return;
      }

      // Check field differences
      const changes: ProductFieldChange[] = [];

      if (impProd.name !== cloudProd.name) {
        changes.push({
          field: 'Name',
          oldValue: cloudProd.name,
          newValue: impProd.name,
        });
      }

      if (impProd.category !== cloudProd.category) {
        changes.push({
          field: 'Category',
          oldValue: cloudProd.category || 'None',
          newValue: impProd.category || 'None',
        });
      }

      const impPrice = impProd.price ?? undefined;
      const cloudPrice = cloudProd.price ?? undefined;
      if (impPrice !== cloudPrice) {
        changes.push({
          field: 'Price',
          oldValue: formatPrice(cloudPrice, currencyCode),
          newValue: formatPrice(impPrice, currencyCode),
        });
      }

      const impCond = impProd.condition || undefined;
      const cloudCond = cloudProd.condition || undefined;
      if (impCond !== cloudCond) {
        changes.push({
          field: 'Condition',
          oldValue: cloudCond || 'Unspecified',
          newValue: impCond || 'Unspecified',
        });
      }

      if (impProd.purchaseMonth !== cloudProd.purchaseMonth || impProd.purchaseYear !== cloudProd.purchaseYear) {
        changes.push({
          field: 'Purchase Date',
          oldValue: formatDate(cloudProd.purchaseMonth, cloudProd.purchaseYear),
          newValue: formatDate(impProd.purchaseMonth, impProd.purchaseYear),
        });
      }

      const impWarranty = impProd.warrantyYears ?? undefined;
      const cloudWarranty = cloudProd.warrantyYears ?? undefined;
      if (impWarranty !== cloudWarranty) {
        changes.push({
          field: 'Warranty',
          oldValue: formatWarranty(cloudWarranty),
          newValue: formatWarranty(impWarranty),
        });
      }

      const impTags = (impProd.tags || []).join(', ');
      const cloudTags = (cloudProd.tags || []).join(', ');
      if (impTags !== cloudTags) {
        changes.push({
          field: 'Tags',
          oldValue: cloudTags || 'None',
          newValue: impTags || 'None',
        });
      }

      if (changes.length > 0) {
        modifiedProductsCount++;
        productDiffs.push({
          type: 'modified',
          product: impProd,
          changes,
        });
      }
    });

    // Check for removed products (exist in cloud, missing from imported)
    cloudProducts.forEach(cloudProd => {
      const existsInImported = importedProducts.some(
        ip => ip.id === cloudProd.id || (ip.name.toLowerCase() === cloudProd.name.toLowerCase() && ip.createdAt === cloudProd.createdAt)
      );

      if (!existsInImported) {
        removedProductsCount++;
        productDiffs.push({
          type: 'removed',
          product: cloudProd,
        });
      }
    });

    const nameChanged = cloudCol.name !== importedCol.name;
    const colType = nameChanged
      ? 'modified'
      : productDiffs.length > 0
      ? 'modified'
      : 'unchanged';

    resultCollections.push({
      id: importedCol.id,
      name: importedCol.name,
      oldName: nameChanged ? cloudCol.name : undefined,
      type: colType,
      productDiffs,
    });
  });

  // 2. Check for collections in cloud that are completely missing in imported
  cloudCols.forEach(cloudCol => {
    const existsInImported = importedCols.some(
      ic => ic.id === cloudCol.id || ic.name.toLowerCase() === cloudCol.name.toLowerCase()
    );

    if (!existsInImported) {
      const productDiffs: ProductDiffItem[] = (cloudCol.products || []).map(p => {
        removedProductsCount++;
        return {
          type: 'removed',
          product: p,
        };
      });

      resultCollections.push({
        id: cloudCol.id,
        name: cloudCol.name,
        type: 'removed',
        productDiffs,
      });
    }
  });

  const hasDifference =
    addedProductsCount > 0 ||
    removedProductsCount > 0 ||
    modifiedProductsCount > 0 ||
    resultCollections.some(c => c.type !== 'unchanged');

  return {
    hasDifference,
    cloudCollectionsCount: cloudCols.length,
    importedCollectionsCount: importedCols.length,
    cloudProductsCount: totalCloudProducts,
    importedProductsCount: totalImportedProducts,
    addedProductsCount,
    removedProductsCount,
    modifiedProductsCount,
    collections: resultCollections,
  };
}
