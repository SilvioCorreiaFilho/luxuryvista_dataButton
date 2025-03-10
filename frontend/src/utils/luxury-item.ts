// Custom error classes
export class LuxuryStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LuxuryStoreError';
  }
}

export class ValidationError extends LuxuryStoreError {
  constructor(field: string, message: string) {
    super(`Validation error for ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

export class ItemNotFoundError extends LuxuryStoreError {
  constructor(id: string) {
    super(`Item with ID ${id} not found`);
    this.name = 'ItemNotFoundError';
  }
}

/**
 * Memoize function for caching expensive operations
 * @param fn The function to memoize
 * @returns A memoized version of the function
 */
export function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new Map<T, R>();
  
  return (arg: T): R => {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    }
    
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

// Define base interfaces
export interface Item {
  id: string;
  name: string;
  price: number;
}

// Extend for specific item types
export interface LuxuryItem extends Item {
  category: string;
  brand: string;
  materials: string[];
  exclusivity: 'limited' | 'standard' | 'exclusive' | 'bespoke';
}

// Implement the interface
export class LuxuryProduct implements LuxuryItem {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  materials: string[];
  exclusivity: 'limited' | 'standard' | 'exclusive' | 'bespoke';
  
  constructor(data: Omit<LuxuryItem, 'id'>) {
    this.id = crypto.randomUUID();
    Object.assign(this, data);
  }

  /**
   * Format the price with currency symbol
   * @param locale The locale to use for formatting
   * @param currency The currency code
   * @returns Formatted price string
   */
  formatPrice(locale: string = 'pt-BR', currency: string = 'BRL'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(this.price);
  }

  /**
   * Get a formatted display string for the luxury item
   * @returns String representation of the luxury item
   */
  displayInfo(): string {
    return `${this.name} - ${this.brand} (${this.exclusivity}) - ${this.formatPrice()}`;
  }
}

/**
 * Builder for creating LuxuryItem instances with a fluent interface
 */
export class LuxuryItemBuilder {
  private data: Partial<LuxuryItem> = {};
  
  /**
   * Set the name of the luxury item
   * @param name The item name
   */
  withName(name: string): this {
    this.data.name = name;
    return this;
  }
  
  /**
   * Set the price of the luxury item
   * @param price The price value
   */
  withPrice(price: number): this {
    this.data.price = price;
    return this;
  }
  
  /**
   * Set the category of the luxury item
   * @param category The category name
   */
  withCategory(category: string): this {
    this.data.category = category;
    return this;
  }
  
  /**
   * Set the brand of the luxury item
   * @param brand The brand name
   */
  withBrand(brand: string): this {
    this.data.brand = brand;
    return this;
  }
  
  /**
   * Set the materials used in the luxury item
   * @param materials Array of material names
   */
  withMaterials(materials: string[]): this {
    this.data.materials = materials;
    return this;
  }
  
  /**
   * Set the exclusivity level of the luxury item
   * @param exclusivity The exclusivity level
   */
  withExclusivity(exclusivity: 'limited' | 'standard' | 'exclusive' | 'bespoke'): this {
    this.data.exclusivity = exclusivity;
    return this;
  }
  
  /**
   * Build and return the configured LuxuryItem
   * @returns A new LuxuryItem instance
   * @throws Error if required fields are missing
   */
  build(): LuxuryItem {
    // Validate required fields
    if (!this.data.name || !this.data.price || !this.data.category) {
      throw new Error('Missing required fields: name, price and category are required');
    }
    
    // Ensure materials array exists
    if (!this.data.materials) {
      this.data.materials = [];
    }
    
    // Set default brand if not provided
    if (!this.data.brand) {
      this.data.brand = 'LuxuryVista';
    }
    
    // Set default exclusivity if not provided
    if (!this.data.exclusivity) {
      this.data.exclusivity = 'standard';
    }
    
    return new LuxuryProduct({
      ...this.data as Omit<LuxuryItem, 'id'>
    });
  }
}

/**
 * Factory class for creating different types of luxury items
 */
export class LuxuryItemFactory {
  /**
   * Create a jewelry item
   * @param name Name of the jewelry piece
   * @param price Price in the default currency
   * @param materials Array of materials used
   * @returns A LuxuryItem instance configured as jewelry
   */
  static createJewelry(name: string, price: number, materials: string[]): LuxuryItem {
    return new LuxuryProduct({
      name,
      price,
      category: 'jewelry',
      brand: 'LuxuryVista',
      materials,
      exclusivity: materials.includes('diamond') ? 'exclusive' : 'standard'
    });
  }
  
  /**
   * Create a watch item
   * @param name Name of the watch
   * @param price Price in the default currency
   * @param brand Brand of the watch
   * @returns A LuxuryItem instance configured as a watch
   */
  static createWatch(name: string, price: number, brand: string): LuxuryItem {
    return new LuxuryProduct({
      name,
      price,
      category: 'watches',
      brand,
      materials: ['steel', 'sapphire crystal'],
      exclusivity: price > 10000 ? 'limited' : 'standard'
    });
  }

  /**
   * Create a custom luxury item
   * @param data All required properties except id
   * @returns A custom configured LuxuryItem
   */
  static createCustom(data: Omit<LuxuryItem, 'id'>): LuxuryItem {
    return new LuxuryProduct(data);
  }
}

/**
 * Type definition for observers that will receive notifications
 */
export type Observer<T> = (data: T) => void;

/**
 * Observable implementation for pub/sub pattern
 * @template T - Type of data to be observed
 */
export class Observable<T> {
  private observers: Observer<T>[] = [];
  
  /**
   * Subscribe to notifications
   * @param observer Function to call when data changes
   * @returns Unsubscribe function
   */
  subscribe(observer: Observer<T>): () => void {
    this.observers.push(observer);
    
    // Return unsubscribe function
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }
  
  /**
   * Notify all observers with new data
   * @param data The data to send to observers
   */
  notify(data: T): void {
    this.observers.forEach(observer => observer(data));
  }
}

/**
 * Generic store for managing collections of items
 * @template T - Type of items stored, must extend the base Item interface
 */
export class Store<T extends Item> {
  private items: T[] = [];
  private itemsById = new Map<string, T>();
  
  /**
   * Add an item to the store
   * @param item - The item to add
   */
  addItem(item: T): void {
    this.items.push(item);
    this.itemsById.set(item.id, item);
  }
  
  /**
   * Find an item by its ID
   * @param id - The ID to search for
   * @returns The item if found, undefined otherwise
   */
  findById(id: string): T | undefined {
    return this.itemsById.get(id);
  }
  
  /**
   * Filter items based on a predicate function
   * @param predicate - Function that tests each item
   * @returns Array of items that satisfy the predicate
   */
  filter(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }
  
  /**
   * Get all items in the store
   * @returns Array of all items
   */
  getAll(): T[] {
    return [...this.items];
  }
  
  /**
   * Delete an item by ID
   * @param id - ID of the item to delete
   * @returns true if the item was deleted, false if not found
   */
  deleteById(id: string): boolean {
    if (!this.itemsById.has(id)) return false;
    
    this.items = this.items.filter(item => item.id !== id);
    this.itemsById.delete(id);
    return true;
  }
  
  /**
   * Update an existing item
   * @param id - ID of the item to update
   * @param updates - Partial object with properties to update
   * @returns true if updated, false if not found
   */
  updateItem(id: string, updates: Partial<T>): boolean {
    const item = this.findById(id);
    if (!item) return false;
    
    Object.assign(item, updates);
    return true;
  }
}

/**
 * Virtual list implementation for paginated display of luxury items
 */
export class VirtualLuxuryItemList {
  private allItems: LuxuryItem[] = [];
  private visibleItems: LuxuryItem[] = [];
  private pageSize = 20;
  private currentPage = 0;
  
  /**
   * Create a new virtual list with pagination
   * @param items Initial items to populate the list
   * @param pageSize Optional page size (default: 20)
   */
  constructor(items: LuxuryItem[], pageSize?: number) {
    this.allItems = items;
    if (pageSize !== undefined && pageSize > 0) {
      this.pageSize = pageSize;
    }
    this.updateVisibleItems();
  }
  
  /**
   * Update the list of visible items based on current page
   */
  private updateVisibleItems(): void {
    const start = this.currentPage * this.pageSize;
    this.visibleItems = this.allItems.slice(start, start + this.pageSize);
  }
  
  /**
   * Move to the next page if available
   * @returns Current visible items after navigation
   */
  nextPage(): LuxuryItem[] {
    if ((this.currentPage + 1) * this.pageSize < this.allItems.length) {
      this.currentPage++;
      this.updateVisibleItems();
    }
    return this.visibleItems;
  }
  
  /**
   * Move to the previous page if available
   * @returns Current visible items after navigation
   */
  previousPage(): LuxuryItem[] {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateVisibleItems();
    }
    return this.visibleItems;
  }
  
  /**
   * Get the currently visible items
   * @returns Array of visible items on the current page
   */
  getVisibleItems(): LuxuryItem[] {
    return this.visibleItems;
  }
  
  /**
   * Get the total number of pages
   * @returns Number of pages available
   */
  getTotalPages(): number {
    return Math.ceil(this.allItems.length / this.pageSize);
  }
  
  /**
   * Get the current page number (0-based)
   * @returns Current page index
   */
  getCurrentPage(): number {
    return this.currentPage;
  }
  
  /**
   * Go to a specific page
   * @param page The page number to go to (0-based)
   * @returns Current visible items after navigation
   */
  goToPage(page: number): LuxuryItem[] {
    if (page >= 0 && page < this.getTotalPages()) {
      this.currentPage = page;
      this.updateVisibleItems();
    }
    return this.visibleItems;
  }
  
  /**
   * Update the underlying data
   * @param items New items to display
   */
  updateItems(items: LuxuryItem[]): void {
    this.allItems = items;
    this.currentPage = 0; // Reset to first page
    this.updateVisibleItems();
  }
}

/**
 * Specialized store for luxury items with change notifications
 */
export class LuxuryStore {
  private items: LuxuryItem[] = [];
  private itemsById = new Map<string, LuxuryItem>();
  private storeChanged = new Observable<LuxuryItem[]>();
  
  /**
   * Add a luxury item to the store
   * @param item The luxury item to add
   */
  addItem(item: LuxuryItem): void {
    this.items.push(item);
    this.itemsById.set(item.id, item);
    this.storeChanged.notify([...this.items]); // Notify with immutable copy
  }
  
  /**
   * Remove a luxury item from the store
   * @param id The ID of the item to remove
   * @returns true if item was removed, false if not found
   */
  removeItem(id: string): boolean {
    if (!this.itemsById.has(id)) return false;
    
    this.items = this.items.filter(item => item.id !== id);
    this.itemsById.delete(id);
    this.storeChanged.notify([...this.items]);
    return true;
  }
  
  /**
   * Update an existing luxury item
   * @param id The ID of the item to update
   * @param updates Partial object with properties to update
   * @returns true if updated, false if not found
   */
  updateItem(id: string, updates: Partial<LuxuryItem>): boolean {
    const item = this.itemsById.get(id);
    if (!item) return false;
    
    Object.assign(item, updates);
    this.storeChanged.notify([...this.items]);
    return true;
  }
  
  /**
   * Get all luxury items
   * @returns Immutable copy of all items
   */
  getItems(): LuxuryItem[] {
    return [...this.items];
  }
  
  /**
   * Find a luxury item by ID
   * @param id The ID to search for
   * @returns The item if found, undefined otherwise
   */
  findById(id: string): LuxuryItem | undefined {
    return this.itemsById.get(id);
  }
  
  /**
   * Subscribe to store changes
   * @param callback Function to call when store changes
   * @returns Unsubscribe function
   */
  onStoreChanged(callback: Observer<LuxuryItem[]>): () => void {
    return this.storeChanged.subscribe(callback);
  }
}