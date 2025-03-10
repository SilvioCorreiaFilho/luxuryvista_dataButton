import { useState } from "react";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
  images: Image[];
  getImageUrl: (url: string) => string;
  onClose: () => void;
  open: boolean;
  initialIndex?: number;
}

export const LightboxGallery = ({
  images,
  getImageUrl,
  onClose,
  open,
  initialIndex = 0,
}: Props) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[90vw] max-h-[90vh] p-0 gap-0 border-none bg-black/95"
        onKeyDown={handleKeyDown}
      >
        <DialogDescription className="sr-only">
          Image gallery lightbox. Use arrow keys to navigate between images.
        </DialogDescription>
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10 z-50"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white hover:bg-white/10 z-50"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 text-white hover:bg-white/10 z-50"
            onClick={handleNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* Current image */}
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <OptimizedImage
              src={getImageUrl(images[currentIndex].attributes.url)}
              alt={images[currentIndex].attributes.alternativeText || ""}
              className="max-w-full max-h-full object-contain"
              aspectRatio="16/9"
            />
          </div>

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
