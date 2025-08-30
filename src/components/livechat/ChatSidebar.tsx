import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useLiveChatMessages } from '@/hooks/useLiveChatMessages';
import { MessageCircle, Send, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  roomId: string | null;
  roomName?: string;
}

export const ChatSidebar = ({ roomId, roomName }: ChatSidebarProps) => {
  const { user } = useAuth();
  const { messages, participants, sendMessage } = useLiveChatMessages(roomId);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !roomId) return;
    
    await sendMessage(newMessage.trim());
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!roomId) {
    return (
      <Card className="h-full glass">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Join a room to start chatting</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full glass flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat
          </div>
          <Badge variant="outline">
            <Users className="w-3 h-3 mr-1" />
            {participants.length}
          </Badge>
        </CardTitle>
        {roomName && (
          <p className="text-sm text-muted-foreground">{roomName}</p>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Messages */}
        <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex space-x-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={message.user_avatar} />
                  <AvatarFallback className="text-xs">
                    {(message.user_name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">{message.user_name || 'Unknown User'}</p>
                    {message.user_id === user?.id && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground">Be the first to say something!</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Message Input */}
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            size="sm"
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};