import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Link as LinkIcon,
  Link2Off,
  Heading1,
  Heading2,
  Heading3,
  Sparkles,
  FileText
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { useWikiPages, useCreateWikiPage } from '@/hooks/useWikiPages';
import { useWikiCategories } from '@/hooks/useWikiCategories';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const { data: wikiPages } = useWikiPages();
  const { data: categories } = useWikiCategories();
  const createPage = useCreateWikiPage();
  const [wikiLinkOpen, setWikiLinkOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80',
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention bg-primary/10 text-primary px-1 py-0.5 rounded',
        },
        suggestion: {
          items: ({ query }) => {
            if (!wikiPages) return [];
            return wikiPages
              .filter(page => 
                page.title.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5)
              .map(page => ({
                id: page.slug,
                label: page.title,
              }));
          },
          render: () => {
            let component: any;
            let popup: any;

            return {
              onStart: (props: any) => {
                component = document.createElement('div');
                component.className = 'bg-background border rounded-lg shadow-lg p-2 max-h-48 overflow-y-auto';
                
                popup = document.createElement('div');
                popup.appendChild(component);
                document.body.appendChild(popup);
              },

              onUpdate(props: any) {
                component.innerHTML = props.items
                  .map((item: any, index: number) =>
                    `<div class="px-3 py-2 cursor-pointer hover:bg-muted rounded ${
                      index === props.selectedIndex ? 'bg-muted' : ''
                    }" data-index="${index}">
                      ${item.label}
                    </div>`
                  )
                  .join('');

                component.addEventListener('click', (e: any) => {
                  const index = e.target.getAttribute('data-index');
                  if (index !== null) {
                    props.selectItem(props.items[parseInt(index)]);
                  }
                });
              },

              onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                  popup.remove();
                  return true;
                }
                return false;
              },

              onExit() {
                if (popup) popup.remove();
              },
            };
          },
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const setWikiLink = useCallback((pageSlug: string, pageTitle: string) => {
    if (!editor) return;
    
    const href = `/wiki/${pageSlug}`;
    editor.chain().focus().setLink({ href }).insertContent(pageTitle).run();
    setWikiLinkOpen(false);
  }, [editor]);

  const handleCreateAIWikiPage = useCallback(async () => {
    if (!editor) return;
    
    const selectedText = editor.state.selection.empty 
      ? editor.getText().trim() 
      : editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to).trim();
    
    if (!selectedText) {
      toast({
        title: "No text selected",
        description: "Please select text or ensure there's content in the editor to use as the page title.",
        variant: "destructive"
      });
      return;
    }

    const title = selectedText.substring(0, 100); // Limit title length
    
    if (!categories || categories.length === 0) {
      toast({
        title: "No categories available", 
        description: "Please create a wiki category first.",
        variant: "destructive"
      });
      return;
    }

    // Store the current selection for linking after page creation
    const selectionFrom = editor.state.selection.from;
    const selectionTo = editor.state.selection.to;
    const hasSelection = !editor.state.selection.empty;
    const selectedTextForLink = hasSelection ? selectedText : title;

    // Use the first available category as default
    const defaultCategory = categories[0];
    
    // Show immediate feedback that the process has started
    toast({
      title: "Creating AI Wiki Page",
      description: `Generating content for "${title}"...`,
    });

    try {
      // Generate AI content for the new page using Supabase edge function
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [
            { role: 'user', content: `Explain "${title}" as a clear, structured wiki article. Format your response as HTML with proper heading tags (h1, h2, h3), paragraph tags (p), unordered lists (ul/li), and other HTML formatting. Include headings, bullet points, and examples where relevant. Do not include html, head, or body tags - just the content HTML.` }
          ],
          task: 'generate'
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate AI content');
      }

      const aiContent = response.data?.response || response.data?.generatedText || response.data?.text;
      
      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Create the wiki page and wait for completion
      await createPage.mutateAsync({
        title,
        slug,
        content: aiContent || `<h1>${title}</h1><p>Content generated by AI.</p>`,
        category_id: defaultCategory.id,
        is_published: true,
      });

      // Create link to the new page in the current editor
      if (editor && !editor.isDestroyed) {
        const href = `/wiki/${slug}`;
        
        if (hasSelection) {
          // Replace selected text with a link
          editor.chain()
            .focus()
            .setTextSelection({ from: selectionFrom, to: selectionTo })
            .setLink({ href })
            .run();
        } else {
          // Insert link at current cursor position
          editor.chain()
            .focus()
            .setLink({ href })
            .insertContent(title)
            .run();
        }
      }

      toast({
        title: "AI Wiki Page Created & Linked",
        description: `Successfully created "${title}" and linked to it in your article.`,
      });
    } catch (error) {
      console.error('Error creating AI wiki page:', error);
      toast({
        title: "Failed to Create Wiki Page",
        description: "Failed to create AI wiki page. Please try again.",
        variant: "destructive"
      });
    }
  }, [editor, categories, createPage]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input rounded-md">
      <div className="flex flex-wrap gap-1 p-2 border-b border-input justify-between">
        <div className="flex flex-wrap gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-muted' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={setLink}
            className={editor.isActive('link') ? 'bg-muted' : ''}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          {editor.isActive('link') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="text-destructive hover:text-destructive"
            >
              <Link2Off className="h-4 w-4" />
            </Button>
          )}
          <Popover open={wikiLinkOpen} onOpenChange={setWikiLinkOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search wiki pages..." />
                <CommandEmpty>No wiki pages found.</CommandEmpty>
                <CommandGroup>
                  {wikiPages?.map((page) => (
                    <CommandItem
                      key={page.id}
                      value={page.title}
                      onSelect={() => setWikiLink(page.slug, page.title)}
                      className="cursor-pointer"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <div>
                        <div className="font-medium">{page.title}</div>
                        {page.excerpt && (
                          <div className="text-sm text-muted-foreground truncate">
                            {page.excerpt}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-1">
          <AIAssistant
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI Help
              </Button>
            }
            task="improve"
            context={editor.getText()}
            onResult={(result) => {
              // Insert the AI-generated text, replacing the current content
              editor.commands.setContent(result);
              onChange(result);
              // Focus back to the editor
              editor.commands.focus();
            }}
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleCreateAIWikiPage}
          >
            <FileText className="h-4 w-4" />
            Add AI Wiki Page
          </Button>
        </div>
      </div>
      <EditorContent 
        editor={editor}
        className="text-sm whitespace-pre-wrap text-foreground p-4 min-h-[200px] focus-within:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}