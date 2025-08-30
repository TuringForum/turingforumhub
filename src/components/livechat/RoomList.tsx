import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Video, Users, Lock, Globe, Trash2 } from 'lucide-react';

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
  currentUserId?: string;
  onJoinRoom: (roomId: string) => void;
  onLeaveRoom: () => void;
  onDeleteRoom: (roomId: string) => void;
}

export const RoomList = ({ rooms, activeRoom, currentUserId, onJoinRoom, onLeaveRoom, onDeleteRoom }: RoomListProps) => {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              activeRoom === room.id ? 'bg-accent border-primary' : 'bg-card/20 border-border/20 hover:bg-accent/50 cursor-pointer'
            }`}
            onClick={() => activeRoom !== room.id ? onJoinRoom(room.id) : undefined}
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
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant={activeRoom === room.id ? "secondary" : "default"}
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    activeRoom === room.id ? onLeaveRoom() : onJoinRoom(room.id);
                  }}
                >
                  {activeRoom === room.id ? 'Leave' : 'Join'}
                </Button>
                {currentUserId === room.created_by && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-6 w-6 p-0"
                    title="Delete room"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
                        onDeleteRoom(room.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
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