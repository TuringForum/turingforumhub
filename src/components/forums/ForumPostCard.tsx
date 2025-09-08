import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MessageSquare, Pin, Clock, User, Lock, MoreVertical, Trash2, Edit } from 'lucide-react';
import { ForumPost } from '@/hooks/useForumPosts';
import { useAuth } from '@/hooks/useAuth';

interface ForumPostCardProps {
  post: ForumPost;
  onClick?: () => void;
  onEdit?: (post: ForumPost) => void;
  onDelete?: (post: ForumPost) => void;
}

export function ForumPostCard({ post, onClick, onEdit, onDelete }: ForumPostCardProps) {
  const { user, role } = useAuth();
  const isAuthor = user?.id === post.created_by;
  const canDelete = isAuthor || role === 'admin';

  const getInitials = (nickname: string | null) => {
    if (!nickname) return 'U';
    return nickname
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card 
      className="enhanced-card hover:shadow-lg transition-all duration-300 cursor-pointer group" 
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="flex-shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  {getInitials(post.author?.nickname || null)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                {post.is_pinned && (
                  <Pin className="h-4 w-4 text-primary" />
                )}
                {post.is_locked && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                  {post.title}
                </h3>
                {post.is_pinned && (
                  <Badge variant="secondary" className="text-xs">
                    Pinned
                  </Badge>
                )}
              </div>
              
              {post.category && (
                <div className="mb-3">
                  <Badge 
                    style={{ backgroundColor: post.category.color + '20', color: post.category.color }}
                    className="text-xs"
                  >
                    {post.category.name}
                  </Badge>
                </div>
              )}
              
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {post.content.length > 150 
                  ? post.content.substring(0, 150) + '...' 
                  : post.content
                }
              </p>
              
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(post.last_reply_at || post.created_at))} ago
                </span>
                <span className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {post.author?.nickname || 'Anonymous'}
                </span>
              </div>
            </div>
          </div>
          
          {canDelete && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {isAuthor && onEdit && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEdit(post);
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && onDelete && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(post);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}