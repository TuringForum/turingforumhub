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
          return `<a href="/wiki/${pageSlug}" class="text-primary underline hover:text-primary/80" data-wiki-link="${pageSlug}">${pageTitle}</a>`;
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
      e.stopPropagation();
      navigate(`/wiki/${wikiLink}`);
      return;
    }

    // Also handle regular anchor tags that might be wiki links
    if (target.tagName === 'A') {
      const href = target.getAttribute('href');
      if (href && href.startsWith('/wiki/')) {
        e.preventDefault();
        e.stopPropagation();
        navigate(href);
      }
    }
  };

  const processedContent = processWikiLinks(content);

  return (
    <div 
      className="wiki-content text-sm whitespace-pre-wrap text-foreground"
      dangerouslySetInnerHTML={{ __html: processedContent }}
      onClick={handleClick}
    />
  );
}