export interface Product {
  id: string;
  name: string;
  category: string;
  purchaseMonth: number; // 0-11 (Jan-Dec)
  purchaseYear: number;
  price?: number;
  warrantyYears?: number;
  receipt?: string;
  condition?: string;
  createdAt: number;
}

export interface Collection {
  id: string;
  name: string;
  products: Product[];
  hasCustomOrder?: boolean;
  sortOrder?: string;
}


export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const CATEGORIES = [
  "Smartphone", "Laptop", "Desktop", "Tablet", "Smartwatch", "Headphones",
  "Earbuds", "Camera", "Console", "TV", "Monitor", "Peripherals",
  "Smart Home", "Other"
];

export const CONDITIONS = [
  "Mint", "Fine", "Good", "Poor", "Critical"
];