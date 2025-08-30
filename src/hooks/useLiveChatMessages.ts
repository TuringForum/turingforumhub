import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { toast } from './use-toast';

interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  room_id: string;
  created_at: string;
}

interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  is_online: boolean;
}

export const useLiveChatMessages = (roomId: string | null) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      setParticipants([]);
      return;
    }

    fetchMessages();
    fetchParticipants();

    // Set up real-time subscription for messages
    const messagesChannel = supabase
      .channel(`livechat-messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'livechat_messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const rawMessage = payload.new as any;
          
          // Fetch user profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('nickname, avatar_url')
            .eq('user_id', rawMessage.user_id)
            .maybeSingle();
          
          const newMessage: ChatMessage = {
            id: rawMessage.id,
            content: rawMessage.content,
            user_id: rawMessage.user_id,
            user_name: profile?.nickname || 'Unknown User',
            user_avatar: profile?.avatar_url,
            room_id: rawMessage.room_id,
            created_at: rawMessage.created_at,
          };
          
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    // Set up real-time subscription for participants
    const participantsChannel = supabase
      .channel(`livechat-participants-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'livechat_participants',
          filter: `room_id=eq.${roomId}`
        },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [roomId]);

  const fetchMessages = async () => {
    if (!roomId) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('livechat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      // Fetch user profiles separately
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (msg: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nickname, avatar_url')
            .eq('user_id', msg.user_id)
            .maybeSingle();
          
          return {
            id: msg.id,
            content: msg.content,
            user_id: msg.user_id,
            user_name: profile?.nickname || 'Unknown User',
            user_avatar: profile?.avatar_url,
            room_id: msg.room_id,
            created_at: msg.created_at,
          };
        })
      );

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    if (!roomId) return;

    try {
      const { data, error } = await (supabase as any)
        .from('livechat_participants')
        .select('user_id')
        .eq('room_id', roomId);

      if (error) throw error;

      // Fetch user profiles separately
      const participantsWithProfiles = await Promise.all(
        (data || []).map(async (p: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nickname, avatar_url')
            .eq('user_id', p.user_id)
            .maybeSingle();
          
          return {
            id: p.user_id,
            name: profile?.nickname || 'Unknown User',
            avatar: profile?.avatar_url,
            is_online: true, // For now, assume all participants are online
          };
        })
      );

      setParticipants(participantsWithProfiles);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!user || !roomId || !content.trim()) return false;

    try {
      const { error } = await (supabase as any)
        .from('livechat_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    messages,
    participants,
    loading,
    sendMessage,
  };
};