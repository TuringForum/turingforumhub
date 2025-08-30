import { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor } from 'lucide-react';

interface ScreenShareViewProps {
  stream: MediaStream;
}

export const ScreenShareView = ({ stream }: ScreenShareViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // Add error handling for video element
      videoRef.current.onerror = (e) => {
        console.error('Screen share video error:', e);
      };
    }
  }, [stream]);

  return (
    <Card className="h-full border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Monitor className="w-4 h-4 mr-2 text-primary" />
            <span className="gradient-text">Screen Share</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-full">
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain bg-black rounded-b-lg"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            Screen Share Active
          </div>
        </div>
      </CardContent>
    </Card>
  );
};