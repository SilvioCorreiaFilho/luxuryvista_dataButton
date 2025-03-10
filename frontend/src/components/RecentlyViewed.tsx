import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TranslatedText } from './TranslatedText';
import { Clock, MapPin } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { useNavigate } from 'react-router-dom';
import brain from 'brain';
import { Property } from 'utils/property-types';

interface Props {
  currentPropertyId: string;
  isLoading?: boolean;
  className?: string;
}

const RECENTLY_VIEWED_KEY = 'recently_viewed_properties';
const MAX_RECENT_PROPERTIES = 4;

export function RecentlyViewed({ currentPropertyId, isLoading = false, className = '' }: Props) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Add current property to recently viewed
    const addToRecentlyViewed = () => {
      try {
        const recentIds = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
        const updatedIds = [currentPropertyId, ...recentIds.filter((id: string) => id !== currentPropertyId)]
          .slice(0, MAX_RECENT_PROPERTIES);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updatedIds));
      } catch (err) {
        console.error('Error updating recently viewed:', err);
      }
    };

    addToRecentlyViewed();
  }, [currentPropertyId]);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const recentIds = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
        // Filter out current property
        const idsToFetch = recentIds.filter((id: string) => id !== currentPropertyId);

        if (idsToFetch.length === 0) {
          setProperties([]);
          return;
        }

        // Fetch each property by ID and collect the results
        const fetchedProperties: Property[] = [];
        
        // We'll fetch properties one by one to avoid potential rate limiting
        for (const id of idsToFetch) {
          try {
            const response = await brain.get_property2({property_id: id});
            const property = await response.json();
            fetchedProperties.push(property);
          } catch (err) {
            console.error(`Error fetching property ${id}:`, err);
            // Continue with other properties even if one fails
          }
        }
        
        setProperties(fetchedProperties);
      } catch (err: any) {
        console.error('Error fetching recently viewed properties:', err);
        setError(err);
      }
    };

    fetchRecentlyViewed();
  }, [currentPropertyId]);

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/PropertyDetail?id=${propertyId}`);
  };

  if (error || properties.length === 0) {
    return null; // Hide section if there's an error or no recently viewed properties
  }

  return (
    <Card className={`overflow-hidden bg-white border-gray-100 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <CardTitle>
            <TranslatedText text="Vistos Recentemente" />
          </CardTitle>
        </div>
        <CardDescription>
          <TranslatedText text="Imóveis que você visualizou" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full h-48 rounded-lg" />
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-200 line-clamp-1">
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
