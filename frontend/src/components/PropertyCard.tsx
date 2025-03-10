import React from 'react';
import { TranslatedText } from './TranslatedText';
import { useNavigate } from 'react-router-dom';
import { PropertyCardProps } from '../utils/property-types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowUpRight, Bath, Bed, Crown, Home, Landmark, MapPin, Maximize2, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { propertyTypeTranslations } from '../utils/translations';
import { useLanguage } from '../utils/languageContext';

export function PropertyCard({ property, className, variant = 'default' }: PropertyCardProps) {
  const navigate = useNavigate();
  // Try to get language from context, default to 'pt-BR' if not available
  let language = 'pt-BR';
  try {
    const context = useLanguage();
    language = context?.language || 'pt-BR';
  } catch (e) {
    // If useLanguage fails, use default language
    console.warn('LanguageProvider not found, using default language');
  }

  // Convert price to number if it's a string, ensure it's a valid number
  const numericPrice = typeof property.price === 'string' ? parseFloat(property.price) : property.price;

  // Format price to BRL or other currency based on language
  const formattedPrice = !isNaN(numericPrice) ? new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: language === 'pt-BR' ? 'BRL' : 'USD',
    maximumFractionDigits: 0,
  }).format(numericPrice) : 'Price unavailable';

  // Format area with m²
  const formatArea = (area: number | string | undefined) => {
    if (area === undefined || area === null) return '0 m²';
    const numericArea = typeof area === 'string' ? parseFloat(area) : area;
    return !isNaN(numericArea) ? `${numericArea.toLocaleString('pt-BR')} m²` : '0 m²';
  };
  
  // Get property type display name
  const getPropertyTypeName = (propertyType: any) => {
    if (!propertyType) return 'Property';
    const typeName = typeof propertyType === 'string' ? propertyType : 
                    (propertyType.name || 'Property');
    return propertyTypeTranslations[typeName] || typeName;
  };

  const handleClick = () => {
    navigate(`/property-detail?id=${property.id}`);
  };

  // Debug check to ensure property data is valid 
  if (!property || !property.id || !property.title) {
    console.error('PropertyCard received invalid property data:', property);
    return (
      <Card className={cn(
        'group overflow-hidden transition-all duration-500',
        'border-0 bg-white/95 backdrop-blur-sm h-full',
        className
      )}>
        <div className="p-6 flex items-center justify-center h-full">
          <p className="text-red-500">Invalid property data</p>
        </div>
      </Card>
    );
  }
  
  // Ensure the property has the required fields with defaults
  const safeProperty = {
    ...property,
    property_type: property.property_type || property.type || { name: 'Property', description: null },
    location: property.location || { name: 'Unknown', description: null },
    images: property.images || [],
    features: property.features || [],
    bedrooms: property.bedrooms || (property.specifications?.bedrooms || 0),
    bathrooms: property.bathrooms || (property.specifications?.bathrooms || 0),
    area: property.area || (property.specifications?.area || 0),
    investment_metrics: property.investment_metrics || (property.analysis?.investmentMetrics || [])
  };
  
  // Price and area are properly formatted above

  return (
    <Card 
      className={cn(
        'group overflow-hidden transition-all duration-500 hover:shadow-lg',
        'border-0 bg-white/95 backdrop-blur-sm h-full',
        variant === 'default' && 'cursor-pointer',
        className
      )}
      onClick={variant === 'default' ? handleClick : undefined}
    >
      <div className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-30 group-hover:opacity-50 transition-opacity duration-700 z-10" />
          
          {/* Property Image */}
          {safeProperty.images?.[0]?.url ? (
            <img
              src={safeProperty.images[0].url}
              alt={safeProperty.title}
              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                {/* Fallback icon */}
                <Home className="w-16 h-16 text-primary/30" />
                <p className="text-primary/60 text-sm tracking-wider uppercase">{getPropertyTypeName(safeProperty.property_type)}</p>
              </div>
            </div>
          )}
          
          {/* Luxury Badge */}
          <div className="absolute top-4 left-4 z-20">
            <Badge variant="secondary" className="bg-white/90 text-primary hover:bg-white flex items-center gap-1.5 backdrop-blur-sm border-none shadow px-2 py-1 font-light text-xs tracking-wider">
              <Crown className="w-3 h-3" />
              <TranslatedText text="Coleção Luxo" fromLang="pt-BR" />
            </Badge>
          </div>
          
          {/* Property Type Badge */}
          <div className="absolute top-4 right-4 z-20">
            <Badge variant="secondary" className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm border-none shadow px-2 py-1 font-light text-xs tracking-wider">
              <TranslatedText text={getPropertyTypeName(safeProperty.property_type)} fromLang="pt-BR" />
            </Badge>
          </div>
          
          {/* Price Badge */}
          <div className="absolute bottom-4 right-4 z-20">
            <Badge variant="secondary" className="bg-white/95 text-primary hover:bg-white backdrop-blur-sm border-none shadow px-2 py-1 font-medium text-sm tracking-wider">
              {formattedPrice}
            </Badge>
          </div>
          
          {/* Investment Return */}
          {safeProperty.investment_metrics?.[0]?.percentage && (
            <div className="absolute bottom-4 left-4 z-20">
              <Badge variant="secondary" className="bg-white/90 text-green-600 hover:bg-white backdrop-blur-sm border-none shadow px-2 py-1 font-light text-xs tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" />
                {safeProperty.investment_metrics[0].percentage}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-5 flex flex-col flex-grow">
          <div className="flex-grow space-y-4">
            {/* Title */}
            <h3 className="font-light tracking-wide text-xl line-clamp-2 group-hover:tracking-wider transition-all duration-500">
              {safeProperty.title}
            </h3>
            
            {/* Location */}
            <div className="flex items-center gap-1.5 text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-sm font-light tracking-wide">
                {safeProperty.location.name}
                {safeProperty.neighborhood && `, ${safeProperty.neighborhood}`}
              </span>
            </div>
            
            {/* Description */}
            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-light tracking-wide">
              {safeProperty.description.split('.')[0]}.
            </p>
          </div>

          <Separator className="my-4 bg-gray-100" />
          
          {/* Property Details */}
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mt-2">
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-primary/70" />
              <span className="font-light tracking-wide">{safeProperty.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-primary/70" />
              <span className="font-light tracking-wide">{safeProperty.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-primary/70" />
              <span className="font-light tracking-wide">{formatArea(safeProperty.totalArea || safeProperty.area)}</span>
            </div>
          </div>
          
          {/* Features Preview */}
          {safeProperty.features && safeProperty.features.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {safeProperty.features.slice(0, 3).map((feature, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-gray-100 bg-gray-50 text-gray-600 font-light tracking-wide px-2 py-0.5 text-xs hover:bg-gray-100 transition-all duration-300"
                  >
                    <TranslatedText text={typeof feature === 'string' ? feature : feature.name} fromLang="pt-BR" />
                  </Badge>
                ))}
                {safeProperty.features.length > 3 && (
                  <Badge
                    variant="outline"
                    className="border-gray-100 bg-gray-50 text-gray-500 font-light tracking-wide px-2 py-0.5 text-xs hover:bg-gray-100 transition-all duration-300"
                  >
                    +{safeProperty.features.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* View Details */}
          <div className="mt-4 flex justify-end">
            <div className="text-xs font-light tracking-wider flex items-center gap-1 text-primary/80 hover:text-primary transition-colors group/btn cursor-pointer">
              <TranslatedText text="Ver detalhes" fromLang="pt-BR" />
              <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
