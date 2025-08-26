import { useNavigate } from 'react-router-dom';
import { useWikiPages } from '@/hooks/useWikiPages';

interface RichTextRendererProps {
  content: string;
}

export function RichTextRenderer({ content }: RichTextRendererProps) {
  const navigate = useNavigate();
  const { data: wikiPages } = useWikiPages();

  // Process content to make wiki page mentions clickable
  const processWikiLinks = (htmlContent: string) => {
    if (!wikiPages) return htmlContent;

    // Replace mentions with clickable links
    return htmlContent.replace(
      /<span[^>]*class="[^"]*mention[^"]*"[^>]*data-id="([^"]*)"[^>]*>([^<]*)<\/span>/g,
      (match, pageSlug, pageTitle) => {
        const page = wikiPages.find(p => p.slug === pageSlug);
        if (page) {
          return `<a href="/wiki/${pageSlug}" class="text-primary underline hover:text-primary/80 bg-primary/10 px-1 py-0.5 rounded" data-wiki-link="${pageSlug}">${pageTitle}</a>`;
        }
        return match;
      }
    );
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const wikiLink = target.getAttribute('data-wiki-link');
    
    if (wikiLink) {
      e.preventDefault();
      navigate(`/wiki/${wikiLink}`);
    }
  };

  const processedContent = processWikiLinks(content);

  return (
    <div 
      className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-l-border prose-code:text-foreground prose-code:bg-muted prose-pre:bg-muted prose-pre:text-foreground prose-li:text-foreground prose-a:text-primary hover:prose-a:text-primary/80"
      dangerouslySetInnerHTML={{ __html: processedContent }}
      onClick={handleClick}
    />
  );
}