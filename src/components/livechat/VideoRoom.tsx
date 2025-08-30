import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useWebRTC } from '@/hooks/useWebRTC';
import { VideoControls } from './VideoControls';
import { ParticipantGrid } from './ParticipantGrid';
import { ScreenShareView } from './ScreenShareView';
import { 
  Video, 
  Users,
  PhoneOff,
  Monitor,
  Mic,
  VideoOff,
  MicOff
} from 'lucide-react';

interface VideoRoomProps {
  roomId: string;
  roomName: string;
  onLeave: () => void;
}

export const VideoRoom = ({ roomId, roomName, onLeave }: VideoRoomProps) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const {
    localStream,
    remoteStreams,
    screenShare,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    participants,
    connect,
    disconnect,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    sendMessage
  } = useWebRTC(roomId || '', user?.id || '');

  const hasConnected = useRef(false);

  useEffect(() => {
    if (roomId && user?.id && !hasConnected.current) {
      console.log('Starting connection to room:', roomId);
      hasConnected.current = true;
      handleConnect();
    }
    
    return () => {
      if (hasConnected.current) {
        console.log('Cleaning up video room');
        hasConnected.current = false;
        handleDisconnect();
      }
    };
  }, [roomId, user?.id]);

  const handleConnect = async () => {
    console.log('Connecting to video room...');
    setConnectionStatus('connecting');
    try {
      await connect();
      setIsConnected(true);
      setConnectionStatus('connected');
      console.log('Successfully connected to video room');
    } catch (error) {
      console.error('Failed to connect:', error);
      setConnectionStatus('disconnected');
    }
  };

  const handleDisconnect = async () => {
    console.log('Disconnecting from video room...');
    await disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  const handleLeave = () => {
    console.log('Leaving room');
    handleDisconnect();
    onLeave();
  };

  console.log('VideoRoom render - isConnected:', isConnected, 'isScreenSharing:', isScreenSharing);

  return (
    <Card className="h-full glass overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <Video className="w-5 h-5 mr-2" />
              {roomName}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge 
                variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
                className={connectionStatus === 'connected' ? 'bg-green-500' : ''}
              >
                {connectionStatus === 'connecting' && 'Connecting...'}
                {connectionStatus === 'connected' && 'Connected'}
                {connectionStatus === 'disconnected' && 'Disconnected'}
              </Badge>
              <Badge variant="outline">
                <Users className="w-3 h-3 mr-1" />
                {participants.length + 1}
              </Badge>
            </div>
          </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={toggleAudio}
            variant={isAudioEnabled ? "default" : "destructive"}
            size="sm"
            disabled={!isConnected}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
            className={isAudioEnabled ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
          >
            {isAudioEnabled ? (
              <Mic className="w-4 h-4 mr-2" />
            ) : (
              <MicOff className="w-4 h-4 mr-2" />
            )}
            {isAudioEnabled ? 'Mic On' : 'Mic Off'}
          </Button>
          <Button
            onClick={toggleVideo}
            variant={isVideoEnabled ? "default" : "destructive"}
            size="sm"
            disabled={!isConnected}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            className={isVideoEnabled ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
          >
            {isVideoEnabled ? (
              <Video className="w-4 h-4 mr-2" />
            ) : (
              <VideoOff className="w-4 h-4 mr-2" />
            )}
            {isVideoEnabled ? 'Cam On' : 'Cam Off'}
          </Button>
          <Button
            onClick={toggleScreenShare}
            variant={isScreenSharing ? "secondary" : "outline"}
            size="sm"
            disabled={!isConnected}
            title={isScreenSharing ? 'Stop screen sharing' : 'Share your screen'}
          >
            <Monitor className="w-4 h-4 mr-2" />
            {isScreenSharing ? 'Stop Share' : 'Share Screen'}
          </Button>
          <Button
            onClick={handleLeave}
            variant="destructive"
            size="sm"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 h-full">
        <div className="h-full flex flex-col">
          {/* Screen Share View */}
          {screenShare && (
            <div className="flex-1 mb-4">
              <ScreenShareView stream={screenShare} />
            </div>
          )}
          
          {/* Participants Grid */}
          <div className={`${screenShare ? 'h-32' : 'flex-1'} mb-4`}>
            <ParticipantGrid
              localStream={localStream}
              remoteStreams={remoteStreams}
              participants={participants}
              isVideoEnabled={isVideoEnabled}
              currentUserId={user?.id || ''}
            />
          </div>
          
          {/* Screen Share Notification */}
          {isScreenSharing && (
            <div className="mb-2 p-2 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-center text-primary flex items-center justify-center">
                <Monitor className="w-4 h-4 mr-2" />
                You are sharing your screen with all participants
              </p>
            </div>
          )}
          
          {/* Video Controls */}
          <VideoControls
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            isScreenSharing={isScreenSharing}
            isConnected={isConnected}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
            onToggleScreenShare={toggleScreenShare}
            onLeave={handleLeave}
          />
        </div>
      </CardContent>
    </Card>
  );
};