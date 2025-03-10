import ReactPlayer from 'react-player';
import { Card } from '@/components/ui/card';

interface Props {
  url: string;
  className?: string;
  aspectRatio?: string;
  light?: boolean;
}

export const VideoPlayer = ({
  url,
  className = '',
  aspectRatio = '16/9',
  light = true
}: Props) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div
        className="relative"
        style={{ aspectRatio }}
      >
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          controls
          light={light}
          playIcon={<div className="p-4 bg-white/90 rounded-full hover:bg-white transition-colors">▶️</div>}
          config={{
            youtube: {
              playerVars: { modestbranding: 1 }
            },
            vimeo: {
              playerOptions: {
                byline: false,
                portrait: false,
                title: false
              }
            }
          }}
        />
      </div>
    </Card>
  );
};
