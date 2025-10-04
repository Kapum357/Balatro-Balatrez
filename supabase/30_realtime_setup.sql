-- Realtime Chat Setup: Typing table and policies
-- Run this after setting up the basic chat schema

-- Create typing table for typing indicators
CREATE TABLE IF NOT EXISTS public.typing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_typing TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(channel_id, user_id)
);

-- Enable RLS on typing table
ALTER TABLE public.typing ENABLE ROW LEVEL SECURITY;

-- Typing policies: Users can manage their own typing state and see others' in shared channels
CREATE POLICY "Users can insert own typing state" ON public.typing
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own typing state" ON public.typing
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own typing state" ON public.typing
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view typing in accessible channels" ON public.typing
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.channel_members cm
            WHERE cm.channel_id = typing.channel_id
            AND cm.user_id = auth.uid()
        )
    );

-- Enable realtime for messages table (if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable realtime for typing table
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing;

-- Create index for efficient typing queries
CREATE INDEX IF NOT EXISTS idx_typing_channel_user ON public.typing(channel_id, user_id);
CREATE INDEX IF NOT EXISTS idx_typing_last_typing ON public.typing(last_typing);

-- Function to cleanup old typing records (optional, can be called by a cron job)
CREATE OR REPLACE FUNCTION cleanup_old_typing()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.typing 
    WHERE last_typing < NOW() - INTERVAL '10 minutes';
END;
$$;

-- Grant necessary permissions
GRANT ALL ON public.typing TO authenticated;
GRANT ALL ON public.typing TO service_role;