-- Add play history table
CREATE TABLE public.play_history (
    id BIGSERIAL PRIMARY KEY,
    song_id BIGINT REFERENCES public.songs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    play_duration INTEGER, -- in seconds
    completed BOOLEAN DEFAULT false
);

-- Add indices for better query performance
CREATE INDEX idx_play_history_song_id ON public.play_history(song_id);
CREATE INDEX idx_play_history_user_id ON public.play_history(user_id);
CREATE INDEX idx_play_history_played_at ON public.play_history(played_at);

-- Add RLS policies
ALTER TABLE public.play_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own play history"
    ON public.play_history
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own play history"
    ON public.play_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON public.play_history TO authenticated;
