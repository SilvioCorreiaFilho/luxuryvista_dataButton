import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Share2, Heart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "./OptimizedImage";
import media from "utils/media";

interface Image {
  id: number;
  attributes: {
    url: string;
    alternativeText?: string;
  };
}

interface Props {
  onShare?: () => void;
  onSave?: () => void;
  onSchedule?: () => void;
  propertyTitle?: string;
  stats?: {
    price: number;
    bedrooms?: number;
    bathrooms?: number;
    area: number;
  };
  status?: string;
  images: Image[];
  getImageUrl: (url: string) => string;
  onSlideClick?: () => void;
  className?: string;
}

export const ImageSlider = ({
  images,
  getImageUrl,
  onSlideClick,
  className = "",
  propertyTitle,
  stats,
  status,
  onShare,
  onSave,
  onSchedule,
}: Props) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    });
  };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        handleNext();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [currentIndex, isTransitioning]);

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      role="region"
      aria-label="Image slider"
    >
      {/* Current Image */}
      <div
        className={`relative w-full h-full cursor-pointer transition-opacity duration-500 ${isTransitioning ? 'opacity-80' : 'opacity-100'}`}
        onClick={onSlideClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSlideClick?.()}
      >
        <OptimizedImage
          src={getImageUrl(images[currentIndex].attributes.url)}
          alt={images[currentIndex].attributes.alternativeText || propertyTitle || ''}
          className="w-full h-full object-cover"
          aspectRatio="16/9"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

        {/* Status Badge */}
        {status && (
          <div className="absolute top-6 left-6 z-30">
            <div className="bg-primary/90 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium shadow-lg">
              {status}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 z-30 flex gap-3">
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              if (onShare) {
                onShare();
              } else if (navigator.share) {
                navigator.share({
                  title: propertyTitle || 'Imóvel de Luxo',
                  text: `Confira este imóvel incrível${propertyTitle ? `: ${propertyTitle}` : ''}`,
                  url: window.location.href,
                });
              }
            }}
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              if (onSave) {
                onSave();
              }
            }}
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              if (onSchedule) {
                onSchedule();
              }
            }}
          >
            <Calendar className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats Overlay */}
        {stats && (
          <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-4xl font-bold text-white">{formatPrice(stats.price)}</p>
              </div>
              <div className="h-12 w-px bg-white/30" />
              <div className="flex items-center gap-8 text-lg text-white">
                {stats.bedrooms && (
                  <div>
                    <p className="font-medium">{stats.bedrooms}</p>
                    <p className="text-white/70">Quartos</p>
                  </div>
                )}
                {stats.bathrooms && (
                  <div>
                    <p className="font-medium">{stats.bathrooms}</p>
                    <p className="text-white/70">Banheiros</p>
                  </div>
                )}
                <div>
                  <p className="font-medium">{stats.area}m²</p>
                  <p className="text-white/70">Área Total</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-20"
        onClick={handlePrevious}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-20"
        onClick={handleNext}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Image Counter */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium z-20">
        {currentIndex + 1} / {images.length}
      </div>

      {/* View All Photos Button */}
      <Button
        variant="ghost"
        className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white z-20"
        onClick={(e) => {
          e.stopPropagation();
          onSlideClick?.();
        }}
      >
        Ver Todas as Fotos
      </Button>
    </div>
  );
};
