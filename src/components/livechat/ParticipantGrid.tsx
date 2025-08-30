import { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VideoOff, MicOff, Mic } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

interface ParticipantGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: Participant[];
  isVideoEnabled: boolean;
  currentUserId: string;
}

export const ParticipantGrid = ({
  localStream,
  remoteStreams,
  participants,
  isVideoEnabled,
  currentUserId
}: ParticipantGridProps) => {
  const { profile } = useProfile();
  
  console.log('🎬 ParticipantGrid render:', {
    localStream: !!localStream,
    remoteStreamsCount: remoteStreams.size,
    participantsCount: participants.length,
    remoteStreamKeys: Array.from(remoteStreams.keys()),
    participants: participants.map(p => ({ id: p.id, name: p.name }))
  });
  
  const getGridCols = (participantCount: number) => {
    if (participantCount <= 1) return 'grid-cols-1';
    if (participantCount <= 2) return 'grid-cols-2';
    if (participantCount <= 4) return 'grid-cols-2';
    if (participantCount <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const totalParticipants = participants.length + 1; // +1 for local user

  return (
    <div className={`grid ${getGridCols(totalParticipants)} gap-4 h-full`}>
      {/* Local Video */}
      <ParticipantVideo
        stream={localStream}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={true}
        name={profile?.nickname || 'You'}
        avatar={profile?.avatar_url}
        isLocal={true}
      />
      
      {/* Remote Videos */}
      {participants.map((participant) => (
        <ParticipantVideo
          key={participant.id}
          stream={remoteStreams.get(participant.id) || null}
          isVideoEnabled={participant.isVideoEnabled}
          isAudioEnabled={participant.isAudioEnabled}
          name={participant.name}
          avatar={participant.avatar}
          isLocal={false}
        />
      ))}
    </div>
  );
};

interface ParticipantVideoProps {
  stream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  name: string;
  avatar?: string;
  isLocal: boolean;
}

const ParticipantVideo = ({ 
  stream, 
  isVideoEnabled, 
  isAudioEnabled, 
  name, 
  avatar, 
  isLocal 
}: ParticipantVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      const v = videoRef.current
      v.srcObject = stream
      const tryPlay = async () => {
        try { await v.play() } catch (e) { console.warn('Autoplay prevented:', e) }
      }
      if (v.readyState >= 2) {
        tryPlay()
      } else {
        v.oncanplay = () => {
          tryPlay()
          v.oncanplay = null
        }
      }
    }
  }, [stream])

  return (
    <Card className="relative overflow-hidden bg-card/20 border-border/20">
      <div className="aspect-video relative">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <Avatar className="w-16 h-16 mx-auto mb-2">
                <AvatarImage src={avatar} />
                <AvatarFallback className="text-2xl">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <VideoOff className="w-6 h-6 mx-auto text-muted-foreground" />
            </div>
          </div>
        )}
        
        {/* Overlay with name and status */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {name} {isLocal && '(You)'}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              {isAudioEnabled ? (
                <Mic className="w-3 h-3 text-green-500" />
              ) : (
                <MicOff className="w-3 h-3 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};