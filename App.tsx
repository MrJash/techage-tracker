import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sidebar, getCollectionIcon } from './components/Sidebar';
import { ProductCard } from './components/ProductCard';
import { EmptyState } from './components/EmptyState';
import { Modal } from './components/Modal';
import { Button } from './components/ui/button';
import { Select } from './components/Select';
import { SortDropdown } from './components/SortDropdown';
import { MultiSelect } from './components/MultiSelect';
import { ProductForm } from './components/ProductForm';
import { AnimatedThemeToggler } from './components/ui/animated-theme-toggler';
import { Collection, Product, MONTHS, CATEGORIES, CONDITIONS } from './types';
import { generateId, calculateWarrantyStatus } from './utils/dateHelpers';
import { Toast } from './components/Toast';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useImportExport } from './hooks/useImportExport';
import { ImportDiffModal } from './components/ImportDiffModal';
import { compareCollections, ImportDiffResult } from './utils/diffHelpers';
import { useAuth } from './hooks/useAuth';
import { loadCollectionsFromFirestore, saveCollectionsToFirestore, deleteReceiptFromFirestore, clearReceiptSyncCache, loadUserPreferencesFromFirestore, saveUserPreferencesToFirestore, UserPreferences } from './lib/firestoreService';

import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from './components/AlertDialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from './components/ui/dropdown-menu';

import { Plus, Menu, CloudUpload, Sun, Moon, Filter, ArrowUpDown, Upload, X, Eye, Download, Save, ListChecks, XSquare, Trash2, FolderInput, Sparkles, ThumbsUp, AlertTriangle, AlertOctagon, Search, Command, Settings } from 'lucide-react';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SettingsModal, ThemeMode } from './components/SettingsModal';
import { CurrencyCode, DEFAULT_CURRENCY, formatPrice, SUPPORTED_CURRENCIES } from './utils/currency';
import { AgeFormat } from './utils/dateHelpers';
import { 
  getLocalTagColors, 
  saveLocalTagColors, 
  TagColorId, 
  getTagDotColor 
} from './utils/tagColors';

const STORAGE_KEY = 'tech_tracker_data';
const THEME_KEY = 'tech_tracker_theme';
const CURRENCY_KEY = 'tech_tracker_currency';
const AGE_FORMAT_KEY = 'techage_pref_age_format';
const DEFAULT_WARRANTY_KEY = 'techage_pref_default_warranty';
const DEFAULT_COLLECTION_PREF_KEY = 'techage_pref_default_collection';
const LAST_ACTIVE_COLLECTION_KEY = 'techage_last_active_collection';

// Default initial state
const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: 'default',
    name: 'My Electronics',
    products: []
  }
];

const EMPTY_FORM = {
  name: '',
  category: CATEGORIES[0],
  purchaseMonth: new Date().getMonth(),
  purchaseYear: new Date().getFullYear(),
  price: '',
  currency: DEFAULT_CURRENCY,
  warrantyYears: '',
  receipt: '',
  condition: '',
  tags: [] as string[]
};

export default function App() {
  // -- Auth --
  const { user, loading: authLoading, authError, signIn, signOut } = useAuth();

  // -- State --
  
  // Lazy initialization for state
  const [collections, setCollections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    return DEFAULT_COLLECTIONS;
  });

  const [activeCollectionId, setActiveCollectionId] = useState<string>(() => {
    const pref = localStorage.getItem(DEFAULT_COLLECTION_PREF_KEY) || 'last-active';
    const lastActive = localStorage.getItem(LAST_ACTIVE_COLLECTION_KEY);
    const saved = localStorage.getItem(STORAGE_KEY);
    let parsedCols: Collection[] = DEFAULT_COLLECTIONS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) parsedCols = parsed;
      } catch (e) {}
    }

    if (pref === 'last-active' && lastActive && parsedCols.some(c => c.id === lastActive)) {
      return lastActive;
    }
    if (pref !== 'last-active' && parsedCols.some(c => c.id === pref)) {
      return pref;
    }
    return parsedCols[0]?.id || 'default';
  });

  const handleSelectCollection = (id: string) => {
    setActiveCollectionId(id);
    localStorage.setItem(LAST_ACTIVE_COLLECTION_KEY, id);
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme Mode (system / light / dark)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem(THEME_KEY) as ThemeMode) || 'system';
  });

  const applyThemeMode = (mode: ThemeMode) => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else if (mode === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      // system
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDarkMode(false);
      }
    }
  };

  // Full Preferences Helper for Cloud Firestore Sync
  const getFullPreferences = (overrides?: Partial<UserPreferences>): UserPreferences => ({
    defaultCurrency: currency,
    ageFormat,
    defaultWarranty,
    defaultOpeningCollection,
    themeMode,
    tagColors,
    ...overrides,
  });

  const savePreferencesToCloud = (partialPrefs: Partial<UserPreferences>) => {
    if (!user) return;
    const fullPrefs = getFullPreferences(partialPrefs);
    saveUserPreferencesToFirestore(user.uid, fullPrefs).catch(err => {
      console.warn('Failed to sync preferences to Firestore:', err);
    });
  };

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem(THEME_KEY, mode);
    applyThemeMode(mode);
    savePreferencesToCloud({ themeMode: mode });
  };

  // Age Display Format Preference
  const [ageFormat, setAgeFormat] = useState<AgeFormat>(() => {
    return (localStorage.getItem(AGE_FORMAT_KEY) as AgeFormat) || 'detailed';
  });

  const handleAgeFormatChange = (format: AgeFormat) => {
    setAgeFormat(format);
    localStorage.setItem(AGE_FORMAT_KEY, format);
    savePreferencesToCloud({ ageFormat: format });
  };

  // Default Warranty Duration Preference (years)
  const [defaultWarranty, setDefaultWarranty] = useState<number>(() => {
    const saved = localStorage.getItem(DEFAULT_WARRANTY_KEY);
    return saved !== null ? Number(saved) : 1;
  });

  const handleDefaultWarrantyChange = (years: number) => {
    setDefaultWarranty(years);
    localStorage.setItem(DEFAULT_WARRANTY_KEY, years.toString());
    savePreferencesToCloud({ defaultWarranty: years });
  };

  // Default Opening Collection Preference
  const [defaultOpeningCollection, setDefaultOpeningCollection] = useState<string>(() => {
    return localStorage.getItem(DEFAULT_COLLECTION_PREF_KEY) || 'last-active';
  });

  const handleDefaultOpeningCollectionChange = (val: string) => {
    setDefaultOpeningCollection(val);
    localStorage.setItem(DEFAULT_COLLECTION_PREF_KEY, val);
    savePreferencesToCloud({ defaultOpeningCollection: val });
  };

  // Currency state
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(CURRENCY_KEY);
    return (saved as CurrencyCode) || DEFAULT_CURRENCY;
  });

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    localStorage.setItem(CURRENCY_KEY, newCurrency);
    savePreferencesToCloud({ defaultCurrency: newCurrency });
  };

  // Tag Colors state
  const [tagColors, setTagColors] = useState<Record<string, TagColorId>>(() => getLocalTagColors());

  const handleSetTagColor = (tagName: string, colorId: TagColorId) => {
    const updated = { ...tagColors, [tagName.toLowerCase()]: colorId };
    setTagColors(updated);
    saveLocalTagColors(updated);
    savePreferencesToCloud({ tagColors: updated });
  };

  // Settings Modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // General Toast message state
  const [generalToastMessage, setGeneralToastMessage] = useState<string | null>(null);

  // Local storage footprint calculation
  const { totalReceiptsCount, totalReceiptsBytes } = useMemo(() => {
    let count = 0;
    let bytes = 0;
    collections.forEach(col => {
      (col.products || []).forEach(p => {
        if (p.receipt) {
          count++;
          bytes += p.receipt.length;
        }
      });
    });
    return { totalReceiptsCount: count, totalReceiptsBytes: bytes };
  }, [collections]);

  // Cloud Resync / Clear Local Cache handler
  const handleCloudResync = async () => {
    if (!user) {
      setGeneralToastMessage('Sign in with Google required to resync from Cloud');
      return;
    }
    setIsSyncing(true);
    clearReceiptSyncCache();
    try {
      const cloudCols = await loadCollectionsFromFirestore(user.uid);
      if (cloudCols && cloudCols.length > 0) {
        setCollections(cloudCols);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudCols));
        setGeneralToastMessage('Successfully refreshed and synced from Cloud Firestore');
      } else {
        setGeneralToastMessage('No cloud backup found for this account');
      }
    } catch (err) {
      setGeneralToastMessage('Failed to resync from Cloud Firestore');
    } finally {
      setIsSyncing(false);
    }
  };

  // Danger Zone: Reset All Workspace Data handler
  const handleResetAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_ACTIVE_COLLECTION_KEY);
      localStorage.removeItem('techage_tag_colors');
      clearReceiptSyncCache();
      setCollections(DEFAULT_COLLECTIONS);
      setActiveCollectionId('default');
      setSelectedProductIds([]);
      setIsSelectMode(false);
      setIsSettingsOpen(false);
      setGeneralToastMessage('Workspace and local storage have been reset');
    } catch (err) {
      console.error('Failed to reset local data:', err);
    }
  };

  // Global Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);

  // Global shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectProductFromSearch = (collectionId: string, productId: string) => {
    setActiveCollectionId(collectionId);
    setIsSearchOpen(false);
    setHighlightedProductId(productId);

    setTimeout(() => {
      const el = document.getElementById(`product-${productId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    setTimeout(() => {
      setHighlightedProductId(prev => (prev === productId ? null : prev));
    }, 2500);
  };

  // Cloud sync state
  const [cloudSyncReady, setCloudSyncReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [hasLocalImportPendingSync, setHasLocalImportPendingSync] = useState<boolean>(() => {
    return localStorage.getItem('tech_tracker_pending_sync') === 'true';
  });
  const [importDiffData, setImportDiffData] = useState<{ diff: ImportDiffResult; importedCollections: Collection[] } | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  // Keep a ref to current collections to avoid stale closures in effects
  const collectionsRef = useRef(collections);
  useEffect(() => { collectionsRef.current = collections; }, [collections]);

  // Edit product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filter & Sort State
  const [filterCategories, setFilterCategories] = useState<string[]>([]);


  // Drag & Drop State via custom hook
  const { 
    draggedProductId, 
    dragOverProductId, 
    handleDragStart, 
    handleDragEnter, 
    handleDragOver, 
    handleDrop, 
    handleDragEnd 
  } = useDragAndDrop(collections, setCollections, activeCollectionId);

  // Import Export State via custom hook
  const { handleExportData, handleExportCSV, handleImportData } = useImportExport(
    collections, 
    setCollections, 
    setFilterCategories, 
    setActiveCollectionId, 
    setIsMobileMenuOpen,
    (importedData) => handleProcessImport(importedData)
  );
  
  // -- Form State --
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deletedProductInfo, setDeletedProductInfo] = useState<{ 
    product: Product; 
    collectionId: string; 
    index: number; 
  } | null>(null);

  // Multi-Select State
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
    if (user) {
      selectedProductIds.forEach(id => {
        deleteReceiptFromFirestore(user.uid, id).catch(() => {});
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



  // -- Effects --

  // Apply theme mode & listen to system changes
  useEffect(() => {
    applyThemeMode(themeMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      const currentMode = localStorage.getItem(THEME_KEY) as ThemeMode;
      if (!currentMode || currentMode === 'system') {
        if (e.matches) {
          document.documentElement.classList.add('dark');
          setIsDarkMode(true);
        } else {
          document.documentElement.classList.remove('dark');
          setIsDarkMode(false);
        }
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [themeMode]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  }, [collections]);

  // Load from Firestore when user logs in
  useEffect(() => {
    if (!user) {
      setCloudSyncReady(false);
      clearReceiptSyncCache();
      return;
    }
    setIsSyncing(true);
    setSyncError(null);
    // Load cloud collections and all preferences
    loadUserPreferencesFromFirestore(user.uid).then(prefs => {
      if (!prefs) return;
      if (prefs.defaultCurrency && SUPPORTED_CURRENCIES.some(c => c.code === prefs.defaultCurrency)) {
        setCurrency(prefs.defaultCurrency as CurrencyCode);
        localStorage.setItem(CURRENCY_KEY, prefs.defaultCurrency);
      }
      if (prefs.ageFormat) {
        setAgeFormat(prefs.ageFormat as AgeFormat);
        localStorage.setItem(AGE_FORMAT_KEY, prefs.ageFormat);
      }
      if (prefs.defaultWarranty !== undefined) {
        setDefaultWarranty(prefs.defaultWarranty);
        localStorage.setItem(DEFAULT_WARRANTY_KEY, prefs.defaultWarranty.toString());
      }
      if (prefs.defaultOpeningCollection) {
        setDefaultOpeningCollection(prefs.defaultOpeningCollection);
        localStorage.setItem(DEFAULT_COLLECTION_PREF_KEY, prefs.defaultOpeningCollection);
      }
      if (prefs.themeMode) {
        setThemeMode(prefs.themeMode as ThemeMode);
        localStorage.setItem(THEME_KEY, prefs.themeMode);
        applyThemeMode(prefs.themeMode as ThemeMode);
      }
      if (prefs.tagColors && typeof prefs.tagColors === 'object') {
        setTagColors(prefs.tagColors as Record<string, TagColorId>);
        saveLocalTagColors(prefs.tagColors as Record<string, TagColorId>);
      }
    }).catch(() => {});

    loadCollectionsFromFirestore(user.uid)
      .then(cloudData => {
        if (cloudData) {
          // If user chose to keep imported data local, don't overwrite it with cloud data on load
          if (hasLocalImportPendingSync) {
            return;
          }
          // Merge with local receipts so local PDFs are preserved
          const merged = cloudData.map(col => ({
            ...col,
            products: col.products.map(p => {
              const localCol = collectionsRef.current.find(c => c.id === col.id);
              const localProd = localCol?.products.find(lp => lp.id === p.id);
              if (!p.receipt && localProd?.receipt) {
                return { ...p, receipt: localProd.receipt };
              }
              return p;
            })
          }));
          setCollections(merged);
          
          // Respect default opening collection preference or last-active
          const preferredColId = localStorage.getItem(DEFAULT_COLLECTION_PREF_KEY) || 'last-active';
          const lastActiveColId = localStorage.getItem(LAST_ACTIVE_COLLECTION_KEY);

          if (preferredColId === 'last-active' && lastActiveColId && merged.some(c => c.id === lastActiveColId)) {
            setActiveCollectionId(lastActiveColId);
          } else if (preferredColId !== 'last-active' && merged.some(c => c.id === preferredColId)) {
            setActiveCollectionId(preferredColId);
          } else if (activeCollectionId && merged.some(c => c.id === activeCollectionId)) {
            // Keep current active collection if it exists in cloud data
            setActiveCollectionId(activeCollectionId);
          } else if (merged[0]?.id) {
            setActiveCollectionId(merged[0].id);
          }
        } else {
          // No cloud data yet — upload current local data with preferences
          saveCollectionsToFirestore(user.uid, collectionsRef.current, getFullPreferences()).catch(err => {
            console.error(err);
            setSyncError(err?.message || 'Initial sync failed');
          });
        }
      })
      .catch(err => {
        console.error('Failed to load collections from Firestore:', err);
        setSyncError(err?.message || 'Failed to load cloud data');
      })
      .finally(() => {
        setCloudSyncReady(true);
        setIsSyncing(false);
      });
  }, [user]);

  // Save to Firestore when collections or preferences change
  useEffect(() => {
    if (!cloudSyncReady || !user) return;
    if (hasLocalImportPendingSync) return; // Keep Local: Do not auto-push to cloud until user manually syncs!
    setIsSyncing(true);
    setSyncError(null);
    saveCollectionsToFirestore(user.uid, collections, getFullPreferences())
      .catch(err => {
        console.error('Firestore auto-save error:', err);
        setSyncError(err?.message || 'Auto-sync failed');
      })
      .finally(() => setIsSyncing(false));
  }, [collections, currency, ageFormat, defaultWarranty, defaultOpeningCollection, themeMode, tagColors, cloudSyncReady, user, hasLocalImportPendingSync]);

  // -- Import & Manual Sync Handlers --
  const handleProcessImport = async (importedData: Collection[]) => {
    if (!user) {
      if (window.confirm("Overwrite current data with this backup?")) {
        setFilterCategories([]);
        setCollections(importedData);
        if (importedData[0]?.id) {
          setActiveCollectionId(importedData[0].id);
        }
        setIsMobileMenuOpen(false);
      }
      return;
    }

    setIsSyncing(true);
    try {
      const cloudData = await loadCollectionsFromFirestore(user.uid);
      const diff = compareCollections(cloudData || [], importedData, currency);

      if (diff.hasDifference) {
        setImportDiffData({ diff, importedCollections: importedData });
        setIsMobileMenuOpen(false);
      } else {
        alert("Imported backup is identical to your cloud saved data. No changes detected.");
      }
    } catch (err: any) {
      console.error("Failed to compare imported data with cloud:", err);
      if (window.confirm("Could not reach cloud to verify differences. Overwrite local data with this backup?")) {
        setFilterCategories([]);
        setCollections(importedData);
        if (importedData[0]?.id) {
          setActiveCollectionId(importedData[0].id);
        }
        setIsMobileMenuOpen(false);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmOverrideCloud = async () => {
    if (!user || !importDiffData) return;
    setIsProcessingImport(true);
    setSyncError(null);
    try {
      const imported = importDiffData.importedCollections;
      // Preserve local receipts if imported data doesn't have them
      const mergedWithReceipts = imported.map(col => ({
        ...col,
        products: col.products.map(p => {
          const localCol = collectionsRef.current.find(c => c.id === col.id);
          const localProd = localCol?.products.find(lp => lp.id === p.id);
          if (!p.receipt && localProd?.receipt) {
            return { ...p, receipt: localProd.receipt };
          }
          return p;
        })
      }));

      await saveCollectionsToFirestore(user.uid, mergedWithReceipts, getFullPreferences());
      setCollections(mergedWithReceipts);
      if (mergedWithReceipts[0]?.id) {
        setActiveCollectionId(mergedWithReceipts[0].id);
      }
      setFilterCategories([]);
      setHasLocalImportPendingSync(false);
      localStorage.removeItem('tech_tracker_pending_sync');
      setImportDiffData(null);
    } catch (err: any) {
      console.error('Failed to override cloud data:', err);
      setSyncError(err?.message || 'Failed to override cloud data');
      alert('Failed to save to cloud: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsProcessingImport(false);
    }
  };

  const handleConfirmKeepLocal = () => {
    if (!importDiffData) return;
    const imported = importDiffData.importedCollections;
    setCollections(imported);
    if (imported[0]?.id) {
      setActiveCollectionId(imported[0].id);
    }
    setFilterCategories([]);
    setHasLocalImportPendingSync(true);
    localStorage.setItem('tech_tracker_pending_sync', 'true');
    setImportDiffData(null);
  };

  const handleManualSyncToFirebase = async () => {
    if (!user) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      await saveCollectionsToFirestore(user.uid, collections, getFullPreferences());
      setHasLocalImportPendingSync(false);
      localStorage.removeItem('tech_tracker_pending_sync');
    } catch (err: any) {
      console.error('Manual sync to Firebase failed:', err);
      setSyncError(err?.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  };

  // -- Computed --
  const activeCollection = collections.find(c => c.id === activeCollectionId) || collections[0];
  // Multi-currency valuation grouped by currency
  const valuationsByCurrency = useMemo(() => {
    if (!activeCollection) return {};
    const map: Record<string, number> = {};
    for (const p of activeCollection.products) {
      if (p.price && !isNaN(p.price) && p.price > 0) {
        const curr = p.currency || currency || DEFAULT_CURRENCY;
        map[curr] = (map[curr] || 0) + p.price;
      }
    }
    return map;
  }, [activeCollection, currency]);

  const valuationEntries = Object.entries(valuationsByCurrency);

  const allUniqueTags = useMemo(() => {
    const set = new Set<string>();
    collections.forEach(col => {
      (col.products || []).forEach(p => {
        p.tags?.forEach(t => {
          if (t && t.trim()) set.add(t.trim());
        });
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [collections]);

  const activeSortOrder = activeCollection?.sortOrder || 'newest';

  const filteredAndSortedProducts = useMemo(() => {
    if (!activeCollection) return [];
    
    let result = [...activeCollection.products];

    if (filterCategories.length > 0) {
      const selectedCategoryFilters = filterCategories.filter(f => CATEGORIES.includes(f));
      const selectedWarrantyFilters = filterCategories.filter(f => f.startsWith('warranty-'));
      const selectedTagFilters = filterCategories.filter(f => f.startsWith('tag:')).map(f => f.slice(4));

      // If category filters are selected, product must match at least one selected category
      if (selectedCategoryFilters.length > 0) {
        result = result.filter(p => selectedCategoryFilters.includes(p.category));
      }

      // If warranty filters are selected, product must match at least one selected warranty status
      if (selectedWarrantyFilters.length > 0) {
        result = result.filter(p => {
          const status = calculateWarrantyStatus(p.purchaseMonth, p.purchaseYear, p.warrantyYears);
          const isExpired = status === 'Warranty Expired';
          const hasWarrantyDefined = p.warrantyYears !== undefined && p.warrantyYears > 0;
          
          if (!hasWarrantyDefined) return false;

          const isUnderWarranty = !isExpired;
          
          if (selectedWarrantyFilters.includes('warranty-active') && isUnderWarranty) return true;
          if (selectedWarrantyFilters.includes('warranty-expired') && isExpired) return true;
          
          return false;
        });
      }

      // If tag filters are selected, product must match at least one selected tag
      if (selectedTagFilters.length > 0) {
        result = result.filter(p => p.tags && selectedTagFilters.some(t => p.tags!.includes(t)));
      }
    }

    if (activeSortOrder === 'custom') {
      // Keep the array order as-is (user's custom order)
      return result;
    }

    result.sort((a, b) => {
      const dateA = a.purchaseYear * 12 + a.purchaseMonth;
      const dateB = b.purchaseYear * 12 + b.purchaseMonth;
      if (activeSortOrder === 'oldest') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    return result;
  }, [activeCollection, filterCategories, activeSortOrder]);


  const currentYear = new Date().getFullYear();
  const startYear = 2000;
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
  
  const yearOptions = years.map(y => ({ label: y.toString(), value: y }));
  const monthOptions = MONTHS.map((m, i) => ({ label: m, value: i }));
  
  const filterOptions = [
    {
      label: 'Warranty',
      options: [
        { label: 'Under Warranty', value: 'warranty-active' },
        { label: 'Warranty Expired', value: 'warranty-expired' },
      ],
    },
    {
      label: 'Category',
      options: CATEGORIES.map(c => ({ label: c, value: c })),
    },
    ...(allUniqueTags.length > 0 ? [{
      label: 'Tags',
      options: allUniqueTags.map(t => ({ 
        label: `#${t}`, 
        value: `tag:${t}`,
        dotColor: getTagDotColor(tagColors[t.toLowerCase()]),
      })),
    }] : []),
  ];

  const categoryOptions = CATEGORIES.map(c => ({ label: c, value: c }));
  
  const conditionOptions = [
    { label: 'Mint', value: 'Mint', icon: Sparkles },
    { label: 'Fine', value: 'Fine', icon: Sparkles },
    { label: 'Good', value: 'Good', icon: ThumbsUp },
    { label: 'Poor', value: 'Poor', icon: AlertTriangle },
    { label: 'Critical', value: 'Critical', icon: AlertOctagon },
  ];

  const sortOptions = [
    { label: 'Custom Order', value: 'custom', disabled: !activeCollection?.hasCustomOrder },
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
  ];

  const handleSortChange = (newOrder: string) => {
    setCollections(prev => prev.map(col => 
      col.id === activeCollectionId ? { ...col, sortOrder: newOrder } : col
    ));
  };

  // -- Handlers --

  const handleAddCollection = (name: string) => {
    const newCollection: Collection = {
      id: generateId(),
      name,
      products: []
    };
    setCollections([...collections, newCollection]);
    setActiveCollectionId(newCollection.id);
  };

  const handleDeleteCollection = (id: string) => {
    const newCollections = collections.filter(c => c.id !== id);
    
    if (newCollections.length === 0) {
        const defaultCollection = {
          id: generateId(),
          name: 'My Electronics',
          products: []
        };
        setCollections([defaultCollection]);
        setActiveCollectionId(defaultCollection.id);
    } else {
        setCollections(newCollections);
        if (activeCollectionId === id) {
            setActiveCollectionId(newCollections[0].id);
        }
    }
  };

  const handleRenameCollection = (id: string, newName: string) => {
    setCollections(prev =>
      prev.map(col => col.id === id ? { ...col, name: newName } : col)
    );
  };

  const MAX_RECEIPT_SIZE_BYTES = 750 * 1024; // 750 KB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        e.target.value = '';
        return;
      }

      if (file.size > MAX_RECEIPT_SIZE_BYTES) {
        const sizeKb = (file.size / 1024).toFixed(0);
        alert(`Receipt file is too large (${sizeKb} KB). Maximum allowed receipt size is 750 KB to ensure fast and reliable cloud sync.`);
        e.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, receipt: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      ...EMPTY_FORM,
      currency: localStorage.getItem('tech_tracker_currency') || currency || DEFAULT_CURRENCY,
      warrantyYears: defaultWarranty > 0 ? defaultWarranty : undefined,
      tags: []
    });
    setIsAddModalOpen(true);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newProduct: Product = {
      id: generateId(),
      name: formData.name,
      category: formData.category,
      purchaseMonth: Number(formData.purchaseMonth),
      purchaseYear: Number(formData.purchaseYear),
      price: formData.price ? Number(formData.price) : undefined,
      currency: formData.currency || currency || DEFAULT_CURRENCY,
      warrantyYears: formData.warrantyYears !== '' ? Number(formData.warrantyYears) : undefined,
      receipt: formData.receipt || undefined,
      condition: formData.condition || undefined,
      tags: Array.isArray(formData.tags) && formData.tags.length > 0 ? formData.tags : undefined,
      createdAt: Date.now()
    };

    const updatedCollections = collections.map(col => {
      if (col.id === activeCollectionId) {
        return { ...col, products: [...col.products, newProduct] };
      }
      return col;
    });

    setCollections(updatedCollections);
    setIsAddModalOpen(false);
    setFormData(EMPTY_FORM);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      purchaseMonth: product.purchaseMonth,
      purchaseYear: product.purchaseYear,
      price: product.price?.toString() || '',
      currency: product.currency || currency || DEFAULT_CURRENCY,
      warrantyYears: product.warrantyYears !== undefined ? product.warrantyYears.toString() : '',
      receipt: product.receipt || '',
      condition: product.condition || '',
      tags: product.tags || []
    });
  };

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !editingProduct) return;

    const updatedCollections = collections.map(col => {
      if (col.id === activeCollectionId) {
        return {
          ...col,
          products: col.products.map(p =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: formData.name,
                  category: formData.category,
                  purchaseMonth: Number(formData.purchaseMonth),
                  purchaseYear: Number(formData.purchaseYear),
                  price: formData.price ? Number(formData.price) : undefined,
                  currency: formData.currency || p.currency || currency || DEFAULT_CURRENCY,
                  warrantyYears: formData.warrantyYears !== '' ? Number(formData.warrantyYears) : undefined,
                  receipt: formData.receipt || undefined,
                  condition: formData.condition || undefined,
                  tags: Array.isArray(formData.tags) && formData.tags.length > 0 ? formData.tags : undefined,
                }
              : p
          )
        };
      }
      return col;
    });

    setCollections(updatedCollections);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
  };

  const handleCloseEditModal = () => {
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
  };

  const handleDeleteReceipt = (productId: string) => {
    if (!window.confirm("Remove this receipt?")) return;

    if (user) {
      deleteReceiptFromFirestore(user.uid, productId).catch(err => {
        console.warn("Failed to delete receipt from Firestore:", err);
      });
    }

    const updatedCollections = collections.map(col => {
      if (col.id === activeCollectionId) {
        return {
          ...col,
          products: col.products.map(p =>
            p.id === productId ? { ...p, receipt: undefined } : p
          )
        };
      }
      return col;
    });
    setCollections(updatedCollections);
  };

  const handleMoveProduct = (productId: string, targetCollectionId: string) => {
    let productToMove: Product | undefined;
    
    // First find and remove the product from the current collection
    const removedCollections = collections.map(col => {
      if (col.id === activeCollectionId) {
        productToMove = col.products.find(p => p.id === productId);
        return {
          ...col,
          products: col.products.filter(p => p.id !== productId)
        };
      }
      return col;
    });

    if (!productToMove) return;

    // Then append it to the target collection
    const finalCollections = removedCollections.map(col => {
      if (col.id === targetCollectionId) {
        return {
          ...col,
          products: [...col.products, productToMove!]
        };
      }
      return col;
    });

    setCollections(finalCollections);
  };

  const handleDeleteProduct = (id: string, name: string, rect?: DOMRect) => {
    // Find the product and its location for undo
    let foundInfo: { product: Product; collectionId: string; index: number } | null = null;
    
    for (const col of collections) {
      const idx = col.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        foundInfo = { product: col.products[idx], collectionId: col.id, index: idx };
        break;
      }
    }

    if (!foundInfo) return;

    // Store for undo
    setDeletedProductInfo(foundInfo);

    // Remove immediately
    setCollections(prev => prev.map(col => {
      if (col.id === foundInfo!.collectionId) {
        return { ...col, products: col.products.filter(p => p.id !== id) };
      }
      return col;
    }));
  };

  const undoDelete = () => {
    if (!deletedProductInfo) return;

    const { product, collectionId, index } = deletedProductInfo;
    setCollections(prev => prev.map(col => {
      if (col.id === collectionId) {
        const newProducts = [...col.products];
        newProducts.splice(index, 0, product);
        return { ...col, products: newProducts };
      }
      return col;
    }));
    setDeletedProductInfo(null);
  };




  if (!activeCollection) {
    return <div className="flex items-center justify-center h-screen bg-white dark:bg-black text-slate-500">Loading...</div>;
  }



  return (
    <div className="flex h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-zinc-100 overflow-hidden transition-colors duration-200">
      <Sidebar 
        collections={collections}
        activeCollectionId={activeCollectionId}
        onSelectCollection={handleSelectCollection}
        onAddCollection={handleAddCollection}
        onDeleteCollection={handleDeleteCollection}
        onRenameCollection={handleRenameCollection}
        onExportData={handleExportData}
        onExportCSV={handleExportCSV}
        onImportData={handleImportData}
        isOpenMobile={isMobileMenuOpen}
        setIsOpenMobile={setIsMobileMenuOpen}
        user={user}
        onSignIn={signIn}
        onSignOut={signOut}
        isSyncing={isSyncing}
        authError={authError}
        hasPendingSync={hasLocalImportPendingSync}
        onManualSync={handleManualSyncToFirebase}
        syncError={syncError}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        {hasLocalImportPendingSync && user && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs text-amber-700 dark:text-amber-400 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="truncate">Imported data is kept local. Cloud save has not been updated yet.</span>
            </div>
            <Button
              size="sm"
              onClick={handleManualSyncToFirebase}
              disabled={isSyncing}
              className="h-6 text-[11px] bg-amber-600 hover:bg-amber-700 text-white gap-1 px-2.5 py-0 shrink-0"
            >
              <CloudUpload size={12} />
              {isSyncing ? 'Syncing...' : 'Sync to Firebase'}
            </Button>
          </div>
        )}
        <header className="bg-white dark:bg-black border-b border-slate-200 dark:border-zinc-800 shrink-0 transition-colors duration-200 h-auto md:h-20">
          {/* Mobile 2-line layout (< md:) */}
          <div className="md:hidden px-4 py-2.5 flex flex-col gap-2">
            {/* Top row: Hamburger on left, all action icons on right */}
            <div className="flex items-center justify-between">
              <button 
                type="button"
                className="shrink-0 p-2 -ml-1.5 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
                title="Open navigation menu"
                aria-label="Open navigation menu"
              >
                <Menu size={22} className="shrink-0" />
              </button>

              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
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
                      onClick={handleBatchDelete} 
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
                          className="h-9 w-9 shrink-0 border border-slate-200 dark:border-zinc-700"
                        >
                          <FolderInput size={15} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px] bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700">
                        <DropdownMenuLabel className="font-bold text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider px-2 py-1.5">
                          Move to
                        </DropdownMenuLabel>
                        <DropdownMenuGroup>
                          {collections.filter(c => c.id !== activeCollectionId).map(col => (
                            <DropdownMenuItem 
                              key={col.id} 
                              onClick={() => handleBatchMove(col.id)} 
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
                      className="h-9 w-9 border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shrink-0"
                      onClick={() => { setIsSelectMode(false); setSelectedProductIds([]); }}
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
                      className="h-9 w-9 border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 shrink-0"
                      onClick={() => { setIsSelectMode(true); }}
                      title="Select Items"
                    >
                      <ListChecks size={16} />
                    </Button>
                    <MultiSelect
                      value={filterCategories}
                      onChange={setFilterCategories}
                      options={filterOptions}
                      placeholder="Filter"
                      icon={Filter}
                      iconOnly={true}
                    />
                    <SortDropdown
                      value={activeSortOrder}
                      onChange={handleSortChange}
                      options={sortOptions}
                      iconOnly={true}
                    />
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center shrink-0"
                  title="Settings"
                  aria-label="Settings"
                >
                  <Settings size={18} />
                </button>

                <AnimatedThemeToggler 
                  onThemeToggle={(newMode) => handleThemeModeChange(newMode)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center shrink-0"
                />
              </div>
            </div>

            {/* Bottom row: Collection Name + Count on left, Valuation on right */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="min-w-0 pr-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate leading-tight">
                  {activeCollection.name}
                </h1>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  {activeCollection.products.length} Items
                </p>
              </div>

              {valuationEntries.length > 0 && (
                <div 
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/60 text-xs font-semibold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700"
                  title="Total Valuation of Collection"
                >
                  {valuationEntries.map(([currCode, sum], i) => (
                    <React.Fragment key={currCode}>
                      {i > 0 && <span className="text-slate-300 dark:text-zinc-600 font-normal">•</span>}
                      <span>{formatPrice(sum as number, currCode as CurrencyCode)}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop & Tablet 1-line layout (md: and above) */}
          <div className="hidden md:flex h-full px-6 items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
              <button 
                type="button"
                className="lg:hidden shrink-0 p-2 -ml-2 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
                title="Open navigation menu"
                aria-label="Open navigation menu"
              >
                <Menu size={22} className="shrink-0" />
              </button>
              <div className="min-w-0 truncate">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                  {activeCollection.name}
                </h1>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium truncate">
                  {activeCollection.products.length} Items
                </p>
              </div>
              
              {valuationEntries.length > 0 && (
                <div 
                  className="hidden xl:flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/50 text-sm font-semibold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 cursor-default"
                  title="Total Valuation of Collection"
                >
                  {valuationEntries.map(([currCode, sum], i) => (
                    <React.Fragment key={currCode}>
                      {i > 0 && <span className="text-slate-300 dark:text-zinc-600 font-normal">•</span>}
                      <span>{formatPrice(sum as number, currCode as CurrencyCode)}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
              {/* Desktop Full View (xl and above: >= 1280px) */}
              <div className="hidden xl:flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 h-10 px-3 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-slate-500 dark:text-zinc-400 hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white transition-all shadow-sm group min-w-[210px]"
                  title="Search all products (Ctrl+K)"
                >
                  <Search size={15} className="text-slate-400 group-hover:text-slate-900 dark:text-zinc-500 dark:group-hover:text-white shrink-0" />
                  <span className="flex-1 text-left truncate text-xs text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white font-normal">
                    Search all items...
                  </span>
                  <kbd className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700 shadow-xs">
                    <Command size={11} strokeWidth={2.5} className="shrink-0" />
                    <span className="font-semibold text-[11px]">K</span>
                  </kbd>
                </button>
                {isSelectMode ? (
                  <>
                    <Button variant="destructive" onClick={handleBatchDelete} disabled={selectedProductIds.length === 0} title="Delete Selected" className="h-10 px-3">
                      <Trash2 />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" disabled={selectedProductIds.length === 0} title="Move Selected" className="h-10 px-3 border border-slate-200 dark:border-zinc-700">
                          <FolderInput />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px] bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700">
                        <DropdownMenuLabel className="font-bold text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider px-2 py-1.5">
                          Move to
                        </DropdownMenuLabel>
                        <DropdownMenuGroup>
                          {collections.filter(c => c.id !== activeCollectionId).length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-slate-400 dark:text-zinc-500">
                              No other collections
                            </div>
                          ) : (
                            collections
                              .filter(c => c.id !== activeCollectionId)
                              .map(col => (
                                <DropdownMenuItem 
                                  key={col.id} 
                                  onClick={() => handleBatchMove(col.id)} 
                                  className="gap-2 cursor-pointer"
                                >
                                  {React.createElement(getCollectionIcon(col.name), { size: 14, className: 'text-slate-400 dark:text-zinc-500 shrink-0' })}
                                  {col.name}
                                </DropdownMenuItem>
                              ))
                          )}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="outline"
                      className="h-10 rounded-lg font-normal border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all duration-200 shadow-sm"
                      onClick={() => { setIsSelectMode(false); setSelectedProductIds([]); }}
                    >
                      <XSquare size={16} className="mr-2" />
                      Cancel Selection
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="h-10 rounded-lg font-normal border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all duration-200 shadow-sm"
                      onClick={() => { setIsSelectMode(true); }}
                    >
                      <ListChecks size={16} className="mr-2" />
                      Select
                    </Button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-zinc-800 mx-1" />
                    <MultiSelect
                      value={filterCategories}
                      onChange={setFilterCategories}
                      options={filterOptions}
                      placeholder="Filter Items"
                      icon={Filter}
                    />
                    <SortDropdown
                      value={activeSortOrder}
                      onChange={handleSortChange}
                      options={sortOptions}
                    />
                  </>
                )}
              </div>

              {/* Tablet Compact View (md to xl: 768px - 1279px, including iPad Landscape 1024px) */}
              <div className="flex xl:hidden items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
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
                      onClick={handleBatchDelete} 
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
                          className="h-10 w-10 shrink-0 border border-slate-200 dark:border-zinc-700"
                        >
                          <FolderInput size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px] bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700">
                        <DropdownMenuLabel className="font-bold text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider px-2 py-1.5">
                          Move to
                        </DropdownMenuLabel>
                        <DropdownMenuGroup>
                          {collections.filter(c => c.id !== activeCollectionId).map(col => (
                            <DropdownMenuItem 
                              key={col.id} 
                              onClick={() => handleBatchMove(col.id)} 
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
                      className="h-10 w-10 border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shrink-0"
                      onClick={() => { setIsSelectMode(false); setSelectedProductIds([]); }}
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
                      className="h-10 w-10 border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 shrink-0"
                      onClick={() => { setIsSelectMode(true); }}
                      title="Select Items"
                    >
                      <ListChecks size={18} />
                    </Button>
                    <MultiSelect
                      value={filterCategories}
                      onChange={setFilterCategories}
                      options={filterOptions}
                      placeholder="Filter"
                      icon={Filter}
                      iconOnly={true}
                    />
                    <SortDropdown
                      value={activeSortOrder}
                      onChange={handleSortChange}
                      options={sortOptions}
                      iconOnly={true}
                    />
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center shrink-0"
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={20} />
              </button>

              <AnimatedThemeToggler 
                onThemeToggle={(newMode) => handleThemeModeChange(newMode)}
                className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center shrink-0"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth custom-scrollbar">
          <div className="max-w-[1600px] w-full mx-auto space-y-6">

            {filteredAndSortedProducts.length === 0 ? (
              <EmptyState 
                onAdd={handleOpenAddModal}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 pb-24">
                {filteredAndSortedProducts.map((product) => (
                  <div 
                    key={product.id}
                    id={`product-${product.id}`}
                    onDragOver={handleDragOver}
                    className="relative"
                  >
                    <ProductCard
                      product={product}
                      onEdit={handleOpenEditProduct}
                      onDelete={handleDeleteProduct}
                      onDeleteReceipt={handleDeleteReceipt}
                      onMove={handleMoveProduct}
                      availableCollections={collections.filter(c => c.id !== activeCollectionId)}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragEnter={() => handleDragEnter(product.id)}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      isDraggedOver={dragOverProductId === product.id}
                      isSelectMode={isSelectMode}
                      isSelected={selectedProductIds.includes(product.id)}
                      onToggleSelect={toggleSelectProduct}
                      onLongPress={handleLongPress}
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

      </div>

      {/* Add Product Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => { setIsAddModalOpen(false); setFormData(EMPTY_FORM); }}
        title="Add New Product"
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            handleFileChange={handleFileChange}
            categoryOptions={categoryOptions}
            monthOptions={monthOptions}
            yearOptions={yearOptions}
            conditionOptions={conditionOptions}
            currency={currency}
            availableTags={allUniqueTags}
            tagColors={tagColors}
            onSetTagColor={handleSetTagColor}
          />
          <div className="-mx-6 -mb-6 px-6 py-4 mt-6 border-t border-slate-100 dark:border-zinc-800">
            <Button type="submit" className="w-full">
              <Plus size={18} />
              Add Product
            </Button>
          </div>

        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={!!editingProduct}
        onClose={handleCloseEditModal}
        title="Edit Product Details"
      >
        <form onSubmit={handleEditProduct} className="space-y-4">
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            handleFileChange={handleFileChange}
            categoryOptions={categoryOptions}
            monthOptions={monthOptions}
            yearOptions={yearOptions}
            conditionOptions={conditionOptions}
            currency={currency}
            availableTags={allUniqueTags}
            tagColors={tagColors}
            onSetTagColor={handleSetTagColor}
          />
          <div className="-mx-6 -mb-6 px-6 py-4 mt-6 border-t border-slate-100 dark:border-zinc-800">
            <Button type="submit" className="w-full">
              <Save size={18} />
              Save Changes
            </Button>
          </div>

        </form>
      </Modal>

      {/* Floating Action Button (FAB) */}
      {activeCollection.products.length > 0 && (
        <button
          onClick={handleOpenAddModal}
          className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.1)] hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Add Product"
        >
          <Plus size={32} className="transition-transform duration-500 group-hover:rotate-90" />
        </button>
      )}

      {/* Import Difference Conflict Modal */}
      {importDiffData && (
        <ImportDiffModal
          isOpen={!!importDiffData}
          onClose={() => setImportDiffData(null)}
          diffResult={importDiffData.diff}
          onConfirmOverrideCloud={handleConfirmOverrideCloud}
          onConfirmKeepLocal={handleConfirmKeepLocal}
          isProcessing={isProcessingImport}
        />
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        collections={collections}
        currency={currency}
        onSelectProduct={handleSelectProductFromSearch}
        tagColors={tagColors}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        ageFormat={ageFormat}
        onAgeFormatChange={handleAgeFormatChange}
        defaultWarranty={defaultWarranty}
        onDefaultWarrantyChange={handleDefaultWarrantyChange}
        collections={collections}
        defaultOpeningCollection={defaultOpeningCollection}
        onDefaultOpeningCollectionChange={handleDefaultOpeningCollectionChange}
        themeMode={themeMode}
        onThemeModeChange={handleThemeModeChange}
        totalReceiptsCount={totalReceiptsCount}
        totalReceiptsBytes={totalReceiptsBytes}
        user={user}
        isSyncing={isSyncing}
        onCloudResync={handleCloudResync}
        totalProductsCount={collections.reduce((sum, col) => sum + (col.products?.length || 0), 0)}
        totalCollectionsCount={collections.length}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportData}
        onSignOut={signOut}
        onSignIn={signIn}
        onResetAllData={handleResetAllData}
      />

      {/* Undo Toast */}
      {deletedProductInfo && (
        <Toast 
          message={`Deleted ${deletedProductInfo.product.name}`}
          onUndo={undoDelete}
          onClose={() => setDeletedProductInfo(null)}
        />
      )}

      {/* General Notification Toast */}
      {generalToastMessage && (
        <Toast
          message={generalToastMessage}
          onClose={() => setGeneralToastMessage(null)}
        />
      )}
    </div>
  );
}