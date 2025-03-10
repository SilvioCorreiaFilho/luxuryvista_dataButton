export interface PropertyType {
  name: string;
  description: string;
}

export interface Location {
  name: string;
  description: string;
}

export interface InvestmentMetric {
  type: string;
  value: string;
  percentage: string;
}

export interface PropertyAnalysis {
  investmentMetrics: InvestmentMetric[];
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  location: Location;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  features: string[];
  images: { url: string }[];
  analysis: PropertyAnalysis;
}

export interface PropertyStore {
  properties: Property[];
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId: number;
}

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: Property['propertyType'];
  location?: string;
  status?: Property['status'];
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  preferred_contact: 'email' | 'phone' | 'whatsapp';
  language: 'pt-BR' | 'en';
  investment_preferences: {
    min_price: number;
    max_price: number;
    property_types: string[];
    regions: string[];
    amenities: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  search_params: {
    query: string;
    filters: Record<string, any>;
  };
  created_at: string;
}

export interface ViewingHistory {
  id: string;
  user_id: string;
  property_id: string;
  viewed_at: string;
}

export interface FavoriteProperty {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}
