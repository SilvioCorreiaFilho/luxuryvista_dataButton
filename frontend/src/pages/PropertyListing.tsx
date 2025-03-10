import React, { useEffect, useState } from 'react';
import { LanguageProvider } from '../utils/languageContext';
import { TranslatedText } from '../components/TranslatedText';
import { TranslatedInput } from '../components/TranslatedInput';
import { usePropertyStore } from '../utils/propertyStore';
import { Property } from '../utils/property-types';

import { LuxuryPropertyCard } from '../components/LuxuryPropertyCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MinimalNavbar } from '../components/MinimalNavbar';

export default function PropertyListing() {
  return (
    <LanguageProvider>
      <PropertyListingContent />
    </LanguageProvider>
  );
}

const PropertyListingContent = () => {
  const { properties, isLoading: loading, error: storeError, fetchProperties } = usePropertyStore();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('price-desc');
  const [error, setError] = useState<Error | null>(null);

  if (error || storeError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">
          <TranslatedText text="Erro ao carregar imóveis" />: {error?.message || storeError}
        </p>
      </div>
    );
  }

  // Fetch properties
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties, sortBy]);



  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar />
      <main className="min-h-screen pt-28">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-light tracking-wide">
              <TranslatedText text="Imóveis de Luxo" />
            </h1>
            <p className="text-gray-600 mt-2 font-light text-lg">
              <TranslatedText text="Descubra propriedades exclusivas em localizações privilegiadas" />
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value)}
              options={[
                { value: 'price-desc', label: <TranslatedText text="Preço: Maior para menor" /> },
                { value: 'price-asc', label: <TranslatedText text="Preço: Menor para maior" /> },
              ]}
              className="w-48"
            />

            <div className="flex space-x-2">
              <Button
                variant={view === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setView('grid')}
              >
                <i className="fas fa-grid-2" />
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setView('list')}
              >
                <i className="fas fa-list" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TranslatedInput
            placeholder="Buscar por localização, tipo..."
            className="md:col-span-2 h-12"
          />
          <Select
            placeholder={<TranslatedText text="Tipo de Imóvel" />}
            options={[
              { value: 'all', label: <TranslatedText text="Todos os tipos" /> },
              { value: 'mansion', label: <TranslatedText text="Mansão" /> },
              { value: 'penthouse', label: <TranslatedText text="Cobertura" /> },
              { value: 'villa', label: <TranslatedText text="Villa" /> },
              { value: 'farm', label: <TranslatedText text="Fazenda" /> },
            ]}
          />
          <Select
            placeholder={<TranslatedText text="Preço" />}
            options={[
              { value: 'all', label: <TranslatedText text="Qualquer preço" /> },
              { value: '5-10', label: <TranslatedText text="R$ 5M - R$ 10M" /> },
              { value: '10-15', label: <TranslatedText text="R$ 10M - R$ 15M" /> },
              { value: '15-20', label: <TranslatedText text="R$ 15M - R$ 20M" /> },
              { value: '20+', label: <TranslatedText text="Acima de R$ 20M" /> },
            ]}
          />
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 'space-y-6'}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeleton key={n} className="aspect-[4/3] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 'space-y-6'}>
            {properties.map((property) => (
              <LuxuryPropertyCard
                key={property.id}
                property={property}
                className={view === 'list' ? 'md:flex md:h-48' : ''}
              />
            ))}
          </div>
        )}
      </div>
        </div>
      </main>
    </div>
  );
}
