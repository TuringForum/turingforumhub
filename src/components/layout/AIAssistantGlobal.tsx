import React from 'react';
import { Button } from '@/components/ui/button';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { Bot } from 'lucide-react';

export const AIAssistantGlobal: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AIAssistant
        trigger={
          <Button 
            size="lg" 
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Bot className="h-6 w-6" />
          </Button>
        }
      />
    </div>
  );
};