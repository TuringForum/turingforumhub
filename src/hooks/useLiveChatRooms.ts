import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import type { LiveChatRoom } from '@/components/livechat/RoomList';

export const useLiveChatRooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<LiveChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
    
    // Set up real-time subscription for rooms
    const channel = supabase
      .channel('livechat-rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'livechat_rooms'
        },
        () => {
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('livechat_rooms')
        .select(`
          *
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Count participants separately for each room
      const roomsWithCounts = await Promise.all(
        (data || []).map(async (room: any) => {
          const { count } = await (supabase as any)
            .from('livechat_participants')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id);
          
          return {
            ...room,
            participant_count: count || 0
          };
        })
      );
      
      setRooms(roomsWithCounts);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rooms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (name: string, description: string, isPublic: boolean): Promise<LiveChatRoom | null> => {
    if (!user) return null;

    try {
      const { data, error } = await (supabase as any)
        .from('livechat_rooms')
        .insert({
          name,
          description,
          is_public: isPublic,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as participant
      await (supabase as any)
        .from('livechat_participants')
        .insert({
          room_id: data.id,
          user_id: user.id,
        });

      toast({
        title: 'Success',
        description: 'Room created successfully',
      });

      return data;
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create room',
        variant: 'destructive',
      });
      return null;
    }
  };

  const joinRoom = async (roomId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // First check if user is already in the room
      const { data: existing } = await (supabase as any)
        .from('livechat_participants')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();

      // If already in room, just return success
      if (existing) {
        console.log('User already in room, joining anyway');
        return true;
      }

      // If not in room, add them
      const { error } = await (supabase as any)
        .from('livechat_participants')
        .insert({
          room_id: roomId,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Joined room successfully',
      });

      return true;
    } catch (error: any) {
      console.error('Error joining room:', error);
      
      // Handle duplicate key error specifically
      if (error.code === '23505') {
        // User is already in the room, treat as success
        toast({
          title: 'Already in Room',
          description: 'You are already a participant in this room',
        });
        return true;
      }
      
      toast({
        title: 'Error',
        description: 'Failed to join room',
        variant: 'destructive',
      });
      return false;
    }
  };

  const leaveRoom = async (roomId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await (supabase as any)
        .from('livechat_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Left room successfully',
      });

      return true;
    } catch (error) {
      console.error('Error leaving room:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave room',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    rooms,
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
    refetch: fetchRooms,
  };
};