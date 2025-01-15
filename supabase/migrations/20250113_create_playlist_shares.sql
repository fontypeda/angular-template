-- Drop existing table if exists
DROP TABLE IF EXISTS playlist_shares CASCADE;

-- Create playlist_shares table
CREATE TABLE playlist_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    shared_with UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    share_type TEXT NOT NULL DEFAULT 'view', -- 'view' or 'edit'
    share_token TEXT UNIQUE,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(playlist_id, shared_with)
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_playlist_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_playlist_shares_updated_at
    BEFORE UPDATE ON playlist_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_playlist_shares_updated_at();
