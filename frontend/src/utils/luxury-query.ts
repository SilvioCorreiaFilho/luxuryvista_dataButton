import { LuxuryItem, LuxuryStore } from './luxury-item';

/**
 * Query builder for filtering luxury items
 */
export class LuxuryQuery {
  private store: LuxuryStore;
  private filters: ((item: LuxuryItem) => boolean)[] = [];
  
  /**
   * Create a new query builder for the store
   * @param store The luxury store to query
   */
  constructor(store: LuxuryStore) {
    this.store = store;
  }
  
  /**
   * Filter items by category
   * @param category The category to filter by
   */
  byCategory(category: string): this {
    this.filters.push(item => item.category === category);
    return this;
  }
  
  /**
   * Filter items by price range
   * @param min Minimum price (inclusive)
   * @param max Maximum price (inclusive)
   */
  byPriceRange(min: number, max: number): this {
    this.filters.push(item => item.price >= min && item.price <= max);
    return this;
  }
  
  /**
   * Filter items by brand
   * @param brand The brand to filter by
   */
  byBrand(brand: string): this {
    this.filters.push(item => item.brand === brand);
    return this;
  }
  
  /**
   * Filter items by exclusivity level
   * @param exclusivity The exclusivity level to filter by
   */
  byExclusivity(exclusivity: 'limited' | 'standard' | 'exclusive' | 'bespoke'): this {
    this.filters.push(item => item.exclusivity === exclusivity);
    return this;
  }
  
  /**
   * Filter items that contain any of the specified materials
   * @param materials Array of materials to search for
   */
  hasMaterial(materials: string[]): this {
    this.filters.push(item => 
      item.materials.some(material => 
        materials.includes(material)
      )
    );
    return this;
  }
  
  /**
   * Filter items with a name that includes the search term
   * @param search Search string (case insensitive)
   */
  nameContains(search: string): this {
    const lowerSearch = search.toLowerCase();
    this.filters.push(item => 
      item.name.toLowerCase().includes(lowerSearch)
    );
    return this;
  }
  
  /**
   * Execute the query and return matching items
   * @returns Array of items matching all filters
   */
  execute(): LuxuryItem[] {
    return this.store.getItems().filter(item => 
      this.filters.every(filter => filter(item))
    );
  }
  
  /**
   * Execute the query and return a paginated virtual list
   * @param pageSize Optional page size for the virtual list
   * @returns VirtualLuxuryItemList containing the query results
   */
  executeAsList(pageSize?: number): VirtualLuxuryItemList {
    const results = this.execute();
    return new VirtualLuxuryItemList(results, pageSize);
  }
  
  /**
   * Clear all filters
   */
  reset(): this {
    this.filters = [];
    return this;
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

// Extend the LuxuryStore to add query capabilities
declare module './luxury-item' {
  interface LuxuryStore {
    query(): LuxuryQuery;
  }
}

// Add query method to LuxuryStore prototype
import { LuxuryStore as OriginalLuxuryStore } from './luxury-item';

// Extend the LuxuryStore prototype with the query method
OriginalLuxuryStore.prototype.query = function(): LuxuryQuery {
  return new LuxuryQuery(this);
};
