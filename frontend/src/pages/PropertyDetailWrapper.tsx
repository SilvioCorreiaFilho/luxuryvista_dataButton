import React from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import PropertyDetail from './PropertyDetail';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * A wrapper component that applies an ErrorBoundary around the PropertyDetail page
 * This ensures that rendering errors in property details don't crash the entire app
 */
export default function PropertyDetailWrapper() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const propertyId = searchParams.get('id');

  if (!propertyId) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-gray-500">
          Nenhum imóvel selecionado
        </p>
        <button 
          className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
          onClick={() => navigate('/property-listing')}
        >
          Ver imóveis disponíveis
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <PropertyDetail />
    </ErrorBoundary>
  );
}
