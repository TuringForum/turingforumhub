import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Reply, Edit, Trash2 } from 'lucide-react';
import { ForumReply } from '@/hooks/useForumReplies';
import { useAuth } from '@/hooks/useAuth';

interface ReplyCardProps {
  reply: ForumReply;
  postId: string;
  depth?: number;
  onEdit: (reply: ForumReply, content: string) => void;
  onDelete: (replyId: string) => void;
  onReply: (parentId: string, content: string) => void;
  isLocked?: boolean;
}

const MAX_DEPTH = 3;

export function ReplyCard({ 
  reply, 
  postId, 
  depth = 0, 
  onEdit, 
  onDelete, 
  onReply, 
  isLocked = false 
}: ReplyCardProps) {
  const { user, role } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [replyContent, setReplyContent] = useState('');

  const canEdit = user && (reply.created_by === user.id || role === 'admin');
  const canReply = user && role !== 'reader' && !isLocked && depth < MAX_DEPTH;

  const getInitials = (nickname: string | null) => {
    if (!nickname) return 'U';
    return nickname
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditSave = () => {
    if (editContent.trim() === reply.content) {
      setIsEditing(false);
      return;
    }
    onEdit(reply, editContent.trim());
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditContent(reply.content);
    setIsEditing(false);
  };

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;
    onReply(reply.id, replyContent.trim());
    setReplyContent('');
    setIsReplying(false);
  };

  const indentClass = depth > 0 ? `ml-${Math.min(depth * 8, 16)} border-l-2 border-muted pl-4` : '';

  return (
    <div className={indentClass}>
      <Card className="enhanced-card mb-4">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={reply.author?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                {getInitials(reply.author?.nickname || null)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-sm">
                  {reply.author?.nickname || 'Anonymous'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(reply.created_at))} ago
                  {reply.updated_at !== reply.created_at && (
                    <span className="ml-1">(edited)</span>
                  )}
                </span>
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleEditSave}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleEditCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground text-sm whitespace-pre-wrap mb-2">
                    {reply.content}
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2 mt-2">
                {canReply && !isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReplying(!isReplying)}
                    className="h-7 px-2 text-xs"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                )}
              </div>

              {/* Reply Form */}
              {isReplying && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="min-h-[60px] text-sm"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleReplySubmit} disabled={!replyContent.trim()}>
                      Reply
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setIsReplying(false);
                      setReplyContent('');
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  {reply.created_by === user?.id && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onDelete(reply.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Nested Replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="space-y-2">
          {reply.replies.map((nestedReply) => (
            <ReplyCard
              key={nestedReply.id}
              reply={nestedReply}
              postId={postId}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              isLocked={isLocked}
            />
          ))}
        </div>
      )}
    </div>
  );
}