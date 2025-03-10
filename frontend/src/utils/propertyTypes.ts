export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'cobertura' | 'mansao' | 'apartamento' | 'vista-lago';
  images: string[];
  features: string[];
  area: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  coordinates?: [number, number];
}

export interface SearchError {
  message: string;
  code?: string;
}
