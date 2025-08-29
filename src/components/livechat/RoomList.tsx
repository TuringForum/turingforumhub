import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Video, Users, Lock, Globe } from 'lucide-react';

export interface LiveChatRoom {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_by: string;
  participant_count: number;
  created_at: string;
}

interface RoomListProps {
  rooms: LiveChatRoom[];
  activeRoom: string | null;
  onJoinRoom: (roomId: string) => void;
  onLeaveRoom: () => void;
}

export const RoomList = ({ rooms, activeRoom, onJoinRoom, onLeaveRoom }: RoomListProps) => {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-accent/50 ${
              activeRoom === room.id ? 'bg-accent border-primary' : 'bg-card/20 border-border/20'
            }`}
            onClick={() => activeRoom === room.id ? onLeaveRoom() : onJoinRoom(room.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Video className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{room.name}</h4>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {room.is_public ? (
                  <Globe className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <Lock className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            </div>
            
            {room.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {room.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                <Users className="w-2 h-2 mr-1" />
                {room.participant_count}
              </Badge>
              <Button
                size="sm"
                variant={activeRoom === room.id ? "secondary" : "default"}
                className="h-6 px-2 text-xs"
              >
                {activeRoom === room.id ? 'Leave' : 'Join'}
              </Button>
            </div>
          </div>
        ))}
        
        {rooms.length === 0 && (
          <div className="text-center py-8">
            <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No rooms available</p>
            <p className="text-xs text-muted-foreground">Create a room to get started</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};