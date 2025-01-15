BEGIN;

-- 1) Drop the existing public schema (danger: wipes everything in 'public')
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- 2) Create extensions you might need
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3) Enum for track status
CREATE TYPE track_status AS ENUM (
  'draft',
  'pending_approval',
  'released'
);

------------------------------------------------------------------------------
-- PROFILES (extends auth.users for roles/avatars)
------------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',      
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

------------------------------------------------------------------------------
-- SONGS (with 'artist' column added)
------------------------------------------------------------------------------
CREATE TABLE public.songs (
  id               BIGSERIAL PRIMARY KEY,
  owner_id         UUID NOT NULL REFERENCES auth.users (id),
  title            TEXT NOT NULL,
  artist           TEXT,                    -- new column for a single "artist" name
  track_status     track_status NOT NULL DEFAULT 'draft',
  is_released      BOOLEAN DEFAULT FALSE,
  length_seconds   INT,
  audio_file_url   TEXT,
  cover_image_url  TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

------------------------------------------------------------------------------
-- SONG METADATA
------------------------------------------------------------------------------
CREATE TABLE public.song_metadata (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  song_id BIGINT REFERENCES public.songs(id) ON DELETE CASCADE,
  bpm INTEGER NOT NULL,
  song_key VARCHAR(255) NOT NULL,
  genre VARCHAR(255) NOT NULL,
  mood VARCHAR(255),
  tags TEXT[] DEFAULT '{}',
  instruments TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(song_id)
);

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.song_metadata
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

------------------------------------------------------------------------------
-- SONG STATS
------------------------------------------------------------------------------
CREATE TABLE public.song_stats (
  id               BIGSERIAL PRIMARY KEY,
  song_id          BIGINT NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  play_count       BIGINT DEFAULT 0,
  last_played_date TIMESTAMP WITH TIME ZONE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

------------------------------------------------------------------------------
-- CONTACTS
------------------------------------------------------------------------------
CREATE TABLE public.contacts (
  id           BIGSERIAL PRIMARY KEY,
  owner_id     UUID NOT NULL REFERENCES auth.users (id),
  name         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

------------------------------------------------------------------------------
-- SONG_CONTACT (Many-to-Many with optional split_percentage)
------------------------------------------------------------------------------
CREATE TABLE public.song_contact (
  id              BIGSERIAL PRIMARY KEY,
  song_id         BIGINT NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  contact_id      BIGINT NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  role_in_song    TEXT NOT NULL,                -- Made NOT NULL and added index
  split_percentage NUMERIC(5,2),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for better query performance
CREATE INDEX idx_song_contact_role ON public.song_contact(role_in_song);

------------------------------------------------------------------------------
-- PLAYLISTS
------------------------------------------------------------------------------
CREATE TABLE public.playlists (
  id          BIGSERIAL PRIMARY KEY,
  owner_id    UUID NOT NULL REFERENCES auth.users (id),
  name        TEXT NOT NULL,
  is_public   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

------------------------------------------------------------------------------
-- PLAYLIST_SONGS
------------------------------------------------------------------------------
CREATE TABLE public.playlist_songs (
  id             BIGSERIAL PRIMARY KEY,
  playlist_id    BIGINT NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id        BIGINT NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  order_index    INT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

------------------------------------------------------------------------------
-- PLAYLIST_SHARES
------------------------------------------------------------------------------
CREATE TABLE public.playlist_shares (
  id               BIGSERIAL PRIMARY KEY,
  playlist_id      BIGINT NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  share_token      TEXT NOT NULL,
  share_expiration TIMESTAMP WITH TIME ZONE,
  permission_level TEXT DEFAULT 'read-only',
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

------------------------------------------------------------------------------
-- SONG COMMENTS
------------------------------------------------------------------------------
CREATE TABLE public.song_comments (
  id           BIGSERIAL PRIMARY KEY,
  song_id      BIGINT NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users (id),
  comment_text TEXT NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

------------------------------------------------------------------------------
-- SONG RATINGS
------------------------------------------------------------------------------
CREATE TABLE public.song_ratings (
  id           BIGSERIAL PRIMARY KEY,
  song_id      BIGINT NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users (id),
  rating       INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optionally ensure 1 rating per user per song
-- ALTER TABLE public.song_ratings
--   ADD CONSTRAINT one_rating_per_user_per_song
--   UNIQUE (song_id, user_id);

------------------------------------------------------------------------------
-- SONG_RELEASE (official release info)
------------------------------------------------------------------------------
CREATE TABLE public.song_release (
  id                      BIGSERIAL PRIMARY KEY,
  song_id                 BIGINT NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  isrc_code               TEXT,
  distribution_channels   TEXT[],
  official_release_date   DATE,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

------------------------------------------------------------------------------
-- AUTO-UPDATE 'updated_at' TRIGGERS
------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp_column();

CREATE TRIGGER update_songs_updated_at
BEFORE UPDATE ON public.songs
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp_column();

CREATE TRIGGER update_song_stats_updated_at
BEFORE UPDATE ON public.song_stats
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp_column();

CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp_column();

CREATE TRIGGER update_playlists_updated_at
BEFORE UPDATE ON public.playlists
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp_column();

CREATE TRIGGER update_song_release_updated_at
BEFORE UPDATE ON public.song_release
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp_column();

------------------------------------------------------------------------------
-- ENABLE RLS
------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

------------------------------------------------------------------------------
-- BASIC RLS POLICIES
------------------------------------------------------------------------------

-- PROFILES
CREATE POLICY "Select own profile"
ON public.profiles
FOR SELECT
USING ( id = auth.uid() );

CREATE POLICY "Insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK ( id = auth.uid() );

CREATE POLICY "Update own profile"
ON public.profiles
FOR UPDATE
USING ( id = auth.uid() )
WITH CHECK ( id = auth.uid() );

CREATE POLICY "Delete own profile"
ON public.profiles
FOR DELETE
USING ( id = auth.uid() );

-- SONGS
CREATE POLICY "Select own songs"
ON public.songs
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Insert own songs"
ON public.songs
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Update own songs"
ON public.songs
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Delete own songs"
ON public.songs
FOR DELETE
USING (owner_id = auth.uid());

-- CONTACTS
CREATE POLICY "Select own contacts"
ON public.contacts
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Insert own contacts"
ON public.contacts
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Update own contacts"
ON public.contacts
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Delete own contacts"
ON public.contacts
FOR DELETE
USING (owner_id = auth.uid());

-- PLAYLISTS
CREATE POLICY "Select own playlists"
ON public.playlists
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Insert own playlists"
ON public.playlists
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Update own playlists"
ON public.playlists
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Delete own playlists"
ON public.playlists
FOR DELETE
USING (owner_id = auth.uid());

-- SONG_CONTACT
CREATE POLICY "Select own song_contact"
ON public.song_contact
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.songs s
    WHERE s.id = song_contact.song_id
    AND s.owner_id = auth.uid()
  )
);

CREATE POLICY "Insert own song_contact"
ON public.song_contact
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.songs s
    WHERE s.id = song_contact.song_id
    AND s.owner_id = auth.uid()
  )
);

CREATE POLICY "Update own song_contact"
ON public.song_contact
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.songs s
    WHERE s.id = song_contact.song_id
    AND s.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.songs s
    WHERE s.id = song_contact.song_id
    AND s.owner_id = auth.uid()
  )
);

CREATE POLICY "Delete own song_contact"
ON public.song_contact
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.songs s
    WHERE s.id = song_contact.song_id
    AND s.owner_id = auth.uid()
  )
);

-- PLAYLIST_SONGS
CREATE POLICY "Select own playlist_songs"
ON public.playlist_songs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.playlists p
    WHERE p.id = playlist_songs.playlist_id
    AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Insert own playlist_songs"
ON public.playlist_songs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.playlists p
    WHERE p.id = playlist_songs.playlist_id
    AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Update own playlist_songs"
ON public.playlist_songs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.playlists p
    WHERE p.id = playlist_songs.playlist_id
    AND p.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.playlists p
    WHERE p.id = playlist_songs.playlist_id
    AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Delete own playlist_songs"
ON public.playlist_songs
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.playlists p
    WHERE p.id = playlist_songs.playlist_id
    AND p.owner_id = auth.uid()
  )
);

------------------------------------------------------------------------------
-- STORAGE BUCKETS
------------------------------------------------------------------------------

-- Create storage buckets for songs and covers
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('songs', 'songs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view songs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload songs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload covers" ON storage.objects;

-- Set up storage policies for songs bucket
CREATE POLICY "Anyone can view songs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'songs');

CREATE POLICY "Authenticated users can upload songs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'songs'
    AND auth.role() = 'authenticated'
  );

-- Set up storage policies for covers bucket
CREATE POLICY "Anyone can view covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can upload covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'covers'
    AND auth.role() = 'authenticated'
  );

-- Grant storage permissions to authenticated users
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

------------------------------------------------------------------------------
-- 8) GRANTS FOR 'authenticated' ROLE
------------------------------------------------------------------------------

-- 8.1 Allow the 'authenticated' role to use the 'public' schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- 8.2 Grant SELECT/INSERT/UPDATE/DELETE on *all tables* in 'public'
GRANT SELECT, INSERT, UPDATE, DELETE 
  ON ALL TABLES IN SCHEMA public 
  TO authenticated;

-- 8.3 Also grant usage on sequences (for auto-increment IDs)
GRANT USAGE, SELECT 
  ON ALL SEQUENCES IN SCHEMA public
  TO authenticated;

-- (Optional) For future tables/sequences automatically:
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

COMMIT;
