// ---------------------------------------------------------------------------
// Tag Colors Engine: 8 Distinct, High-Contrast Predefined Colors
// ---------------------------------------------------------------------------

export type TagColorId = 
  | 'crimson'
  | 'orange'
  | 'amber'
  | 'emerald'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'platinum';

export interface TagColorDef {
  id: TagColorId;
  name: string;
  dotColor: string; // Hex for swatch/dot
  badgeClass: string; // Tailwind styling for pills
  borderHoverClass: string;
}

export const PREDEFINED_TAG_COLORS: TagColorDef[] = [
  {
    id: 'crimson',
    name: 'Crimson Red',
    dotColor: '#e11d48',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/90 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    borderHoverClass: 'hover:border-rose-400',
  },
  {
    id: 'orange',
    name: 'Vibrant Orange',
    dotColor: '#f97316',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200/90 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60',
    borderHoverClass: 'hover:border-orange-400',
  },
  {
    id: 'amber',
    name: 'Amber Yellow',
    dotColor: '#f59e0b',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/90 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    borderHoverClass: 'hover:border-amber-400',
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    dotColor: '#10b981',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    borderHoverClass: 'hover:border-emerald-400',
  },
  {
    id: 'teal',
    name: 'Teal / Cyan',
    dotColor: '#06b6d4',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200/90 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60',
    borderHoverClass: 'hover:border-cyan-400',
  },
  {
    id: 'blue',
    name: 'Royal Blue',
    dotColor: '#2563eb',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/90 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
    borderHoverClass: 'hover:border-blue-400',
  },
  {
    id: 'purple',
    name: 'Amethyst Purple',
    dotColor: '#9333ea',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/90 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
    borderHoverClass: 'hover:border-purple-400',
  },
  {
    id: 'platinum',
    name: 'Pure White / Platinum',
    dotColor: '#f1f5f9',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-white/10 dark:text-white dark:border-white/30',
    borderHoverClass: 'hover:border-slate-400 dark:hover:border-white',
  },
];

export const DEFAULT_TAG_BADGE_CLASS = 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-zinc-800/70 dark:text-zinc-300 dark:border-zinc-700/60';
export const DEFAULT_TAG_DOT_COLOR = '#94a3b8'; // Slate 400

const STORAGE_KEY = 'techage_tag_colors';

export function getTagColorDef(colorId?: string): TagColorDef | undefined {
  if (!colorId) return undefined;
  const normalized = colorId.toLowerCase();

  // Direct match
  const direct = PREDEFINED_TAG_COLORS.find(c => c.id === normalized);
  if (direct) return direct;

  // Backward-compatibility aliases
  if (normalized === 'rose' || normalized === 'red') return PREDEFINED_TAG_COLORS.find(c => c.id === 'crimson');
  if (normalized === 'cyan') return PREDEFINED_TAG_COLORS.find(c => c.id === 'teal');
  if (normalized === 'indigo' || normalized === 'white') return PREDEFINED_TAG_COLORS.find(c => c.id === 'platinum');

  return undefined;
}

export function getTagBadgeClass(colorId?: string): string {
  const def = getTagColorDef(colorId);
  return def ? def.badgeClass : DEFAULT_TAG_BADGE_CLASS;
}

export function getTagDotColor(colorId?: string): string {
  const def = getTagColorDef(colorId);
  return def ? def.dotColor : DEFAULT_TAG_DOT_COLOR;
}

export function getLocalTagColors(): Record<string, TagColorId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse tag colors from localStorage:', err);
    return {};
  }
}

export function saveLocalTagColors(colors: Record<string, TagColorId>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  } catch (err) {
    console.warn('Failed to save tag colors to localStorage:', err);
  }
}
