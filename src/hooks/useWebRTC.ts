import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from './use-toast';

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

  const connect = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      setLocalStream(stream);
      
      // Initialize peer connections for existing participants
      // In a real implementation, you'd get this from your signaling server
      // For now, we'll simulate the WebRTC setup
      
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
    }
  };

  const disconnect = async () => {
    // Stop all tracks
    localStream?.getTracks().forEach(track => track.stop());
    screenShare?.getTracks().forEach(track => track.stop());
    
    // Close peer connections
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    
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
      }
    }
  }, [localStream]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

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