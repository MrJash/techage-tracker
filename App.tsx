import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProductGrid } from './components/ProductGrid';
import { Button } from './components/ui/button';
import { Collection, Product, MONTHS, CATEGORIES, CONDITIONS } from './types';
import { generateId, calculateWarrantyStatus } from './utils/dateHelpers';
import { Toast } from './components/Toast';
import { ArcToast } from './components/arc/toast/toast';
import { AppHeader } from './components/layout/AppHeader';
import { PendingSyncBanner } from './components/layout/PendingSyncBanner';
import { ProductModals } from './components/modals/ProductModals';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useProductSelection } from './hooks/useProductSelection';
import { useImportExport } from './hooks/useImportExport';
import { ImportDiffModal } from './components/ImportDiffModal';
import { compareCollections, ImportDiffResult } from './utils/diffHelpers';
import { useAuth } from './hooks/useAuth';
import { loadCollectionsFromFirestore, saveCollectionsToFirestore, deleteReceiptFromFirestore, clearReceiptSyncCache, loadUserPreferencesFromFirestore, saveUserPreferencesToFirestore, UserPreferences } from './lib/firestoreService';

import { Plus, Sparkles, ThumbsUp, AlertTriangle, AlertOctagon } from 'lucide-react';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SettingsModal, ThemeMode, ThemePreset } from './components/SettingsModal';
import { useGuidedTour } from './hooks/useGuidedTour';
import { WelcomeTour } from './components/tutorial/WelcomeTour';
import { GuidedTour } from './components/tutorial/GuidedTour';
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
const THEME_PRESET_KEY = 'techage_pref_theme_preset';
const CURRENCY_KEY = 'tech_tracker_currency';
const AGE_FORMAT_KEY = 'techage_pref_age_format';
const DEFAULT_WARRANTY_KEY = 'techage_pref_default_warranty';
const DEFAULT_COLLECTION_PREF_KEY = 'techage_pref_default_collection';
const LAST_ACTIVE_COLLECTION_KEY = 'techage_last_active_collection';

// Default initial state
const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: 'default',
    name: 'My Collection',
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
  condition: 'Fine',
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

  // Theme Preset ('default' | 'bold-tech')
  const [themePreset, setThemePreset] = useState<ThemePreset>(() => {
    return (localStorage.getItem(THEME_PRESET_KEY) as ThemePreset) || 'default';
  });

  const applyThemePreset = (preset: ThemePreset) => {
    if (preset === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', preset);
    }
  };

  useEffect(() => {
    applyThemePreset(themePreset);
  }, [themePreset]);

  // Full Preferences Helper for Cloud Firestore Sync (Theme & Preset remain device-local)
  const getFullPreferences = (overrides?: Partial<UserPreferences>): UserPreferences => ({
    defaultCurrency: currency,
    ageFormat,
    defaultWarranty,
    defaultOpeningCollection,
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
  };

  const handleThemePresetChange = (preset: ThemePreset) => {
    setThemePreset(preset);
    localStorage.setItem(THEME_PRESET_KEY, preset);
    applyThemePreset(preset);
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

  // ArcUI Animated Toast state
  const [arcToast, setArcToast] = useState<{
    title: string;
    description?: string;
    id: number;
  } | null>(null);

  const showArcToast = (title: string, description?: string) => {
    setArcToast({ title, description, id: Date.now() });
  };

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
    (importedData) => handleProcessImport(importedData),
    currency
  );

  const handleExportDataWithToast = async () => {
    const success = await handleExportData();
    if (success) {
      showArcToast('Export Successful', 'Inventory backup JSON file saved.');
    }
  };

  const handleExportCSVWithToast = async () => {
    const success = await handleExportCSV();
    if (success) {
      showArcToast('Export Successful', 'Inventory CSV spreadsheet saved.');
    }
  };
  
  // -- Form State --
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deletedProductInfo, setDeletedProductInfo] = useState<{ 
    product: Product; 
    collectionId: string; 
    index: number; 
  } | null>(null);

  // Multi-Select State & Batch Operations
  const {
    isSelectMode,
    setIsSelectMode,
    selectedProductIds,
    setSelectedProductIds,
    toggleSelectProduct,
    handleLongPress,
    handleBatchDelete,
    handleBatchMove,
    clearSelection,
  } = useProductSelection(collections, setCollections, user?.uid);

  // Guided Tour Onboarding detection
  const totalProductsAcrossAllCollections = useMemo(() => {
    return collections.reduce((acc, col) => acc + (col.products?.length || 0), 0);
  }, [collections]);

  const hasUserCustomData = useMemo(() => {
    return (
      totalProductsAcrossAllCollections > 0 ||
      collections.some(
        col => col.id !== 'default' || (col.products && col.products.length > 0) || (col.name !== 'My Collection' && col.name !== 'My Electronics')
      )
    );
  }, [totalProductsAcrossAllCollections, collections]);

  const isDataHydrated = !authLoading && (!user || cloudSyncReady);

  const {
    isTourOpen,
    isWelcomeOpen,
    currentStep,
    currentStepIndex,
    totalSteps,
    startTour,
    restartTour,
    nextStep,
    prevStep,
    skipTour,
    finishTour,
    dismissWelcome,
  } = useGuidedTour({
    isHydrated: isDataHydrated,
    hasExistingData: hasUserCustomData,
    onOpenAddModal: () => setIsAddModalOpen(true),
    onCloseAddModal: () => { setIsAddModalOpen(false); setFormData(EMPTY_FORM); },
    onOpenSettings: () => setIsSettingsOpen(true),
    onCloseSettings: () => setIsSettingsOpen(false),
    isAddModalOpen,
    isSettingsOpen,
  });

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
  }, [collections, currency, ageFormat, defaultWarranty, defaultOpeningCollection, tagColors, cloudSyncReady, user, hasLocalImportPendingSync]);

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
      setThemeMode('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
      setThemeMode('light');
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
          name: 'My Collection',
          products: []
        };
        setCollections([defaultCollection]);
        setActiveCollectionId(defaultCollection.id);
        setGeneralToastMessage("At least one collection is required. 'My Collection' has been reset.");
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
    showArcToast('Product Added', `"${newProduct.name}" added successfully.`);
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
    showArcToast('Product Saved', `"${formData.name}" saved successfully.`);
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
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden transition-colors duration-200">
      <Sidebar 
        collections={collections}
        activeCollectionId={activeCollectionId}
        onSelectCollection={handleSelectCollection}
        onAddCollection={handleAddCollection}
        onDeleteCollection={handleDeleteCollection}
        onRenameCollection={handleRenameCollection}
        onExportData={handleExportDataWithToast}
        onExportCSV={handleExportCSVWithToast}
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
          <PendingSyncBanner
            onSync={handleManualSyncToFirebase}
            isSyncing={isSyncing}
          />
        )}
        <AppHeader
          activeCollection={activeCollection}
          collections={collections}
          valuationEntries={valuationEntries}
          filterCategories={filterCategories}
          onFilterCategoriesChange={setFilterCategories}
          filterOptions={filterOptions}
          activeSortOrder={activeSortOrder}
          onSortChange={handleSortChange}
          sortOptions={sortOptions}
          isSelectMode={isSelectMode}
          onToggleSelectMode={setIsSelectMode}
          selectedProductIds={selectedProductIds}
          onClearSelection={() => { setIsSelectMode(false); setSelectedProductIds([]); }}
          onBatchDelete={handleBatchDelete}
          onBatchMove={handleBatchMove}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onThemeToggle={(newMode) => handleThemeModeChange(newMode)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <ProductGrid
          products={filteredAndSortedProducts}
          activeCollectionId={activeCollectionId}
          collections={collections}
          currency={currency}
          ageFormat={ageFormat}
          tagColors={tagColors}
          highlightedProductId={highlightedProductId}
          dragOverProductId={dragOverProductId}
          isSelectMode={isSelectMode}
          selectedProductIds={selectedProductIds}
          onOpenAddModal={handleOpenAddModal}
          onOpenEditProduct={handleOpenEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onDeleteReceipt={handleDeleteReceipt}
          onMoveProduct={handleMoveProduct}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnter={(id) => handleDragEnter(id)}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onToggleSelect={toggleSelectProduct}
          onLongPress={handleLongPress}
        />

      </div>

      {/* Add & Edit Product Modals */}
      <ProductModals
        isAddModalOpen={isAddModalOpen}
        onCloseAddModal={() => { setIsAddModalOpen(false); setFormData(EMPTY_FORM); }}
        onAddSubmit={handleAddProduct}
        editingProduct={editingProduct}
        onCloseEditModal={handleCloseEditModal}
        onEditSubmit={handleEditProduct}
        formData={formData}
        setFormData={setFormData}
        handleFileChange={handleFileChange}
        categoryOptions={categoryOptions}
        monthOptions={monthOptions}
        yearOptions={yearOptions}
        conditionOptions={conditionOptions}
        currency={currency}
        allUniqueTags={allUniqueTags}
        tagColors={tagColors}
        onSetTagColor={handleSetTagColor}
      />

      {/* Floating Action Button (FAB) */}
      {activeCollection.products.length > 0 && (
        <button
          onClick={handleOpenAddModal}
          data-tour="add-product-btn"
          className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.1)] hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
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
        themePreset={themePreset}
        onThemePresetChange={handleThemePresetChange}
        totalReceiptsCount={totalReceiptsCount}
        totalReceiptsBytes={totalReceiptsBytes}
        user={user}
        isSyncing={isSyncing}
        onCloudResync={handleCloudResync}
        totalProductsCount={collections.reduce((sum, col) => sum + (col.products?.length || 0), 0)}
        totalCollectionsCount={collections.length}
        onExportCSV={handleExportCSVWithToast}
        onExportJSON={handleExportDataWithToast}
        onSignOut={signOut}
        onSignIn={signIn}
        onResetAllData={handleResetAllData}
        onStartTour={restartTour}
      />

      {/* ArcUI Notification Toast (Center Bottom) */}
      {arcToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
          <ArcToast
            key={arcToast.id}
            title={arcToast.title}
            description={arcToast.description}
            open={!!arcToast}
            duration={3000}
            onOpenChange={(isOpen) => {
              if (!isOpen) setArcToast(null);
            }}
          />
        </div>
      )}

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

      {/* Guided Tutorial / Onboarding Tour */}
      <WelcomeTour
        isOpen={isWelcomeOpen}
        onStartTour={startTour}
        onDismiss={dismissWelcome}
      />

      <GuidedTour
        isOpen={isTourOpen}
        currentStep={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTour}
        onFinish={finishTour}
      />
    </div>
  );
}