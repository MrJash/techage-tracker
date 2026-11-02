import React from 'react';
import { 
  Laptop, 
  PlusCircle, 
  FileText,
  FolderKanban, 
  SlidersHorizontal, 
  Settings2 
} from 'lucide-react';

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface TutorialStep {
  id: string;
  targetSelector: string;
  fallbackSelector?: string;
  title: string;
  description: string;
  placement?: TourPlacement;
  spotlightPadding?: number;
  interactiveTarget?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'inventory-overview',
    targetSelector: '[data-tour="inventory-overview"]',
    fallbackSelector: '[data-tour="inventory-area"]',
    title: 'Your Hardware Inventory',
    description: 'Monitor your registered devices, track calculated aging, view active warranty statuses, and see real-time currency valuations.',
    placement: 'bottom',
    spotlightPadding: 6,
    icon: Laptop,
  },
  {
    id: 'add-product-btn',
    targetSelector: '[data-tour="add-product-btn"]',
    fallbackSelector: '[data-tour="inventory-area"]',
    title: 'Add New Device',
    description: 'Click this button to open the hardware registration form, or click Next to explore.',
    placement: 'top',
    spotlightPadding: 8,
    interactiveTarget: true,
    icon: PlusCircle,
  },
  {
    id: 'add-product-modal',
    targetSelector: '[data-tour="add-product-modal"]',
    fallbackSelector: '[data-tour="inventory-area"]',
    title: 'Hardware Details & Receipts',
    description: 'Enter device name, category, purchase date, warranty duration, price, condition, custom colored tags, and attach PDF/image invoices for cloud backup.',
    placement: 'bottom',
    spotlightPadding: 6,
    icon: FileText,
  },
  {
    id: 'collections-nav',
    targetSelector: '[data-tour="collections-nav"]',
    fallbackSelector: '[data-tour="mobile-menu-btn"]',
    title: 'Organize with Collections',
    description: 'Group your devices into custom collections like Home Setup, Mobile Gear, Audio, Gaming, or Studio for clean inventory organization.',
    placement: 'right',
    spotlightPadding: 6,
    icon: FolderKanban,
  },
  {
    id: 'filters-and-search',
    targetSelector: '[data-tour="filters-group"]',
    fallbackSelector: '[data-tour="tablet-filters-group"], [data-tour="mobile-filters-group"]',
    title: 'Search & Filter',
    description: 'Quickly find devices using keyboard search (Ctrl+K), filter by category or custom colored tags, and customize sorting orders.',
    placement: 'bottom',
    spotlightPadding: 6,
    icon: SlidersHorizontal,
  },
  {
    id: 'settings',
    targetSelector: '[data-tour="settings-modal"]',
    fallbackSelector: '[data-tour="settings-btn"]',
    title: 'Customize Your Experience',
    description: 'Manage your default currency (9 global currencies), age display format, themes (Default, Bold Tech), Google cloud sync, and data exports.',
    placement: 'bottom',
    spotlightPadding: 6,
    icon: Settings2,
  },
];
