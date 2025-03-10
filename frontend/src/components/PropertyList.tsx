import { useNavigate } from 'react-router-dom';
import { PropertyCard } from './PropertyCard';
import { usePropertyStore } from '../utils/propertyStore';
import { TranslatedText } from './TranslatedText';
import { useLanguage } from '../utils/languageContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

export interface Props {
  className?: string;
}

export const PropertyList = ({ className = '' }: Props) => {
  const navigate = useNavigate();
  const properties = usePropertyStore((state) => state.properties);
  
  // Make sure language context is available - this will throw an error if not
  try {
    useLanguage();
  } catch (error) {
    console.warn('PropertyList: Language context not available. Component may not translate correctly.');
  }

  // Debug log for properties
  console.log('PropertyList: properties loaded:', {
    count: properties.length,
  });

  return (
    <div className={`space-y-12 ${className}`}>
      {/* Section Title */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-light tracking-wide">
          <TranslatedText text="Imóveis de Alto Padrão" fromLang="pt-BR" />
        </h2>
        <p className="text-gray-600 font-light text-lg max-w-2xl mx-auto">
          <TranslatedText text="Descubra residências exclusivas em localizações privilegiadas" fromLang="pt-BR" />
        </p>
      </div>

      {/* Property Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            <TranslatedText text="Nenhum imóvel encontrado. Por favor, tente novamente mais tarde." fromLang="pt-BR" />
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {properties.map((property) => {
            // Ensure property has required fields
            if (!property || !property.id) {
              console.error('Invalid property in list:', property);
              return null;
            }
            
            return (
              <PropertyCard
                key={property.id}
                property={property}
                className="w-full"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
