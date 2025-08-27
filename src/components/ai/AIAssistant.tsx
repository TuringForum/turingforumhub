import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Loader2, Sparkles } from 'lucide-react';

interface AIAssistantProps {
  trigger?: React.ReactNode;
  initialPrompt?: string;
  task?: 'chat' | 'summarize' | 'generate' | 'improve';
  context?: string;
  onResult?: (result: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  trigger, 
  initialPrompt = '', 
  task = 'chat',
  context,
  onResult 
}) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [currentInput, setCurrentInput] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!currentInput.trim() || loading) return;
    
    const userMessage = { role: 'user' as const, content: currentInput.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setCurrentInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: newMessages,
          task,
          context
        }
      });

      if (error) throw error;

      const assistantMessage = { role: 'assistant' as const, content: data.response };
      setMessages([...newMessages, assistantMessage]);
      
      // If onResult callback is provided, call it with the AI response
      if (onResult) {
        onResult(data.response);
      }

      toast({
        title: "AI Response Generated",
        description: "The AI has provided a response to your request.",
      });
    } catch (error) {
      console.error('AI chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Bot className="h-4 w-4" />
      AI Assistant
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Assistant
            {task !== 'chat' && (
              <span className="text-sm text-muted-foreground">
                ({task})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-[500px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>How can I help you today?</p>
                {task === 'summarize' && <p className="text-sm">I can help summarize content for you.</p>}
                {task === 'generate' && <p className="text-sm">I can help generate content based on your needs.</p>}
                {task === 'improve' && <p className="text-sm">I can help improve and refine your text.</p>}
              </div>
            )}
            
            {messages.map((message, index) => (
              <Card key={index} className={message.role === 'user' ? 'ml-12' : 'mr-12'}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    {message.role === 'assistant' && <Bot className="h-4 w-4 mt-0.5 text-primary" />}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {loading && (
              <Card className="mr-12">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">AI is thinking...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  task === 'summarize' ? "Paste content to summarize..." :
                  task === 'generate' ? "Describe what you'd like me to generate..." :
                  task === 'improve' ? "Paste text to improve..." :
                  "Ask me anything..."
                }
                className="flex-1 min-h-[80px] resize-none"
                disabled={loading}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!currentInput.trim() || loading}
                className="self-end"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};