import React, { useState } from 'react';
import { TranslatedText } from './TranslatedText';
import { PropertyCard } from './PropertyCard';
import { toast } from 'sonner';
import brain from 'brain';
import { PropertyResponse } from '../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, X, ArrowRight } from 'lucide-react';

interface PropertySearchProps {
  onPropertySelected: (property: PropertyResponse) => void;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({ onPropertySelected }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PropertyResponse[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestedSearches, setSuggestedSearches] = useState<string[]>([
    'Mansão com vista para o lago em Brasília',
    'Cobertura de luxo com 4 quartos',
    'Propriedade com piscina infinita',
    'Casa moderna com estúdio de gravação',
    'Villa com arquitetura Oscar Niemeyer',
    'Propriedade de luxo com heliporto'
  ]);
  
  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Por favor, digite o que está buscando');
      return;
    }
    
    try {
      setLoading(true);
      const response = await brain.search_properties2({
        body: { query }
      });
      
      const data = await response.json();
      
      setResults(data.properties || []);
      
      // Add to recent searches if not already there
      if (!recentSearches.includes(query)) {
        const newRecentSearches = [query, ...recentSearches.slice(0, 4)];
        setRecentSearches(newRecentSearches);
      }
      
    } catch (error) {
      console.error('Error searching properties:', error);
      toast.error('Failed to search properties');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSuggestedSearch = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch();
  };
  
  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-light mb-2">
          <TranslatedText text="Busca de Propriedades com IA" fromLang="pt-BR" />
        </h2>
        <p className="text-gray-500 mb-6">
          <TranslatedText 
            text="Encontre propriedades usando linguagem natural. Nossa IA entende o que você está procurando." 
            fromLang="pt-BR" 
          />
        </p>
      </div>
      
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            <TranslatedText text="Pesquisa Inteligente" fromLang="pt-BR" />
          </CardTitle>
          <CardDescription>
            <TranslatedText 
              text="Descreva o que está procurando com suas próprias palavras" 
              fromLang="pt-BR" 
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Mansão com vista para o lago em Brasília..."
                className="pr-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {query && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button 
              onClick={handleSearch}
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              <TranslatedText text="Buscar" fromLang="pt-BR" />
            </Button>
          </div>
          
          {/* Suggested and recent searches */}
          <div className="mt-4 space-y-3">
            {recentSearches.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  <TranslatedText text="Buscas recentes:" fromLang="pt-BR" />
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, i) => (
                    <Badge 
                      key={`recent-${i}`}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleSuggestedSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                <TranslatedText text="Sugestões de busca:" fromLang="pt-BR" />
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedSearches.map((suggestion, i) => (
                  <Badge 
                    key={`suggestion-${i}`}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSuggestedSearch(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Search results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-medium">
            <TranslatedText text="Resultados da busca" fromLang="pt-BR" />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((property) => (
              <div key={property.id} className="group">
                <PropertyCard 
                  property={property} 
                  onClick={() => onPropertySelected(property)}
                  showFullDetails={false}
                />
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-sm w-full justify-between"
                    onClick={() => onPropertySelected(property)}
                  >
                    <span>
                      <TranslatedText text="Ver detalhes" fromLang="pt-BR" />
                    </span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};