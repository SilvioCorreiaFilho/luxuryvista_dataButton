import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

interface Props {
  // Allow both array of objects with url property and array of strings
  images: (string | { url: string } | { id?: string; property_id?: string; url: string; caption?: string; is_main?: boolean })[];
  className?: string;
}

export function ImageGallery({ images, className = '' }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const previousImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? processedImages.length - 1 : prevIndex - 1
    );
    setImageError(false);
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === processedImages.length - 1 ? 0 : prevIndex + 1
    );
    setImageError(false);
  };

  // Process images to ensure we have valid URLs
  const processedImages = (images || []).map(image => {
    // Handle undefined/null images
    if (!image) {
      return { url: '' };
    }
    // Handle string URLs
    if (typeof image === 'string') {
      return { url: image };
    }
    // Handle object with url property
    if (typeof image === 'object' && 'url' in image && image.url) {
      return { url: image.url };
    }
    // Fallback for any other format - look for common image URL patterns
    if (typeof image === 'object') {
      // Try to find any property that looks like an image URL
      const possibleUrlProps = Object.entries(image)
        .find(([key, value]) => 
          typeof value === 'string' && 
          (key.includes('image') || key.includes('url') || key.includes('src') || 
          String(value).match(/\.(jpeg|jpg|gif|png|webp)$/i)));
      
      if (possibleUrlProps) {
        return { url: possibleUrlProps[1] };
      }
    }
    return { url: '' };
  }).filter(img => img.url) || [];
  
  if (!processedImages || processedImages.length === 0) {
    return (
      <div className={`relative w-full h-[600px] overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <ImageOff className="h-12 w-12 mx-auto mb-4" />
          <p>Nenhuma imagem disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-[600px] overflow-hidden rounded-lg bg-gray-100 ${className}`}>
      {/* Main Image */}
      <img
        src={processedImages[currentIndex].url}
        alt={`Imagem ${currentIndex + 1} do imóvel`}
        className={`w-full h-full object-cover transition-opacity duration-500 ${imageError ? 'opacity-0' : 'opacity-100'}`}
        onError={() => setImageError(true)}
        loading="lazy"
      />

      {/* Error Fallback */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <ImageOff className="h-12 w-12 mx-auto mb-4" />
            <p>Erro ao carregar imagem</p>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90"
          onClick={previousImage}
          aria-label="Imagem anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90"
          onClick={nextImage}
          aria-label="Próxima imagem"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Thumbnail navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2" role="tablist">
        {processedImages.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
            onClick={() => {
              setCurrentIndex(index);
              setImageError(false);
            }}
            aria-label={`Ir para imagem ${index + 1}`}
            aria-selected={index === currentIndex}
            role="tab"
          />
        ))}
      </div>
    </div>
  );
}