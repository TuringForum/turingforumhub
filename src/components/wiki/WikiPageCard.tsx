import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Calendar } from 'lucide-react';
import { WikiPage } from '@/hooks/useWikiPages';

interface WikiPageCardProps {
  page: WikiPage;
  onClick?: () => void;
}

export function WikiPageCard({ page, onClick }: WikiPageCardProps) {
  return (
    <Card 
      className="enhanced-card hover:shadow-lg transition-all duration-300 cursor-pointer group h-full" 
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center text-lg group-hover:text-primary transition-colors">
          <FileText className="mr-2 h-5 w-5" />
          {page.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {page.excerpt || page.content.substring(0, 150) + '...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {page.category && (
            <Badge 
              style={{ 
                backgroundColor: page.category.color + '20', 
                color: page.category.color 
              }}
              className="text-xs"
            >
              {page.category.name}
            </Badge>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {page.view_count} views
              </span>
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(page.updated_at))} ago
              </span>
            </div>
          </div>
          
          <Button 
            className="w-full group-hover:bg-primary/90" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Read Article
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}