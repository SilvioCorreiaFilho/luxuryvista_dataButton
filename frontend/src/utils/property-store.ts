import { create } from 'zustand';
import { supabase } from './supabase';
import { Property, PropertyImage, PropertyFeature } from './property-types';

interface PropertyState {
  // Current property being viewed
  currentProperty: Property | null;
  currentPropertyImages: PropertyImage[];
  currentPropertyFeatures: PropertyFeature[];
  
  // Loading states
  loading: boolean;
  error: Error | null;
  
  // Actions
  fetchProperty: (id: string) => Promise<void>;
  fetchPropertyImages: (propertyId: string) => Promise<void>;
  fetchPropertyFeatures: (propertyId: string) => Promise<void>;
  reset: () => void;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  // Initial state
  currentProperty: null,
  currentPropertyImages: [],
  currentPropertyFeatures: [],
  loading: false,
  error: null,

  // Fetch a single property by ID
  fetchProperty: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const { data: property, error } = await supabase
        .from('properties')
        .select(`
          *,
          images: property_images (*),
          features: property_feature_links (
            feature: property_features (*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!property) {
        throw new Error('Propriedade não encontrada');
      }
      
      // Transform the data to match our types
      const transformedProperty: Property = {
        ...property,
        totalArea: property.total_area,
        builtArea: property.built_area,
        yearBuilt: property.year_built,
        propertyType: property.property_type,
        listingType: property.listing_type,
        createdAt: property.created_at,
        updatedAt: property.updated_at,
        ownerId: property.owner_id,
        // Images and features are handled separately
      };
      
      set({ 
        currentProperty: transformedProperty,
        loading: false 
      });
      
      // Fetch related data
      await get().fetchPropertyImages(id);
      await get().fetchPropertyFeatures(id);
      
    } catch (error) {
      console.error('Error fetching property:', error);
      set({ error: error as Error, loading: false });
    }
  },

  // Fetch property images
  fetchPropertyImages: async (propertyId: string) => {
    try {
      const { data: images, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('order_index');
      
      if (error) throw error;
      
      const transformedImages: PropertyImage[] = images.map(img => ({
        ...img,
        propertyId: img.property_id,
        isPrimary: img.is_primary,
        orderIndex: img.order_index,
        createdAt: img.created_at
      }));
      
      set({ currentPropertyImages: transformedImages });
    } catch (error) {
      console.error('Error fetching property images:', error);
      set({ error: error as Error });
    }
  },

  // Fetch property features
  fetchPropertyFeatures: async (propertyId: string) => {
    try {
      const { data: features, error } = await supabase
        .from('property_features')
        .select(`
          *,
          property_feature_links!inner (property_id)
        `)
        .eq('property_feature_links.property_id', propertyId);
      
      if (error) throw error;
      
      const transformedFeatures: PropertyFeature[] = features.map(feature => ({
        ...feature,
        createdAt: feature.created_at
      }));
      
      set({ currentPropertyFeatures: transformedFeatures });
    } catch (error) {
      console.error('Error fetching property features:', error);
      set({ error: error as Error });
    }
  },

  // Reset the store
  reset: () => {
    set({
      currentProperty: null,
      currentPropertyImages: [],
      currentPropertyFeatures: [],
      loading: false,
      error: null
    });
  }
}));
