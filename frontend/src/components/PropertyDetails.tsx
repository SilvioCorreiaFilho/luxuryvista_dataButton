import React from 'react';
import { Property } from '../utils/property-types';
import { PropertyGallery } from './PropertyGallery';
import { cn } from '@/lib/utils';
import { propertyTypeTranslations, statusTranslations } from '../utils/translations';
import { Card } from '@/components/ui/card';
import { PropertyAnalysis } from './PropertyAnalysis';
import { Separator } from '@/components/ui/separator';

interface Props {
  property: Property;
  className?: string;
}

export function PropertyDetails({ property, className }: Props) {
  // Format price to BRL
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(property.price);

  // Format area with m²
  const formatArea = (area: number) => `${area.toLocaleString('pt-BR')} m²`;

  return (
    <div className={cn('space-y-8', className)}>
      {/* Property Gallery */}
      <PropertyGallery images={property.images} />

      {/* Header with Price */}
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">{property.title}</h1>
        <p className="text-4xl font-bold text-primary">{formattedPrice}</p>
        <p className="text-gray-600">{property.address}</p>
      </div>

      {/* Key Details */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <DetailItem
            label="Área Total"
            value={formatArea(property.totalArea)}
            icon="ruler"
          />
          <DetailItem
            label="Área Construída"
            value={formatArea(property.builtArea)}
            icon="home"
          />
          <DetailItem
            label="Quartos"
            value={property.bedrooms.toString()}
            icon="bed"
          />
          <DetailItem
            label="Banheiros"
            value={property.bathrooms.toString()}
            icon="bath"
          />
        </div>
      </Card>

      {/* Description */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Descrição</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
          {property.description}
        </p>
      </div>

      {/* Location Details */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Localização</h2>
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Bairro</p>
              <p className="font-medium">{property.neighborhood}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cidade</p>
              <p className="font-medium">{property.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <p className="font-medium">{property.state}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Details */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Informações Adicionais</h2>
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Tipo de Imóvel</p>
              <p className="font-medium capitalize">
                {propertyTypeTranslations[property.propertyType] || property.propertyType}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ano de Construção</p>
              <p className="font-medium">{property.yearBuilt}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium capitalize">{statusTranslations[property.status] || property.status}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Property Analysis */}
      {property.analysis && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Análise do Imóvel</h2>
          <PropertyAnalysis
            neighborhoodScores={property.analysis.neighborhoodScores}
            investmentMetrics={property.analysis.investmentMetrics}
            historicalData={property.analysis.historicalData}
          />
        </div>
      )}
    </div>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
  icon: string;
}

function DetailItem({ label, value, icon }: DetailItemProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="text-primary text-xl">
        <i className={`fas fa-${icon}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
