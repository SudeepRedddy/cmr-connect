-- Create chatbot feedback table
CREATE TABLE public.chatbot_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analytics_id UUID REFERENCES public.chatbot_analytics(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('positive', 'negative')),
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback
CREATE POLICY "Anyone can insert feedback"
ON public.chatbot_feedback
FOR INSERT
WITH CHECK (true);

-- Admins can view all feedback
CREATE POLICY "Admins can view feedback"
ON public.chatbot_feedback
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create chat conversations table for logged-in users
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Users can manage their own conversations
CREATE POLICY "Users can view own conversations"
ON public.chat_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
ON public.chat_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
ON public.chat_conversations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
ON public.chat_conversations
FOR DELETE
USING (auth.uid() = user_id);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  images TEXT[],
  suggestions TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can manage messages in their conversations
CREATE POLICY "Users can view own conversation messages"
ON public.chat_messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.chat_conversations c 
  WHERE c.id = chat_messages.conversation_id 
  AND c.user_id = auth.uid()
));

CREATE POLICY "Users can insert own conversation messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.chat_conversations c 
  WHERE c.id = chat_messages.conversation_id 
  AND c.user_id = auth.uid()
));

-- Update trigger for conversations
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();