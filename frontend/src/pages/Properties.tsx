import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PropertyListing } from '../components/PropertyListing';
import brain from 'brain';

/**
 * Properties page with advanced filtering and search
 */
export default function Properties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const location = useLocation();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get('category');
  const locationParam = queryParams.get('location');
  
  // Determine page title based on parameters
  const getPageTitle = () => {
    if (category) {
      const titles: Record<string, string> = {
        'cobertura': 'Coberturas Exclusivas',
        'mansao': 'Mansões de Luxo',
        'apartamento': 'Apartamentos de Alto Padrão',
        'vista-lago': 'Propriedades com Vista para o Lago',
        'luxo': 'Imóveis de Luxo e Exclusividade'
      };
      return titles[category] || 'Coleção de Imóveis de Luxo';
    }
    
    if (locationParam) {
      const titles: Record<string, string> = {
        'park-way': 'Propriedades no Park Way',
        'lago-sul': 'Imóveis no Lago Sul',
        'noroeste': 'Imóveis no Setor Noroeste',
        'sudoeste': 'Propriedades no Sudoeste'
      };
      return titles[locationParam] || 'Coleção de Imóveis de Luxo';
    }
    
    return 'Coleção de Imóveis de Luxo';
  };
  
  // Get description based on parameters
  const getPageDescription = () => {
    if (category) {
      const descriptions: Record<string, string> = {
        'cobertura': 'Explore nossas coberturas exclusivas com vistas panorâmicas e acabamento premium.',
        'mansao': 'Descubra mansões luxuosas com amplos espaços e privacidade incomparável.',
        'apartamento': 'Conheça apartamentos sofisticados com o máximo em conforto e tecnologia.',
        'vista-lago': 'Propriedades com vistas deslumbrantes para o Lago Paranoá.',
        'luxo': 'Conheça nossa curadoria de imóveis de alto padrão, selecionados pelos mais altos critérios de exclusividade, localização privilegiada e acabamentos premium.'
      };
      return descriptions[category] || 'Descubra nossa seleção exclusiva de imóveis luxuosos em localizações privilegiadas.';
    }
    
    if (locationParam) {
      const descriptions: Record<string, string> = {
        'park-way': 'Mansões e propriedades exclusivas em amplos terrenos no Park Way.',
        'lago-sul': 'Imóveis de luxo com acesso privilegiado ao Lago Paranoá.',
        'noroeste': 'Apartamentos modernos e sustentáveis no bairro mais inovador de Brasília.',
        'sudoeste': 'Propriedades com excelente infraestrutura e qualidade de vida no Sudoeste.'
      };
      return descriptions[locationParam] || 'Descubra nossa seleção exclusiva de imóveis luxuosos em localizações privilegiadas.';
    }
    
    return 'Descubra nossa seleção exclusiva de imóveis luxuosos em localizações privilegiadas. Cada propriedade é cuidadosamente selecionada para atender aos mais altos padrões de sofisticação e conforto.';
  };

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use search parameters if available
        const searchParams: any = {};
        if (category) searchParams.category = category;
        if (locationParam) searchParams.location = locationParam;
        
        const response = await brain.get_properties2();
        const data = await response.json();
        
        // Filter properties based on category or location if needed
        // This is a client-side filter that can be replaced with server-side
        // filtering if your API supports it
        let filteredProperties = data.properties ? [...data.properties] : [];
        
        if (category) {
          const categoryMapping: Record<string, string[]> = {
            'cobertura': ['Cobertura', 'Penthouse'],
            'mansao': ['Mansão', 'Casa de Luxo', 'Villa'],
            'apartamento': ['Apartamento', 'Flat'],
            'vista-lago': ['Vista para o Lago'],
            'luxo': ['Luxury', 'Luxo', 'Premium', 'Alto Padrão', 'Exclusive', 'Exclusivo']
          };
          
          const categoryValues = categoryMapping[category] || [];
          if (categoryValues.length > 0) {
            if (category === 'luxo') {
              // For luxury properties, apply multiple criteria
              filteredProperties = filteredProperties.filter(property => {
                // Check property type
                const propertyType = property.type?.name || '';
                const matchesLuxuryType = categoryValues.some(value => propertyType.includes(value));
                
                // Check tags
                const tags = property.tags || [];
                const hasLuxuryTag = tags.some(tag => 
                  ['luxury', 'luxo', 'premium', 'exclusive', 'exclusivo'].includes(tag.toLowerCase())
                );
                
                // Check price threshold (properties above 2 million are considered luxury)
                const isHighValue = property.price >= 2000000;
                
                // Check features that indicate luxury
                const features = property.features || [];
                const hasLuxuryFeatures = features.some(feature => {
                  const featureName = typeof feature === 'string' ? feature : (feature.name || '');
                  return ['piscina', 'vista panorâmica', 'home theater', 'spa', 'adega'].some(lf => 
                    featureName.toLowerCase().includes(lf.toLowerCase())
                  );
                });
                
                // Consider a property luxury if it matches at least two criteria
                return (matchesLuxuryType || hasLuxuryTag || isHighValue || hasLuxuryFeatures);
              });
            } else {
              // Regular category filtering
              filteredProperties = filteredProperties.filter(property => {
                const propertyType = property.type?.name || '';
                return categoryValues.some(value => propertyType.includes(value));
              });
            }
          }
        }
        
        if (locationParam) {
          const locationMapping: Record<string, string[]> = {
            'park-way': ['Park Way', 'SMPW'],
            'lago-sul': ['Lago Sul', 'SHIS'],
            'noroeste': ['Noroeste', 'SQNW'],
            'sudoeste': ['Sudoeste', 'SQSW']
          };
          
          const locationValues = locationMapping[locationParam] || [];
          if (locationValues.length > 0) {
            filteredProperties = filteredProperties.filter(property => {
              const propertyLocation = property.location?.name || property.neighborhood || '';
              return locationValues.some(value => propertyLocation.includes(value));
            });
          }
        }
        
        setProperties(filteredProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch properties'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [category, locationParam]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <PropertyListing
        properties={properties}
        isLoading={isLoading}
        error={error}
        title={getPageTitle()}
        description={getPageDescription()}
      />
    </div>
  );
}
