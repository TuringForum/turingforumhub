import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

interface WebRTCHook {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  screenShare: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  participants: Participant[];
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleScreenShare: () => void;
  sendMessage: (message: string) => void;
}

export const useWebRTC = (roomId: string, userId: string): WebRTCHook => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [screenShare, setScreenShare] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannels = useRef<Map<string, RTCDataChannel>>(new Map());
  const channel = useRef<any>(null);
  const isConnecting = useRef(false);
  const currentRoomId = useRef<string | null>(null);

  const createPeerConnection = useCallback((peerId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Create data channel for messaging
    const dataChannel = pc.createDataChannel('messages', {
      ordered: true
    });
    
    dataChannel.onopen = () => {
      console.log('Data channel opened with', peerId);
    };
    
    dataChannel.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message from', peerId, data);
    };
    
    dataChannels.current.set(peerId, dataChannel);

    // Handle incoming data channels
    pc.ondatachannel = (event) => {
      const incomingChannel = event.channel;
      incomingChannel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message from', peerId, data);
      };
      dataChannels.current.set(peerId, incomingChannel);
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('🎥 Received remote stream from', peerId, event.streams[0]);
      console.log('🎥 Stream tracks:', event.streams[0].getTracks());
      setRemoteStreams(prev => {
        const updated = new Map(prev);
        updated.set(peerId, event.streams[0]);
        console.log('🎥 Updated remote streams map:', updated);
        return updated;
      });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && channel.current) {
        channel.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate,
            to: peerId,
            from: userId
          }
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state with', peerId, ':', pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setRemoteStreams(prev => {
          const updated = new Map(prev);
          updated.delete(peerId);
          return updated;
        });
      }
    };

    peerConnections.current.set(peerId, pc);
    return pc;
  }, [userId]);

  const connect = async () => {
    if (isConnecting.current || !roomId || !userId || currentRoomId.current === roomId) {
      return;
    }
    
    isConnecting.current = true;
    currentRoomId.current = roomId;
    
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      setLocalStream(stream);

      // Join Supabase realtime channel
      channel.current = supabase.channel(`webrtc:${roomId}`)
        .on('presence', { event: 'sync' }, () => {
          const state = channel.current.presenceState();
          const participantList = Object.values(state).flat() as Participant[];
          setParticipants(participantList.filter(p => p.id !== userId));
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          console.log('🔵 Participant joined:', newPresences);
          // Create peer connections for new participants (only if we joined first)
          newPresences.forEach((presence: any) => {
            const participant = presence as Participant;
            console.log('🔵 Processing participant:', participant.id, 'vs current user:', userId);
            if (participant.id !== userId && participant.id > userId) {
              console.log('🔵 Creating offer for:', participant.id);
              // Only create offer if our ID is "smaller" to avoid race conditions
              const pc = createPeerConnection(participant.id);
              
              // Add local stream to peer connection
              console.log('🔵 Adding local tracks:', stream.getTracks());
              stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
              });

              // Create offer for new participant
              pc.createOffer().then(offer => {
                return pc.setLocalDescription(offer);
              }).then(() => {
                console.log('🔵 Sending offer to:', participant.id);
                channel.current.send({
                  type: 'broadcast',
                  event: 'offer',
                  payload: {
                    offer: pc.localDescription,
                    to: participant.id,
                    from: userId
                  }
                });
              }).catch(err => {
                console.error('❌ Error creating offer:', err);
              });
            } else {
              console.log('🔵 Not creating offer for:', participant.id, '(same user or wrong order)');
            }
          });
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          console.log('Participant left:', leftPresences);
          leftPresences.forEach((presence: any) => {
            const participant = presence as Participant;
            const pc = peerConnections.current.get(participant.id);
            if (pc) {
              pc.close();
              peerConnections.current.delete(participant.id);
            }
            setRemoteStreams(prev => {
              const updated = new Map(prev);
              updated.delete(participant.id);
              return updated;
            });
          });
        })
        .on('broadcast', { event: 'offer' }, ({ payload }) => {
          if (payload.to === userId) {
            console.log('🟢 Received offer from', payload.from);
            const pc = createPeerConnection(payload.from);
            
            // Add local stream to peer connection
            console.log('🟢 Adding local tracks to answer:', stream.getTracks());
            stream.getTracks().forEach(track => {
              pc.addTrack(track, stream);
            });

            pc.setRemoteDescription(new RTCSessionDescription(payload.offer))
              .then(() => pc.createAnswer())
              .then(answer => {
                return pc.setLocalDescription(answer);
              })
              .then(() => {
                console.log('🟢 Sending answer to:', payload.from);
                channel.current.send({
                  type: 'broadcast',
                  event: 'answer',
                  payload: {
                    answer: pc.localDescription,
                    to: payload.from,
                    from: userId
                  }
                });
              })
              .catch(err => {
                console.error('❌ Error handling offer:', err);
              });
          }
        })
        .on('broadcast', { event: 'answer' }, ({ payload }) => {
          if (payload.to === userId) {
            console.log('Received answer from', payload.from);
            const pc = peerConnections.current.get(payload.from);
            if (pc) {
              pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
            }
          }
        })
        .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
          if (payload.to === userId) {
            console.log('Received ICE candidate from', payload.from);
            const pc = peerConnections.current.get(payload.from);
            if (pc) {
              pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            }
          }
        });

      await channel.current.subscribe();

      // Track presence
      await channel.current.track({
        id: userId,
        name: 'User ' + userId.substring(0, 8),
        isVideoEnabled: true,
        isAudioEnabled: true
      });
      
      toast({
        title: 'Connected',
        description: 'Successfully connected to the room',
      });
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to access camera and microphone',
        variant: 'destructive',
      });
      throw error;
    } finally {
      isConnecting.current = false;
    }
  };

  const disconnect = async () => {
    isConnecting.current = false;
    currentRoomId.current = null;
    
    // Stop all tracks
    localStream?.getTracks().forEach(track => track.stop());
    screenShare?.getTracks().forEach(track => track.stop());
    
    // Close data channels
    dataChannels.current.forEach(channel => {
      if (channel.readyState === 'open') {
        channel.close();
      }
    });
    dataChannels.current.clear();
    
    // Close peer connections
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();

    // Unsubscribe from channel
    if (channel.current) {
      await channel.current.unsubscribe();
      channel.current = null;
    }
    
    // Clear state
    setLocalStream(null);
    setScreenShare(null);
    setRemoteStreams(new Map());
    setParticipants([]);
    setIsScreenSharing(false);
  };

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        // Update presence
        if (channel.current) {
          channel.current.track({
            id: userId,
            name: 'User ' + userId.substring(0, 8),
            isVideoEnabled: videoTrack.enabled,
            isAudioEnabled
          });
        }
      }
    }
  }, [localStream, isAudioEnabled, userId]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        // Update presence
        if (channel.current) {
          channel.current.track({
            id: userId,
            name: 'User ' + userId.substring(0, 8),
            isVideoEnabled,
            isAudioEnabled: audioTrack.enabled
          });
        }
      }
    }
  }, [localStream, isVideoEnabled, userId]);

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      screenShare?.getTracks().forEach(track => track.stop());
      setScreenShare(null);
      setIsScreenSharing(false);
      
      toast({
        title: 'Screen Share Stopped',
        description: 'You stopped sharing your screen',
      });
    } else {
      try {
        // Check if browser supports screen sharing
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          throw new Error('Screen sharing is not supported in this browser');
        }

        // Start screen sharing with enhanced options
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          } as MediaTrackConstraints,
          audio: {
            noiseSuppression: true,
            echoCancellation: true,
          } as MediaTrackConstraints,
        });
        
        setScreenShare(displayStream);
        setIsScreenSharing(true);
        
        // Handle when user stops sharing via browser controls
        const videoTrack = displayStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            setScreenShare(null);
            setIsScreenSharing(false);
            toast({
              title: 'Screen Share Ended',
              description: 'Screen sharing was stopped',
            });
          };
        }
        
        toast({
          title: 'Screen Share Started',
          description: 'You are now sharing your screen',
        });
        
        // Log what's being shared for debugging
        const settings = videoTrack?.getSettings();
        console.log('Screen share settings:', settings);
        
      } catch (error: any) {
        console.error('Error starting screen share:', error);
        
        let errorMessage = 'Failed to start screen sharing';
        
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Screen sharing permission was denied';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Screen sharing is not supported in this browser';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No screen or window available to share';
        } else if (error.name === 'AbortError') {
          errorMessage = 'Screen sharing was cancelled';
        }
        
        toast({
          title: 'Screen Share Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  const sendMessage = useCallback((message: string) => {
    // Send message through data channels to all connected peers
    dataChannels.current.forEach(channel => {
      if (channel.readyState === 'open') {
        channel.send(JSON.stringify({
          type: 'chat',
          message,
          from: userId,
        }));
      }
    });
  }, [userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
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
    sendMessage,
  };
};