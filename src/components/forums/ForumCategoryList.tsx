import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useForumCategories } from '@/hooks/useForumCategories';
import { useForumPosts } from '@/hooks/useForumPosts';

interface ForumCategoryListProps {
  selectedCategory?: string;
  onCategorySelect: (categoryId?: string) => void;
}

export function ForumCategoryList({ selectedCategory, onCategorySelect }: ForumCategoryListProps) {
  const { data: categories, isLoading: categoriesLoading } = useForumCategories();
  const { data: allPosts } = useForumPosts();

  const getPostCountForCategory = (categoryId: string) => {
    if (!allPosts) return 0;
    return allPosts.filter(post => post.category_id === categoryId).length;
  };

  if (categoriesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant={!selectedCategory ? "secondary" : "ghost"}
          className="w-full justify-start h-auto p-3"
          onClick={() => onCategorySelect(undefined)}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium">All Categories</span>
            <Badge variant="secondary">{allPosts?.length || 0}</Badge>
          </div>
        </Button>
        
        {categories?.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "secondary" : "ghost"}
            className="w-full justify-start h-auto p-3"
            onClick={() => onCategorySelect(category.id)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <Badge variant="secondary">
                {getPostCountForCategory(category.id)}
              </Badge>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}