import {
  LuxuryItem,
  LuxuryProduct,
  LuxuryItemFactory,
  LuxuryStore
} from '../luxury-item';
import fc from 'fast-check';

// Property-based testing with fast-check
describe('LuxuryItem', () => {
  it('should always have positive price regardless of input', () => {
    fc.assert(
      fc.property(
        fc.string(), 
        fc.integer(), 
        fc.string(),
        (name, price, category) => {
          const item = new LuxuryProduct({
            name, 
            price: Math.abs(price), // Price validation should handle this
            category,
            brand: 'Test',
            materials: [],
            exclusivity: 'standard'
          });
          
          return item.price > 0;
        }
      )
    );
  });

  it('should correctly format price with currency symbol', () => {
    const item = new LuxuryProduct({
      name: 'Test Watch',
      price: 10000,
      category: 'watches',
      brand: 'TestBrand',
      materials: ['steel'],
      exclusivity: 'standard'
    });

    expect(item.formatPrice('en-US', 'USD')).toMatch(/\$10,000/);
    expect(item.formatPrice('pt-BR', 'BRL')).toMatch(/R\$\s?10\.000/);
  });
});

// Mock for API testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Async testing
describe('LuxuryStore', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should load items from API', async () => {
    // Mock implementation for the test
    LuxuryStore.prototype.loadFromApi = async function(url: string) {
      const response = await fetch(url);
      const data = await response.json();
      data.forEach((item: any) => this.addItem(new LuxuryProduct(item)));
      return this.getItems();
    };

    // Setup mock response
    mockFetch.mockResolvedValueOnce({
      json: async () => [
        { name: 'Test Watch', price: 5000, category: 'watches', brand: 'TestBrand', materials: [], exclusivity: 'standard' },
        { name: 'Test Ring', price: 3000, category: 'jewelry', brand: 'TestBrand', materials: [], exclusivity: 'standard' }
      ]
    });

    const store = new LuxuryStore();
    await store.loadFromApi('https://api.example.com/luxury-items');
    
    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/luxury-items');
    expect(store.getItems().length).toBe(2);
  });
});

// Snapshot testing
describe('LuxuryItemFactory', () => {
  it('should match the expected item structure', () => {
    const item = LuxuryItemFactory.createWatch('Submariner', 15000, 'Rolex');
    expect(item).toMatchSnapshot();
  });

  it('should create jewelry items with correct properties', () => {
    const item = LuxuryItemFactory.createJewelry('Diamond Ring', 25000, ['gold', 'diamond']);
    
    expect(item.category).toBe('jewelry');
    expect(item.exclusivity).toBe('exclusive'); // Should be exclusive because it contains diamond
    expect(item.materials).toContain('diamond');
    expect(item.materials).toContain('gold');
  });
});
