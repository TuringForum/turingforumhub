import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { VideoRoom } from '@/components/livechat/VideoRoom';
import { ChatSidebar } from '@/components/livechat/ChatSidebar';
import { RoomList } from '@/components/livechat/RoomList';
import { CreateRoomDialog } from '@/components/livechat/CreateRoomDialog';
import { useAuth } from '@/hooks/useAuth';
import { useLiveChatRooms } from '@/hooks/useLiveChatRooms';
import { Video, Users, Plus, MessageCircle } from 'lucide-react';

const LiveChat = () => {
  const { user } = useAuth();
  const { rooms, createRoom, joinRoom, leaveRoom, deleteRoom } = useLiveChatRooms();
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const autoJoinTried = useRef(false);

  useEffect(() => {
    if (autoJoinTried.current) return;
    if (!activeRoom) {
      if (rooms.length > 0) {
        autoJoinTried.current = true;
        handleJoinRoom(rooms[0].id);
      } else {
        autoJoinTried.current = true;
        handleCreateRoom('General', 'Default room', true);
      }
    }
  }, [rooms, activeRoom]);

  const handleJoinRoom = async (roomId: string) => {
    console.log('Attempting to join room:', roomId);
    const success = await joinRoom(roomId);
    if (success) {
      setActiveRoom(roomId);
      console.log('Successfully joined room:', roomId);
    } else {
      console.log('Failed to join room:', roomId);
    }
  };

  const handleLeaveRoom = async () => {
    if (activeRoom) {
      await leaveRoom(activeRoom);
      setActiveRoom(null);
    }
  };

  const handleCreateRoom = async (name: string, description: string, isPublic: boolean) => {
    const room = await createRoom(name, description, isPublic);
    if (room) {
      setActiveRoom(room.id);
      setShowCreateDialog(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    const success = await deleteRoom(roomId);
    if (success && roomId === activeRoom) {
      setActiveRoom(null);
    }
  };

  const activeRoomData = rooms.find(room => room.id === activeRoom);

  return (
    <RoleGuard allowedRoles={['reader', 'contributor', 'admin']}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          {/* Room Control Panel */}
          <div className="flex items-center justify-end space-x-4 mb-6">
            {!activeRoom && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
            {/* Room List Sidebar - Only show when not connected to a room */}
            {!activeRoom && (
              <div className="lg:col-span-1">
                <Card className="h-full glass">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Rooms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <RoomList 
                      rooms={rooms}
                      activeRoom={activeRoom}
                      currentUserId={user?.id}
                      onJoinRoom={handleJoinRoom}
                      onLeaveRoom={handleLeaveRoom}
                      onDeleteRoom={handleDeleteRoom}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Video Room */}
            <div className={`${
              !activeRoom 
                ? showChat ? 'lg:col-span-2' : 'lg:col-span-3'
                : showChat ? 'lg:col-span-3' : 'lg:col-span-4'
            }`}>
              {activeRoom ? (
                <VideoRoom 
                  roomId={activeRoom}
                  roomName={activeRoomData?.name || 'Room'}
                  onLeave={handleLeaveRoom}
                />
              ) : (
                <Card className="h-full glass flex items-center justify-center">
                  <CardContent className="text-center">
                    <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Active Room</h3>
                    <p className="text-muted-foreground mb-4">
                      Join a room to start video calling and screen sharing
                    </p>
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Room
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Chat Sidebar */}
            {showChat ? (
              <div className="lg:col-span-1">
                <ChatSidebar 
                  roomId={activeRoom}
                  roomName={activeRoomData?.name}
                  onToggleChat={() => setShowChat(false)}
                />
              </div>
            ) : activeRoom && (
              <div className="fixed bottom-4 right-4 z-50">
                <Button
                  onClick={() => setShowChat(true)}
                  variant="outline"
                  size="sm"
                  className="shadow-lg"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Show Chat
                </Button>
              </div>
            )}
          </div>
        </div>

        <CreateRoomDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateRoom={handleCreateRoom}
        />
      </div>
    </RoleGuard>
  );
};

export default LiveChat;