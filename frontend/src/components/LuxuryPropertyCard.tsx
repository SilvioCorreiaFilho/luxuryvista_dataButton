import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Bath, Bed, Crown, MapPin, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Props {
  property: any; // Property from the propertyStore or brain API
  className?: string;
}

export const LuxuryPropertyCard = ({ property, className = '' }: Props) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Handle property data with consistent format
  const propertyData = property;
  const id = property.id;
  
  // Get images from the property
  const images = propertyData.images || [];
  
  // Calculate total images
  const totalImages = images.length || 0;

  // Format price to BRL
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(propertyData.price);

  // Format area with m²
  const formatArea = (area: number) => `${area.toLocaleString('pt-BR')} m²`;

  const navigateToDetail = () => {
    navigate(`/property-detail?id=${id}`);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalImages > 0) {
      setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalImages > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
    }
  };

  // Get property type
  const propertyType = propertyData.type?.name || "Luxury Property";
  
  // Get property features
  const features = propertyData.features || [];

  return (
    <Card
      className={`overflow-hidden bg-white/95 hover:shadow-lg transition-all duration-500 
        group cursor-pointer border-0 backdrop-blur-sm h-full ${className}`}
      onClick={navigateToDetail}
    >
      <div className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent 
            opacity-30 group-hover:opacity-50 transition-opacity duration-700 z-10" />
          
          {/* Property Image */}
          {totalImages > 0 ? (
            <img
              src={images[currentImageIndex].url}
              alt={propertyData.title || 'Luxury property'}
              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
              <p className="text-primary/60 text-sm tracking-wider uppercase">{propertyType}</p>
            </div>
          )}
          
          {/* Luxury Badge */}
          <div className="absolute top-4 left-4 z-20">
            <Badge variant="secondary" className="bg-white/90 text-primary hover:bg-white flex items-center 
              gap-1.5 backdrop-blur-sm border-none shadow px-2 py-1 font-light text-xs tracking-wider">
              <Crown className="w-3 h-3" />
              Coleção Luxo
            </Badge>
          </div>
          
          {/* Navigation Arrows for multiple images */}
          {totalImages > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/80 hover:bg-white border-none shadow h-8 w-8"
                onClick={prevImage}
              >
                <ArrowLeft className="h-4 w-4 text-primary" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/80 hover:bg-white border-none shadow h-8 w-8"
                onClick={nextImage}
              >
                <ArrowRight className="h-4 w-4 text-primary" />
              </Button>
            </div>
          )}
          
          {/* Property Type Badge */}
          <div className="absolute top-4 right-4 z-20">
            <Badge variant="secondary" className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm 
              border-none shadow px-2 py-1 font-light text-xs tracking-wider">
              {propertyType}
            </Badge>
          </div>
          
          {/* Price Badge */}
          <div className="absolute bottom-4 right-4 z-20">
            <Badge variant="secondary" className="bg-white/95 text-primary hover:bg-white backdrop-blur-sm 
              border-none shadow px-2 py-1 font-medium text-sm tracking-wider">
              {formattedPrice}
            </Badge>
          </div>
          
          {/* Image Counter */}
          {totalImages > 1 && (
            <div className="absolute bottom-4 left-4 bg-white/80 text-primary px-2 py-1 rounded-sm 
              text-xs font-light tracking-wider z-20 backdrop-blur-sm">
              {currentImageIndex + 1} / {totalImages}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-5 flex-grow flex flex-col">
          <div className="flex-grow space-y-4">
            {/* Title */}
            <h3 className="font-light tracking-wide text-xl line-clamp-2 group-hover:tracking-wider transition-all duration-500">
              {propertyData.title}
            </h3>
            
            {/* Location */}
            <div className="flex items-center gap-1.5 text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-sm font-light tracking-wide">
                {propertyData.location?.name || propertyData.neighborhood}
              </span>
            </div>
            
            {/* Description (if available) */}
            {propertyData.description && (
              <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-light tracking-wide">
                {typeof propertyData.description === 'string' 
                  ? propertyData.description.split('.')[0] + '.' 
                  : 'Luxury property in prime location.'}
              </p>
            )}
          </div>
          
          {/* Property Details */}
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mt-4">
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-primary/70" />
              <span className="font-light tracking-wide">{propertyData.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-primary/70" />
              <span className="font-light tracking-wide">{propertyData.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-primary/70" />
              <span className="font-light tracking-wide">
                {formatArea(propertyData.totalArea || propertyData.area)}
              </span>
            </div>
          </div>
          
          {/* Features Preview */}
          {features && features.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {(typeof features[0] === 'string' ? features : features.map((f: any) => f.name))
                  .slice(0, 3).map((feature: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-gray-100 bg-gray-50 text-gray-600 font-light tracking-wide 
                        px-2 py-0.5 text-xs hover:bg-gray-100 transition-all duration-300"
                    >
                      {typeof feature === 'string' ? 
                        feature.split(' ').slice(0, 2).join(' ') : 
                        'Premium Feature'}
                    </Badge>
                  ))}
                {features.length > 3 && (
                  <Badge
                    variant="outline"
                    className="border-gray-100 bg-gray-50 text-gray-500 font-light tracking-wide 
                      px-2 py-0.5 text-xs hover:bg-gray-100 transition-all duration-300"
                  >
                    +{features.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
