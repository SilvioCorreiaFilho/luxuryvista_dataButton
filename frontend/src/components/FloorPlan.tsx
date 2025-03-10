import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TranslatedText } from './TranslatedText';
import { LayoutPanelTop } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

interface FloorPlanImage {
  id: string;
  url: string;
  title: string;
  description?: string;
}

interface Props {
  floorPlans: FloorPlanImage[];
  isLoading?: boolean;
  className?: string;
}

export function FloorPlan({ floorPlans, isLoading = false, className = '' }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<FloorPlanImage | null>(
    floorPlans.length > 0 ? floorPlans[0] : null
  );

  return (
    <Card className={`overflow-hidden bg-white border-gray-100 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LayoutPanelTop className="w-5 h-5 text-primary" />
          <CardTitle>
            <TranslatedText text="Planta do Imóvel" />
          </CardTitle>
        </div>
        <CardDescription>
          <TranslatedText text="Visualize a planta e dimensões" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-[400px] rounded-lg" />
            <div className="flex gap-4 overflow-x-auto py-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-24 h-24 flex-shrink-0 rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Main Floor Plan Display */}
            {selectedPlan && (
              <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-100">
                <OptimizedImage
                  src={selectedPlan.url}
                  alt={selectedPlan.title}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                  <h3 className="text-white font-semibold">{selectedPlan.title}</h3>
                  {selectedPlan.description && (
                    <p className="text-white/80 text-sm">{selectedPlan.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Thumbnail Navigation */}
            {floorPlans.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-2">
                {floorPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                      selectedPlan?.id === plan.id
                        ? 'ring-2 ring-primary ring-offset-2'
                        : 'hover:ring-2 hover:ring-gray-200 hover:ring-offset-2'
                    }`}
                  >
                    <OptimizedImage
                      src={plan.url}
                      alt={plan.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
