import { Button } from '@/components/ui/button';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  PhoneOff,
  Settings
} from 'lucide-react';

interface VideoControlsProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isConnected: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onLeave: () => void;
}

export const VideoControls = ({
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isConnected,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onLeave
}: VideoControlsProps) => {
  return (
    <div className="flex items-center justify-center space-x-4 p-4 bg-card/50 rounded-lg">
      {/* Audio Control */}
      <Button
        onClick={onToggleAudio}
        variant={isAudioEnabled ? "default" : "destructive"}
        size="lg"
        className="rounded-full w-12 h-12"
        disabled={!isConnected}
      >
        {isAudioEnabled ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </Button>
      
      {/* Video Control */}
      <Button
        onClick={onToggleVideo}
        variant={isVideoEnabled ? "default" : "destructive"}
        size="lg"
        className="rounded-full w-12 h-12"
        disabled={!isConnected}
      >
        {isVideoEnabled ? (
          <Video className="w-5 h-5" />
        ) : (
          <VideoOff className="w-5 h-5" />
        )}
      </Button>
      
      {/* Screen Share Control */}
      <Button
        onClick={onToggleScreenShare}
        variant={isScreenSharing ? "secondary" : "outline"}
        size="lg"
        className="rounded-full w-12 h-12"
        disabled={!isConnected}
      >
        {isScreenSharing ? (
          <MonitorOff className="w-5 h-5" />
        ) : (
          <Monitor className="w-5 h-5" />
        )}
      </Button>
      
      {/* Leave Call */}
      <Button
        onClick={onLeave}
        variant="destructive"
        size="lg"
        className="rounded-full w-12 h-12"
      >
        <PhoneOff className="w-5 h-5" />
      </Button>
    </div>
  );
};