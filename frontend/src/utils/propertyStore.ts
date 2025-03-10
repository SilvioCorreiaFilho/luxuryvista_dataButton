import { Property, PropertyStore } from './property-types';
import { create } from 'zustand';
import brain from '../brain';

// Helper function to ensure property data is consistent
const normalizeProperty = (property: any): Property => {
  // Ensure we have the correct structure for property_type
  if (property.type && !property.property_type) {
    property.property_type = property.type;
  }
  
  // Ensure images is an array
  if (!property.images) {
    property.images = [];
  }
  
  // Convert numeric values as needed
  if (property.price && typeof property.price === 'string') {
    property.price = parseFloat(property.price);
  }
  
  if (property.area && typeof property.area === 'string') {
    property.area = parseFloat(property.area);
  }
  
  return property as Property;
};

export const usePropertyStore = create<PropertyStore>((set) => {
  // Fetch properties on store initialization
  console.log('Initializing property store...');
  brain.get_properties2({ page: 1, size: 50 })
    .then(async (response) => {
      const data = await response.json();
      console.log('Raw property data:', data);
      if (data.properties) {
        // Debug log for property data
        console.log('Property data from API:', data.properties[0]);
        // Log property structure to help debug
        if (data.properties.length > 0) {
          console.log('Property structure check:', {
            hasId: !!data.properties[0].id,
            hasTitle: !!data.properties[0].title,
            hasPropertyType: !!data.properties[0].property_type,
            hasLocation: !!data.properties[0].location,
            hasImages: !!data.properties[0].images,
            propertyTypeStructure: typeof data.properties[0].property_type
          });
        }
        
        // Normalize all properties
        const normalizedProperties = data.properties.map(normalizeProperty);
        console.log('Normalized properties:', normalizedProperties[0]);
        
        set({ properties: normalizedProperties, isLoading: false });
      } else {
        set({ error: 'No properties found', isLoading: false });
      }
    })
    .catch(error => {
      console.error('Error fetching properties:', error);
      set({ error: 'Failed to fetch properties', isLoading: false });
    });

  return {
    properties: [] as Property[],
    isLoading: true,
    error: null as string | null,
    
    // Method to fetch properties
    fetchProperties: async () => {
      set({ isLoading: true, error: null });
      try {
        console.log('Fetching properties...');
        const response = await brain.get_properties2({ page: 1, size: 50 });
        const data = await response.json();
        if (data.properties) {
          // Log property data for debugging
          console.log(`Fetched ${data.properties.length} properties`);
          if (data.properties.length > 0) {
            console.log('Sample property:', data.properties[0]);
          }
          
          // Normalize all properties
          const normalizedProperties = data.properties.map(normalizeProperty);
          console.log('Normalized properties for consistent structure');
          
          set({ properties: normalizedProperties, isLoading: false });
        } else {
          set({ error: 'No properties found', isLoading: false });
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        set({ error: 'Failed to fetch properties', isLoading: false });
      }
    },

    // Method to add a property
    addProperty: (property: Property) => {
      set(state => ({
        properties: [...state.properties, property]
      }));
    },

    // Method to update a property
    updateProperty: (id: string, updatedProperty: Partial<Property>) => {
      set(state => ({
        properties: state.properties.map(property =>
          property.id === id
            ? { ...property, ...updatedProperty }
            : property
        )
      }));
    },

    // Method to delete a property
    deleteProperty: (id: string) => {
      set(state => ({
        properties: state.properties.filter(property => property.id !== id)
      }));
    },

    selectedProperty: null as Property | null,
    setSelectedProperty: (property: Property | null) => set({ selectedProperty: property }),
  };
});