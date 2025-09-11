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
  const [currentInput, setCurrentInput] = useState(
    task === 'improve' && context ? 
      `Please improve and refine this text:\n\n${context}` : 
      initialPrompt
  );
  const [aiResponse, setAiResponse] = useState('');
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
      setAiResponse(data.response);
      
      toast({
        title: "AI Response Ready",
        description: "Click 'Use' to insert the response into your content.",
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
      if (aiResponse) {
        handleUseResponse();
      } else {
        sendMessage();
      }
    }
  };

  const handleUseResponse = () => {
    if (aiResponse && onResult) {
      onResult(aiResponse);
      setOpen(false);
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
          {/* Large textarea filling most of the space */}
          <div className="flex-1 p-4">
            <Textarea
              value={aiResponse || currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                loading ? "Working..." :
                task === 'summarize' ? "Paste content to summarize..." :
                task === 'generate' ? "Describe what you'd like me to generate..." :
                task === 'improve' ? "Edit the text above to tell me how to improve it..." :
                "Ask me anything..."
              }
              className="w-full h-full resize-none"
              disabled={loading}
            />
          </div>
          
          {/* Buttons at the bottom */}
          <div className="p-4 border-t">
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                onClick={aiResponse ? handleUseResponse : sendMessage} 
                disabled={(!currentInput.trim() && !aiResponse) || loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : aiResponse ? (
                  "Use"
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