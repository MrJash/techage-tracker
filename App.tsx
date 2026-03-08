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
import { useAuth } from './hooks/useAuth';
import { loadCollectionsFromFirestore, saveCollectionsToFirestore } from './lib/firestoreService';

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

import { Plus, Menu, Sun, Moon, Filter, ArrowUpDown, Upload, X, Eye, Download, Save, ListChecks, XSquare, Trash2, FolderInput, IndianRupee, Sparkles, ThumbsUp, AlertTriangle, AlertOctagon } from 'lucide-react';




const STORAGE_KEY = 'tech_tracker_data';
const THEME_KEY = 'tech_tracker_theme';

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
  warrantyYears: '',
  receipt: '',
  condition: ''
};

export default function App() {
  // -- Auth --
  const { user, loading: authLoading, signIn, signOut } = useAuth();

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
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                  return parsed[0].id;
              }
          } catch(e) {}
      }
      return 'default';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Cloud sync state
  const [cloudSyncReady, setCloudSyncReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
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
  const { handleExportData, handleImportData } = useImportExport(
    collections, 
    setCollections, 
    setFilterCategories, 
    setActiveCollectionId, 
    setIsMobileMenuOpen
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

  // Load Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  }, [collections]);

  // Load from Firestore when user logs in
  useEffect(() => {
    if (!user) {
      setCloudSyncReady(false);
      return;
    }
    setIsSyncing(true);
    loadCollectionsFromFirestore(user.uid)
      .then(cloudData => {
        if (cloudData) {
          // Cloud has data — use it as source of truth
          setCollections(cloudData);
          setActiveCollectionId(cloudData[0].id);
        } else {
          // No cloud data yet — upload current local data
          saveCollectionsToFirestore(user.uid, collectionsRef.current).catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => {
        setCloudSyncReady(true);
        setIsSyncing(false);
      });
  }, [user]);

  // Save to Firestore when collections change
  useEffect(() => {
    if (!cloudSyncReady || !user) return;
    setIsSyncing(true);
    saveCollectionsToFirestore(user.uid, collections)
      .catch(console.error)
      .finally(() => setIsSyncing(false));
  }, [collections, cloudSyncReady, user]);

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
  const totalValuation = activeCollection.products.reduce((sum, p) => sum + (p.price || 0), 0);

  
  const activeSortOrder = activeCollection?.sortOrder || 'newest';

  const filteredAndSortedProducts = useMemo(() => {
    if (!activeCollection) return [];
    
    let result = [...activeCollection.products];

    if (filterCategories.length > 0) {
      const selectedCategoryFilters = filterCategories.filter(f => CATEGORIES.includes(f));
      const selectedWarrantyFilters = filterCategories.filter(f => f.startsWith('warranty-'));

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, receipt: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
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
      warrantyYears: formData.warrantyYears !== '' ? Number(formData.warrantyYears) : undefined,
      receipt: formData.receipt || undefined,
      condition: formData.condition || undefined,
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
      warrantyYears: product.warrantyYears?.toString() || '',
      receipt: product.receipt || '',
      condition: product.condition || '',
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
                  warrantyYears: formData.warrantyYears !== '' ? Number(formData.warrantyYears) : undefined,
                  receipt: formData.receipt || undefined,
                  condition: formData.condition || undefined,
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
        onSelectCollection={setActiveCollectionId}
        onAddCollection={handleAddCollection}
        onDeleteCollection={handleDeleteCollection}
        onRenameCollection={handleRenameCollection}
        onExportData={handleExportData}
        onImportData={handleImportData}
        isOpenMobile={isMobileMenuOpen}
        setIsOpenMobile={setIsMobileMenuOpen}
        user={user}
        onSignIn={signIn}
        onSignOut={signOut}
        isSyncing={isSyncing}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <header className="h-20 bg-white dark:bg-black border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between shrink-0 transition-colors duration-200 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              className="lg:hidden shrink-0 mr-1 p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="truncate">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">{activeCollection.name}</h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {activeCollection.products.length} Items
              </p>
            </div>
            
            {totalValuation > 0 && (
              <div 
                className="hidden sm:flex shrink-0 items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/50 text-sm font-semibold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 cursor-default"
                title="Total Valuation of Collection"
              >
                <IndianRupee size={14} className="mr-1 text-slate-500 dark:text-zinc-400" />
                {totalValuation.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          
          <div className="flex items-center gap-3 sm:gap-4">
             <div className="hidden md:flex items-center gap-3">
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
             <div className="md:hidden flex items-center gap-1">
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
             </div>

            <AnimatedThemeToggler 
                className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center shrink-0"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth custom-scrollbar">
          <div className="max-w-[1600px] w-full mx-auto space-y-6">

            {filteredAndSortedProducts.length === 0 ? (
              <EmptyState 
                onAdd={() => setIsAddModalOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-24">
                {filteredAndSortedProducts.map((product) => (
                  <div 
                    key={product.id}
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
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.1)] hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Add Product"
        >
          <Plus size={32} className="transition-transform duration-500 group-hover:rotate-90" />
        </button>
      )}

      {/* Undo Toast */}
      {deletedProductInfo && (
        <Toast 
          message={`Deleted ${deletedProductInfo.product.name}`}
          onUndo={undoDelete}
          onClose={() => setDeletedProductInfo(null)}
        />
      )}
    </div>
  );
}