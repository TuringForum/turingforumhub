import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

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
  const { profile } = useProfile();
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
  const sessionIdRef = useRef<string>(
    (globalThis.crypto && 'randomUUID' in globalThis.crypto)
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

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
             from: sessionIdRef.current
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
    
    let stream: MediaStream | null = null;
    
    try {
      // Try to get user media, but allow connection without it
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        setIsVideoEnabled(true);
        setIsAudioEnabled(true);
      } catch (mediaError) {
        console.warn('Could not access camera/microphone:', mediaError);
        setIsVideoEnabled(false);
        setIsAudioEnabled(false);
        toast({
          title: 'Media Access Denied',
          description: 'You can still view others but cannot share your camera/microphone',
        });
      }

      // Join Supabase realtime channel
      channel.current = supabase.channel(`webrtc:${roomId}`)
        .on('presence', { event: 'sync' }, () => {
          const state = channel.current.presenceState();
          const participantList = Object.values(state).flat() as Participant[];
          setParticipants(participantList.filter(p => p.id !== sessionIdRef.current));
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          console.log('🔵 Participant joined:', newPresences);
          // Create peer connections for new participants (only if we joined first)
          newPresences.forEach((presence: any) => {
            const participant = presence as Participant;
            console.log('🔵 Processing participant:', participant.id, 'vs current user:', userId);
            if (participant.id !== sessionIdRef.current && participant.id > sessionIdRef.current) {
              console.log('🔵 Creating offer for:', participant.id);
              // Only create offer if our ID is "smaller" to avoid race conditions
              const pc = createPeerConnection(participant.id);
              
              // Add local stream to peer connection if available
              if (stream) {
                console.log('🔵 Adding local tracks:', stream.getTracks());
                stream.getTracks().forEach(track => {
                  pc.addTrack(track, stream);
                });
              }
              
              // Add screen share tracks if currently screen sharing
              if (screenShare) {
                console.log('🔵 Adding screen share tracks:', screenShare.getTracks());
                screenShare.getTracks().forEach(track => {
                  pc.addTrack(track, screenShare);
                });
              }

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
                     from: sessionIdRef.current
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
           if (payload.to === sessionIdRef.current) {
            console.log('🟢 Received offer from', payload.from);
            const pc = createPeerConnection(payload.from);
            
            // Add local stream to peer connection if available
            if (stream) {
              console.log('🟢 Adding local tracks to answer:', stream.getTracks());
              stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
              });
            }
            
            // Add screen share tracks if currently screen sharing
            if (screenShare) {
              console.log('🟢 Adding screen share tracks to answer:', screenShare.getTracks());
              screenShare.getTracks().forEach(track => {
                pc.addTrack(track, screenShare);
              });
            }

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
                     from: sessionIdRef.current
                  }
                });
              })
              .catch(err => {
                console.error('❌ Error handling offer:', err);
              });
          }
        })
        .on('broadcast', { event: 'answer' }, ({ payload }) => {
           if (payload.to === sessionIdRef.current) {
            console.log('Received answer from', payload.from);
            const pc = peerConnections.current.get(payload.from);
            if (pc) {
              pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
            }
          }
        })
        .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
          if (payload.to === sessionIdRef.current) {
            console.log('Received ICE candidate from', payload.from);
            const pc = peerConnections.current.get(payload.from);
            if (pc) {
              pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            }
          }
        });

      await channel.current.subscribe();

      // Track presence with proper fallback naming
      const displayName = profile?.nickname || `User ${userId?.substring(0, 8) || sessionIdRef.current.substring(0, 8)}`;
      console.log('📍 Tracking presence:', { 
        id: sessionIdRef.current, 
        name: displayName, 
        profile: profile?.nickname,
        userId: userId?.substring(0, 8),
        sessionId: sessionIdRef.current.substring(0, 8)
      });
      
      await channel.current.track({
        id: sessionIdRef.current,
        name: displayName,
        avatar: profile?.avatar_url,
        isVideoEnabled: stream ? true : false,
        isAudioEnabled: stream ? true : false
      });
      
      toast({
        title: 'Connected',
        description: 'Successfully connected to the room',
      });
    } catch (error) {
      console.error('Error connecting to room:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the room',
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
    console.log('🎥 toggleVideo called');
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        // Update presence
        if (channel.current) {
          const displayName = profile?.nickname || `User ${userId?.substring(0, 8) || sessionIdRef.current.substring(0, 8)}`;
          channel.current.track({
            id: sessionIdRef.current,
            name: displayName,
            avatar: profile?.avatar_url,
            isVideoEnabled: videoTrack.enabled,
            isAudioEnabled
          });
        }
      }
    } else {
      toast({
        title: 'No Camera Available',
        description: 'Camera access was not granted',
        variant: 'destructive',
      });
    }
  }, [localStream, isAudioEnabled, userId, profile]);

  const toggleAudio = useCallback(() => {
    console.log('🎤 toggleAudio called');
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        // Update presence
        if (channel.current) {
          const displayName = profile?.nickname || `User ${userId?.substring(0, 8) || sessionIdRef.current.substring(0, 8)}`;
          channel.current.track({
            id: sessionIdRef.current,
            name: displayName,
            avatar: profile?.avatar_url,
            isVideoEnabled,
            isAudioEnabled: audioTrack.enabled
          });
        }
      }
    } else {
      toast({
        title: 'No Microphone Available',
        description: 'Microphone access was not granted',
        variant: 'destructive',
      });
    }
  }, [localStream, isVideoEnabled, userId, profile]);

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      screenShare?.getTracks().forEach(track => track.stop());
      
      // Replace screen share tracks with regular camera tracks in all peer connections
      peerConnections.current.forEach((pc, peerId) => {
        const senders = pc.getSenders();
        senders.forEach(sender => {
          if (sender.track && sender.track.kind === 'video') {
            // Replace with local camera track if available
            const localVideoTrack = localStream?.getVideoTracks()[0];
            if (localVideoTrack) {
              sender.replaceTrack(localVideoTrack);
            } else {
              // Remove the track if no local video
              pc.removeTrack(sender);
            }
          }
        });

        // Renegotiate after stopping screen share
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .then(() => {
            if (channel.current) {
              channel.current.send({
                type: 'broadcast',
                event: 'offer',
                payload: {
                  offer: pc.localDescription,
                  to: peerId,
                  from: sessionIdRef.current,
                },
              });
            }
          })
          .catch(err => console.error('❌ Renegotiation error (stop share):', err));
      });
      
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
        
        // Add screen share tracks to all existing peer connections
        const screenVideoTrack = displayStream.getVideoTracks()[0];
        if (screenVideoTrack) {
          peerConnections.current.forEach((pc, peerId) => {
            console.log('🖥️ Adding screen share track to peer:', peerId);
            const senders = pc.getSenders();
            const videoSender = senders.find(sender => sender.track && sender.track.kind === 'video');
            
            if (videoSender) {
              // Replace existing video track with screen share
              videoSender.replaceTrack(screenVideoTrack);
            } else {
              // Add screen share track if no video track exists
              pc.addTrack(screenVideoTrack, displayStream);
            }

            // Force renegotiation so peers receive the new track
            pc.createOffer()
              .then(offer => pc.setLocalDescription(offer))
              .then(() => {
                if (channel.current) {
                  channel.current.send({
                    type: 'broadcast',
                    event: 'offer',
                    payload: {
                      offer: pc.localDescription,
                      to: peerId,
                      from: sessionIdRef.current,
                    },
                  });
                }
              })
              .catch(err => console.error('❌ Renegotiation error (start share):', err));
          });
        }
        
        // Handle when user stops sharing via browser controls
        if (screenVideoTrack) {
          screenVideoTrack.onended = () => {
            // Replace screen share tracks with regular camera tracks
            peerConnections.current.forEach((pc, peerId) => {
              const senders = pc.getSenders();
              senders.forEach(sender => {
                if (sender.track && sender.track.kind === 'video') {
                  const localVideoTrack = localStream?.getVideoTracks()[0];
                  if (localVideoTrack) {
                    sender.replaceTrack(localVideoTrack);
                  } else {
                    pc.removeTrack(sender);
                  }
                }
              });

              // Renegotiate after user stops sharing via browser controls
              pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                  if (channel.current) {
                    channel.current.send({
                      type: 'broadcast',
                      event: 'offer',
                      payload: {
                        offer: pc.localDescription,
                        to: peerId,
                        from: sessionIdRef.current,
                      },
                    });
                  }
                })
                .catch(err => console.error('❌ Renegotiation error (ended share):', err));
            });
            
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
        const settings = screenVideoTrack?.getSettings();
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
          from: sessionIdRef.current,
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