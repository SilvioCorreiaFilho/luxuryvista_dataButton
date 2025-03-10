import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface Props {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain';
}

export const OptimizedImage = ({
  src,
  alt,
  className = '',
  aspectRatio = '16/9',
  objectFit = 'cover'
}: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div
        className="relative"
        style={{ aspectRatio }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={`w-full h-full transition-opacity duration-300 ${objectFit === 'cover' ? 'object-cover' : 'object-contain'} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          loading="lazy"
        />
      </div>
    </Card>
  );
};
