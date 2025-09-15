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
      className="text-sm whitespace-pre-wrap text-foreground prose prose-sm max-w-none
                 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4
                 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-3
                 [&_h3]:text-xl [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-2
                 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6
                 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic
                 [&_p]:mb-3 [&_li]:mb-1"
      dangerouslySetInnerHTML={{ __html: processedContent }}
      onClick={handleClick}
    />
  );
}