import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";

interface Props {
  images: Array<{
    id: string;
    url: string;
    description: string;
  }>;
  className?: string;
  showThumbnails?: boolean;
}

export function PropertyGallery({ images, className, showThumbnails = true }: Props) {
  const [selectedImage, setSelectedImage] = useState(
    images.length > 0 ? images[0] : null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentIndex = selectedImage ? images.findIndex(img => img.id === selectedImage.id) : 0;

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const previousImage = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  };

  if (!images.length) {
    return (
      <div className={cn('w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center', className)}>
        <p className="text-gray-500">Nenhuma imagem disponível</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image */}
      <div className="relative w-full aspect-[21/9] overflow-hidden bg-gray-100 group rounded-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        {selectedImage && (
          <img
            src={selectedImage?.url}
            alt={selectedImage?.description || 'Property image'}
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
          />
        )}

        {/* Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 transition-all z-10 border border-white/20 shadow-lg"
            onClick={previousImage}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 transition-all z-10 border border-white/20 shadow-lg"
            onClick={nextImage}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </Button>
        </div>

        {/* Fullscreen Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 right-4 h-14 w-14 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-10 border border-white/20 shadow-lg"
          onClick={() => setIsFullscreen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
        </Button>
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/98 backdrop-blur-2xl border-0 shadow-2xl">
          <DialogDescription className="sr-only">
            Fullscreen property image gallery. Use arrow buttons to navigate between images.
          </DialogDescription>
          <div className="relative h-full">
            {selectedImage && (
              <img
                src={selectedImage?.url}
                alt={selectedImage?.description || 'Property image'}
                className="w-full h-full object-contain"
              />
            )}
            
            {/* Navigation Arrows */}
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-all"
                onClick={previousImage}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-all"
                onClick={nextImage}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </Button>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-12 w-12 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-all"
              onClick={() => setIsFullscreen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Thumbnail Grid */}
      {showThumbnails && (
        <div className="grid grid-cols-6 gap-3 px-1 mt-3">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={cn(
                'relative aspect-video overflow-hidden rounded-sm',
                'hover:opacity-95 transition-all duration-500',
                selectedImage?.id === image.id ? 'ring-2 ring-primary scale-[0.97] shadow-lg' : 'ring-0'
              )}
            >
              <img
                src={image.url}
                alt={image.description || `Property thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
