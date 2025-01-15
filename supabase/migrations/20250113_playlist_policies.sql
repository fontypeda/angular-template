-- Enable RLS
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Songs policies
CREATE POLICY "Users can view their own songs"
    ON songs FOR SELECT
    TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own songs"
    ON songs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own songs"
    ON songs FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own songs"
    ON songs FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- Playlists policies
DROP POLICY IF EXISTS "Users can view their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can create their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can update their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can delete their own playlists" ON playlists;

CREATE POLICY "Users can view their own playlists"
    ON playlists FOR SELECT
    TO authenticated
    USING (
        owner_id = auth.uid() OR 
        id IN (
            SELECT playlist_id FROM playlist_shares 
            WHERE shared_with = auth.uid()
        )
    );

CREATE POLICY "Users can create their own playlists"
    ON playlists FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own playlists"
    ON playlists FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own playlists"
    ON playlists FOR DELETE
    TO authenticated
    USING (owner_id = auth.uid());

-- Playlist songs policies
CREATE POLICY "Users can view songs in their playlists"
    ON playlist_songs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_songs.playlist_id 
            AND (
                playlists.owner_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM playlist_shares 
                    WHERE playlist_shares.playlist_id = playlists.id 
                    AND playlist_shares.shared_with = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can add songs to their playlists"
    ON playlist_songs FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_songs.playlist_id 
            AND playlists.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can remove songs from their playlists"
    ON playlist_songs FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_songs.playlist_id 
            AND playlists.owner_id = auth.uid()
        )
    );

-- Playlist shares policies
CREATE POLICY "Users can view shares for their playlists"
    ON playlist_shares FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_shares.playlist_id 
            AND playlists.owner_id = auth.uid()
        ) OR 
        shared_with = auth.uid()
    );

CREATE POLICY "Users can share their playlists"
    ON playlist_shares FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_shares.playlist_id 
            AND playlists.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can remove shares from their playlists"
    ON playlist_shares FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_shares.playlist_id 
            AND playlists.owner_id = auth.uid()
        )
    );

-- Contacts policies
CREATE POLICY "Users can view their own contacts"
    ON contacts FOR SELECT
    TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own contacts"
    ON contacts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own contacts"
    ON contacts FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own contacts"
    ON contacts FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);
