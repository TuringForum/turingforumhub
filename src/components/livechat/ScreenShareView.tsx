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
    }
  }, [stream]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <Monitor className="w-4 h-4 mr-2" />
          Screen Share
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain bg-black"
        />
      </CardContent>
    </Card>
  );
};