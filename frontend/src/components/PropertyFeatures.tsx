import React from 'react';
import { PropertyFeature } from '../utils/property-types';
import { cn } from '@/lib/utils';

interface Props {
  features: PropertyFeature[];
  className?: string;
}

export function PropertyFeatures({ features, className }: Props) {
  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    const category = feature.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, PropertyFeature[]>);

  if (!features.length) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-2xl font-semibold">Características</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <div key={category} className="space-y-4">
            <h4 className="text-lg font-medium capitalize">{category}</h4>
            
            <div className="grid grid-cols-1 gap-3">
              {categoryFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center space-x-3 text-gray-700"
                >
                  {feature.icon && (
                    <span className="text-xl">
                      <i className={`fas fa-${feature.icon}`} />
                    </span>
                  )}
                  <span>{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
