import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

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

    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
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

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: task === 'summarize' ? 200 : 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Lovable AI Gateway error:', error);
      throw new Error(`AI Gateway error: ${response.status}`);
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