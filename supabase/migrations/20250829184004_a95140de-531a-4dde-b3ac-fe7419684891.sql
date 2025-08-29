-- Create livechat_rooms table
CREATE TABLE public.livechat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create livechat_participants table
CREATE TABLE public.livechat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.livechat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create livechat_messages table
CREATE TABLE public.livechat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.livechat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.livechat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livechat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livechat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for livechat_rooms
CREATE POLICY "Users can view public rooms and rooms they created" 
ON public.livechat_rooms 
FOR SELECT 
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create rooms" 
ON public.livechat_rooms 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms" 
ON public.livechat_rooms 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Room creators can delete their rooms" 
ON public.livechat_rooms 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create policies for livechat_participants
CREATE POLICY "Users can view participants in rooms they can access" 
ON public.livechat_participants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.livechat_rooms 
    WHERE id = room_id 
    AND (is_public = true OR created_by = auth.uid())
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Users can join rooms" 
ON public.livechat_participants 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.livechat_rooms 
    WHERE id = room_id 
    AND (is_public = true OR created_by = auth.uid())
  )
);

CREATE POLICY "Users can leave rooms" 
ON public.livechat_participants 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for livechat_messages
CREATE POLICY "Users can view messages in rooms they participate in" 
ON public.livechat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.livechat_participants 
    WHERE room_id = livechat_messages.room_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to rooms they participate in" 
ON public.livechat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.livechat_participants 
    WHERE room_id = livechat_messages.room_id 
    AND user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_livechat_rooms_updated_at
BEFORE UPDATE ON public.livechat_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE livechat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE livechat_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE livechat_messages;

-- Set replica identity for realtime
ALTER TABLE public.livechat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.livechat_participants REPLICA IDENTITY FULL;
ALTER TABLE public.livechat_messages REPLICA IDENTITY FULL;