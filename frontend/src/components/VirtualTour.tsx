import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TranslatedText } from './TranslatedText';
import { Box } from 'lucide-react';

interface Props {
  tourUrl: string;
  isLoading?: boolean;
  className?: string;
}

export function VirtualTour({ tourUrl, isLoading = false, className = '' }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleIframeLoad = () => {
      if (iframeRef.current) {
        iframeRef.current.style.height = '500px';
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, []);

  return (
    <Card className={`overflow-hidden bg-white border-gray-100 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-primary" />
          <CardTitle>
            <TranslatedText text="Tour Virtual 360°" />
          </CardTitle>
        </div>
        <CardDescription>
          <TranslatedText text="Explore o imóvel em realidade virtual" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full h-[500px] rounded-lg" />
        ) : (
          <div className="relative w-full overflow-hidden rounded-lg">
            <iframe
              ref={iframeRef}
              src={tourUrl}
              className="w-full border-0"
              allow="accelerometer; autoplay; camera; gyroscope; magnetometer"
              allowFullScreen
              loading="lazy"
              title="Tour Virtual 360°"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
