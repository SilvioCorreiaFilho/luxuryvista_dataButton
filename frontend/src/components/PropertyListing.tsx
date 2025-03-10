import React, { useState, useEffect } from 'react';
import { VirtualList } from './VirtualList';
import { LuxuryPropertyCard } from './LuxuryPropertyCard';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';

// This would typically come from your API or store
interface FilterOptions {
  priceRange: [number, number];
  bedrooms: number | null;
  propertyType: string | null;
  location: string | null;
}

interface Props {
  /** Properties to display */
  properties: any[];
  /** Optional loading state */
  isLoading?: boolean;
  /** Optional error state */
  error?: Error | null;
  /** Optional callback for when a property is selected */
  onPropertySelect?: (property: any) => void;
  /** Optional callback for when filters change */
  onFilterChange?: (filters: FilterOptions) => void;
  /** Optional title for the listing */
  title?: string;
  /** Optional description for the listing */
  description?: string;
}

/**
 * A complete property listing component with filtering and pagination
 */
export const PropertyListing: React.FC<Props> = ({
  properties,
  isLoading = false,
  error = null,
  onPropertySelect,
  onFilterChange,
  title = "Propriedades de Luxo",
  description = "Explore nossa coleção exclusiva de propriedades de alto padrão."
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 20000000],
    bedrooms: null,
    propertyType: null,
    location: null
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Format price as BRL currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Get unique locations for the filter dropdown
  const locations = [...new Set(properties.map(p => 
    p.location?.name || p.neighborhood || '')
  )];
  
  // Get unique property types for the filter dropdown
  const propertyTypes = [...new Set(properties.map(p => 
    p.type?.name || '')
  )];
  
  // Update filters and notify parent if callback provided
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };
  
  // Filter properties based on current filter settings
  const filteredProperties = properties.filter(property => {
    const matchesPrice = property.price >= filters.priceRange[0] && 
                        property.price <= filters.priceRange[1];
    
    const matchesBedrooms = filters.bedrooms === null || 
                          property.bedrooms >= filters.bedrooms;
    
    const matchesType = filters.propertyType === null || 
                      property.type?.name === filters.propertyType;
    
    const matchesLocation = filters.location === null || 
                          (property.location?.name || property.neighborhood) === filters.location;
    
    const matchesSearch = !searchQuery || 
                        property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (property.description && property.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesPrice && matchesBedrooms && matchesType && matchesLocation && matchesSearch;
  });
  
  return (
    <div className="property-listing-container space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-3xl font-light tracking-wide">{title}</h2>
        <p className="text-neutral-500 tracking-wide font-light">{description}</p>
      </div>
      
      {/* Search and filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-grow">
            <Input
              placeholder="Buscar propriedades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 border-gray-200 focus-visible:ring-primary/30"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 h-12 border-gray-200 hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </Button>
        </div>
        
        {/* Expandable filters */}
        {showFilters && (
          <div className="p-6 bg-gray-50 rounded-md space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Price Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Faixa de Preço</label>
                <Slider
                  defaultValue={filters.priceRange}
                  min={0}
                  max={20000000}
                  step={100000}
                  onValueChange={(value) => handleFilterChange({ priceRange: value as [number, number] })}
                  className="mt-6"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{formatPrice(filters.priceRange[0])}</span>
                  <span>{formatPrice(filters.priceRange[1])}</span>
                </div>
              </div>
              
              {/* Bedrooms */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Quartos</label>
                <Select
                  value={filters.bedrooms?.toString() || ''}
                  onValueChange={(value) => handleFilterChange({ bedrooms: value ? parseInt(value) : null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Property Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Tipo de Imóvel</label>
                <Select
                  value={filters.propertyType || ''}
                  onValueChange={(value) => handleFilterChange({ propertyType: value || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    {propertyTypes.filter(Boolean).map((type, index) => (
                      <SelectItem key={index} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Location */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Localização</label>
                <Select
                  value={filters.location || ''}
                  onValueChange={(value) => handleFilterChange({ location: value || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as localizações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as localizações</SelectItem>
                    {locations.filter(Boolean).map((location, index) => (
                      <SelectItem key={index} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-between pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters({
                    priceRange: [0, 20000000],
                    bedrooms: null,
                    propertyType: null,
                    location: null
                  });
                  setSearchQuery('');
                }}
                className="text-sm"
              >
                Limpar filtros
              </Button>
              
              <Button onClick={() => setShowFilters(false)} className="text-sm">
                Aplicar
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <Separator className="my-6" />
      
      {/* Results count */}
      <div className="flex justify-between items-center">
        <p className="text-neutral-500 font-light">
          {filteredProperties.length} propriedades encontradas
        </p>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="py-12 text-center">
          <p className="text-neutral-500">Carregando propriedades...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="py-12 text-center">
          <p className="text-red-500">Erro ao carregar propriedades: {error.message}</p>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !error && filteredProperties.length === 0 && (
        <div className="py-12 text-center space-y-3">
          <p className="text-neutral-500 text-lg">Nenhuma propriedade encontrada</p>
          <p className="text-neutral-400">Tente ajustar seus filtros para ver mais opções</p>
        </div>
      )}
      
      {/* Property grid with virtual list pagination */}
      {!isLoading && !error && filteredProperties.length > 0 && (
        <VirtualList
          items={filteredProperties}
          pageSize={9}
          className="pt-6"
          keyExtractor={(property) => property.id}
          renderItem={(property) => (
            <div className="p-3">
              <LuxuryPropertyCard 
                property={property} 
                className="h-full"
              />
            </div>
          )}
          showControls={true}
          previousLabel="Anterior"
          nextLabel="Próximo"
        />
      )}
    </div>
  );
};
