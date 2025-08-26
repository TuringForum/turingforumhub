import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Folder } from 'lucide-react';
import { useWikiCategories } from '@/hooks/useWikiCategories';
import { useWikiPages } from '@/hooks/useWikiPages';

interface WikiCategoryListProps {
  selectedCategory?: string;
  onCategorySelect: (categoryId?: string) => void;
}

export function WikiCategoryList({ selectedCategory, onCategorySelect }: WikiCategoryListProps) {
  const { data: categories, isLoading: categoriesLoading } = useWikiCategories();
  const { data: allPages } = useWikiPages();

  const getPageCountForCategory = (categoryId: string) => {
    if (!allPages) return 0;
    return allPages.filter(page => page.category_id === categoryId).length;
  };

  if (categoriesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-10 bg-muted rounded w-full"></div>
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
            <div className="flex items-center space-x-2">
              <Folder className="h-4 w-4" />
              <span className="text-sm font-medium">All Articles</span>
            </div>
            <Badge variant="secondary">{allPages?.length || 0}</Badge>
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
                {getPageCountForCategory(category.id)}
              </Badge>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}