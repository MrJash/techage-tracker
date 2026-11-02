# TechAge Tracker — Project Memory & Architecture

> **Current Version:** `v1.5.0` (Tagged `v1.5`)  
> **Author & Creator:** Jash Mewada  
> **Repository:** [github.com/MrJash/techage-tracker](https://github.com/MrJash/techage-tracker)  
> **Last Updated:** November 2026

---

## 1. Project Overview & Mission

**TechAge Tracker** is a client-first hardware lifespan, warranty expiration, and asset valuation tracker designed for electronics enthusiasts, developers, and power users. It enables users to:
- Monitor the exact chronological age and depreciation of gadgets.
- Track warranty status in real time with active countdowns and expiration badges.
- Organize items into custom collections (e.g., *Home*, *Desk Setup*, *Mobile*, *Work*).
- Upload, store, and view high-resolution PDF or image receipts offline and in the cloud.
- Manage asset valuations across **9 global currencies** with real-time symbol formatting.
- Synchronize data seamlessly across devices using **Google Cloud Firestore** while retaining complete offline functionality.

---

## 2. Technology Stack

- **Runtime & Framework:** React 19 (TypeScript) + Vite 6
- **Styling:** Tailwind CSS v4 + Tailwind CSS Animate
- **UI & Components:** Lucide React icons, Radix UI primitives (`@radix-ui/react-dropdown-menu`, `@radix-ui/react-slot`, `@radix-ui/react-toggle`), custom styled modals and alert dialogs
- **Backend & Cloud:** Firebase Auth (Google Sign-In) + Cloud Firestore (Document Rules v2)
- **Data Export / Import:** Browser-based native CSV generator, JSON serialization with schema validation and conflict resolution diffing

---

## 3. Core Modules & Architecture

### A. Settings Modal Architecture (`components/SettingsModal.tsx` & `components/settings/`)
- **Orchestrator Container:** `components/SettingsModal.tsx` acts as the clean modal shell managing tabs, the reset confirmation alert dialog, and keyboard navigation.
- **Modular Sub-components:**
  - `components/settings/PreferencesTab.tsx`: Currency dropdown, age display format selector, warranty presets, default opening collection, and receipt limits.
  - `components/settings/GeneralTab.tsx`: Theme mode switcher, grouped Inventory & Storage cards with quota progress meter and data exports, and Google Account & Cloud Services with sync and danger zone.
  - `components/settings/AboutTab.tsx`: App branding, author attribution (*"Crafted with ❤️ by Jash Mewada"*), technical specifications, and release changelog.
- **Dimensions:** Enlarged desktop window (`max-w-4xl`, `h-[760px]`, `max-h-[92vh]`) providing ample breathing room with minimal scrolling.
- **Tab 1: Preferences**
  - **Default Currency:** Selectable across 9 supported currencies: `USD` ($), `EUR` (€), `GBP` (£), `JPY` (¥), `CAD` ($), `AUD` ($), `INR` (₹), `CHF` (Fr), and `CNY` (¥). Managed via `utils/currency.ts`.
  - **Age Display Format:** Four selectable presentation modes:
    1. *Detailed:* e.g., `3 Years 5 Months Old`
    2. *Compact:* e.g., `3.4 yrs`
    3. *Short:* e.g., `3y 4m`
    4. *Total Months:* e.g., `41 mos`
    (Implemented in `utils/dateHelpers.ts`).
  - **Default Warranty Duration:** Quick selection buttons (`None`, `1 Year`, `2 Years`, `3 Years`, `5 Years`) pre-filled when creating items.
  - **Default Opening Collection:** Choice between `Last Active Collection (Auto)` and specific favorite collections for initial application boot.
  - **Receipt Upload Policy:** Informs user of the 750 KB per-receipt compression ceiling.

- **Tab 2: General**
  - **Theme Mode Selector:** Anchored at the top with options `System (Auto)`, `Light Mode`, and `Dark Mode`. Bi-directionally synchronized with the header theme switcher (`components/ui/animated-theme-toggler.tsx`).
  - **Big Card 1 — Inventory & Storage:**
    - Top metric tiles: `Total Collections` and `Total Products`.
    - Nested Card 1: *Storage & Receipt Footprint* — computes live local receipt storage bytes against a 5 MB local storage quota with an interactive colored progress bar.
    - Nested Card 2: *Backup & Data Portability* — single-click triggers for `Export CSV` and `Export JSON`.
  - **Big Card 2 — Google Account & Cloud Services:**
    - Top profile card: Displays avatar, Google user name, email, connected status pill, and `Sign Out` / `Sign In with Google`.
    - Nested Card 1: *Cloud Resync & Cache Refresh* — invalidates local memory cache and pulls authoritative remote state from Firestore.
    - Nested Card 2: *Danger Zone: Reset Workspace Data* — styled in warning red with confirmation dialog (`AlertDialog`) to purge local storage.

- **Tab 3: About**
  - Hero branding with glossy gradient app icon, version `v1.5.0` badge, and author credit: *"Crafted with ❤️ by Jash Mewada"*.
  - Technical Specifications card: Version, Creator attribution (`Jash Mewada ❤️`), and Cloud Database engine (`Cloud Firestore rules_version 2`).
  - **Changelog Card:** Comprehensive timeline of post-v1.0 releases (`v1.5.0`, `v1.4.0`, `v1.3.0`, `v1.2.0`) with balanced border divider spacing.

---

### B. Tag Color Palette (`utils/tagColors.ts`)
A curated 8-color palette designed for high contrast and distinctive recognition in both dark and light themes:
1. **Crimson Red** (`#EF4444`)
2. **Vibrant Orange** (`#F97316`)
3. **Amber Yellow** (`#F59E0B`)
4. **Emerald Green** (`#10B981`)
5. **Teal / Cyan** (`#06B6D4`)
6. **Royal Blue** (`#3B82F6`)
7. **Amethyst Purple** (`#A855F7`)
8. **Pure White / Platinum** (`#E2E8F0`)

- **Rendering Rules:** Product cards display colored `#` tags without redundant indicator dots; filter menus display responsive color dots next to tag names; the color picker dropdown automatically closes immediately upon selection.

---

### C. Receipt Subcollection Architecture (`lib/firestoreService.ts`)
To avoid Firestore's 1 MiB document size limit when attaching base64 receipts:
- The main user document `users/{userId}` contains metadata, collections, product lists (without heavy base64 strings), and user preferences.
- Heavy receipt attachments are stored in an independent subcollection:  
  `users/{userId}/receipts/{productId}`
- Hard limit of **750 KB** (1,040,000 base64 chars) per receipt enforced before upload.

---

### D. Hardened Cloud Firestore Rules (`firestore.rules`)
Configured under `rules_version = '2'`:
- Strict user isolation (`request.auth.uid == userId`).
- Allowed preference keys whitelist: `defaultCurrency`, `ageFormat`, `defaultWarranty`, `defaultOpeningCollection`, `themeMode`, `tagColors`.
- Collection bounds checking (max 100 collections per user doc).
- Subcollection validation verifying matching `productId`, timestamp, and `< 1,040,000` character receipt strings.

---

## 4. Release History Summary

### `v1.5.0` (November 2026)
- **Added** 2 new color themes: Sage Garden and Amber Minimal.
- **Fixed** various theme-related bugs and visual contrast issues.
- **Updated** Import button workflow and added animated toast notifications for exports, product additions, and saves.
- **Unified** UI components consistency across buttons, dialogs, and selection controls.
- **Added** support for Progressive Web App (PWA) with installability, offline icons, and mobile optimization.
- **Fixed** bugs in Settings and improved overall performance.

### `v1.4.0` (November 2026)
- **Structured** General Settings into 2 clean cards for storage, data portability, and cloud management.
- **Enlarged** Settings modal dimensions for enhanced desktop visibility.
- **Added** 'Short' age display format (e.g. 3y 4m).
- **Implemented** real-time synchronization between the header animated theme toggler and General settings.
- **Fixed** collection launch persistence on browser refresh to honor user preferences.
- **Balanced** separator line spacing in the About changelog.
- **Refined** CSV and JSON export buttons with cleaner hover effects.
- **Added** author credits (*"Crafted with ❤️ by Jash Mewada"*) and in-app Changelog tracker.

### `v1.3.0`
- **Added** curated 8-color palette for product tags with responsive colored filter dots.
- **Implemented** Theme Mode selector supporting System (Auto), Dark, and Light mode presets.
- **Added** Storage & Receipt Footprint meter with 5 MB localStorage quota tracker.
- **Implemented** Cloud Resync troubleshooting utility and guarded Danger Zone workspace reset.
- **Added** Default Warranty Duration and Default Opening Collection preferences.
- **Updated** Firestore security rules v2 to strictly validate and authorize preference synchronization.

### `v1.2.0`
- **Implemented** dedicated multi-tab Settings Modal (Preferences, General, About).
- **Added** multi-currency engine supporting 9 global currencies with real-time formatting.
- **Implemented** inline morphing export action bar for quick CSV and JSON downloads.
- **Architected** dedicated cloud receipts subcollection architecture with 750 KB item ceiling.

### `v1.0.0`
- **Implemented** initial release: Core lifespan calculation, collection groupings, warranty countdown, and Google Cloud sync.

---

## 5. Development Guidelines & Key Lessons

1. **Firestore Preferences Whitelist:**  
   Whenever introducing a new field to `UserPreferences` in `types.ts` or `lib/firestoreService.ts`, you **must** update `isValidPreferences` in `firestore.rules` to include the key. Otherwise, Firestore throws `Missing or insufficient permissions` during cloud save.
2. **Tailwind v4 Divider Spacing:**  
   Avoid pairing `divide-y` with `space-y-*` when list items have asymmetric child padding. Use explicit `py-4 border-b border-slate-200/80 dark:border-zinc-800/80` to ensure equal spacing above and below divider lines.
3. **Receipt Size Ceiling:**  
   Always validate and compress image/PDF uploads before saving to localStorage or Firestore. A 750 KB ceiling ensures fast sync and prevents browser storage overflow.
4. **Active Collection Restore:**  
   Always check both `DEFAULT_COLLECTION_PREF_KEY` and `LAST_ACTIVE_COLLECTION_KEY` when restoring active collection state during initial page load to respect user configuration.
5. **Always Use shadcn/ui Semantic Tokens (Strict Styling Policy):**  
   For all new components and refactoring existing UI, **never** hardcode static Tailwind palette classes (e.g., `bg-zinc-900`, `bg-zinc-950`, `border-zinc-800`, `text-slate-400`, `hover:bg-slate-50`, `bg-white`).  
   **Always use shadcn/ui semantic tokens:**
   - Surfaces: `bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `bg-popover`, `text-popover-foreground`
   - Borders & Dividers: `border-border`, `divide-border`
   - Interactive / Hover: `hover:bg-accent hover:text-accent-foreground`, `bg-muted text-muted-foreground`
   - Accents & Primary: `bg-primary text-primary-foreground`, `ring-ring`
   - Sidebar: `bg-sidebar`, `text-sidebar-foreground`, `border-sidebar-border`, `bg-sidebar-accent text-sidebar-accent-foreground`, `text-sidebar-primary`  
   This ensures new components automatically and seamlessly adopt any current or future TweakCN theme (OKLCH, HEX, or CSS) in both light and dark modes.
