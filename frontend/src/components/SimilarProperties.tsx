import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TranslatedText } from './TranslatedText';
import { Building2, MapPin } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { useNavigate } from 'react-router-dom';
import brain from 'brain';
import { Property } from 'utils/property-types';

interface Props {
  currentPropertyId: string;
  neighborhood: string;
  propertyType: string;
  priceRange: [number, number];
  isLoading?: boolean;
  className?: string;
}

export function SimilarProperties({
  currentPropertyId,
  neighborhood,
  propertyType,
  priceRange,
  isLoading = false,
  className = ''
}: Props) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSimilarProperties = async () => {
      try {
        // Use search_properties to find similar properties
        const response = await brain.search_properties({
          query: `${propertyType} in ${neighborhood}`,
          sort: 'price',
          order: 'asc'
        });
        const data = await response.json();
        
        // Filter out the current property and limit to 3 similar properties
        const similarProperties = data.properties
          .filter((p: Property) => p.id !== currentPropertyId)
          .slice(0, 3);
          
        setProperties(similarProperties);
      } catch (err: any) {
        console.error('Error fetching similar properties:', err);
        setError(err);
      }
    };

    fetchSimilarProperties();
  }, [currentPropertyId, neighborhood, propertyType, priceRange]);

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/PropertyDetail?id=${propertyId}`);
  };

  if (error) {
    return null; // Hide section on error
  }

  return (
    <Card className={`overflow-hidden bg-white border-gray-100 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <CardTitle>
            <TranslatedText text="Imóveis Similares" />
          </CardTitle>
        </div>
        <CardDescription>
          <TranslatedText text="Outras opções que podem te interessar" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full h-48 rounded-lg" />
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <button
                key={property.id}
                onClick={() => handlePropertyClick(property.id)}
                className="group text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                    <OptimizedImage
                      src={property.images?.[0]?.url || ''}
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-200">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{property.neighborhood || property.location?.name}</span>
                    </div>
                    <p className="text-lg font-bold text-primary mt-2">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0
                      }).format(typeof property.price === 'number' ? property.price : Number(property.price) || 0)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
