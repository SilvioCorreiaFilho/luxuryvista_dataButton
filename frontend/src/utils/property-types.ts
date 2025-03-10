// Property types for the LuxuryVista application

export interface PropertyType {
  id?: string;
  name: string;
  description?: string;
}

export interface Location {
  id?: string;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyImage {
  id?: string;
  property_id?: string;
  url: string;
  caption?: string;
  is_main?: boolean;
}

export interface Feature {
  id?: string;
  name: string;
  icon?: string;
}

export interface InvestmentMetric {
  id?: string;
  property_id?: string;
  type: string;
  value: string;
  percentage: string;
  description?: string;
}

// Property model matching the backend structure
export interface Property {
  id: string;
  title: string;
  slug?: string;
  description: string;
  property_type: PropertyType;
  location: Location;
  neighborhood?: string;
  address?: string;
  price: number | string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  features?: Feature[];
  images?: PropertyImage[];
  property_video_url?: string;
  drone_video_url?: string;
  virtual_tour_url?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  investment_metrics?: InvestmentMetric[];
  tags?: string[];
  // Legacy fields for compatibility
  type?: any;
  totalArea?: number;
  analysis?: {
    investmentMetrics?: InvestmentMetric[];
  };
}

// Property store interfaces
export interface PropertyStore {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  fetchProperties: () => Promise<void>;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updatedProperty: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
}

// Property card props
export interface PropertyCardProps {
  property: Property;
  className?: string;
  variant?: 'default' | 'detail';
}
