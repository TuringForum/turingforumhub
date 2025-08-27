import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, task, context } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = "You are an AI assistant for the Turing Forum Hub. Be helpful, concise, and accurate.";
    
    // Customize system prompt based on task
    if (task === 'summarize') {
      systemPrompt = "You are an AI assistant that creates concise, accurate summaries. Focus on key points and main ideas.";
    } else if (task === 'generate') {
      systemPrompt = "You are an AI writing assistant. Generate high-quality, relevant content based on the user's request. Be creative but factual.";
    } else if (task === 'improve') {
      systemPrompt = "You are an AI editor. Help improve text by making it clearer, more engaging, and better structured while preserving the original meaning.";
    }

    // Add context if provided
    if (context) {
      systemPrompt += `\n\nContext: ${context}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: task === 'summarize' ? 200 : 1500,
        temperature: task === 'generate' ? 0.7 : 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});