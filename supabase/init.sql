-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    bpm INT4,
    key TEXT,
    tags _TEXT,
    moods _TEXT,
    genres _TEXT,
    file_path TEXT,
    public BOOL DEFAULT false,
    writers _TEXT,
    file_url TEXT,
    types _TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create song_artists junction table
CREATE TABLE IF NOT EXISTS song_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create plays table to track song plays
CREATE TABLE IF NOT EXISTS plays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    played_at TIMESTAMPTZ DEFAULT NOW(),
    play_duration INT, -- in seconds
    completed BOOLEAN DEFAULT false
);

-- Create views for statistics
CREATE OR REPLACE VIEW song_play_stats AS
SELECT 
    s.id as song_id,
    s.title,
    COUNT(p.id) as play_count,
    COUNT(DISTINCT p.user_id) as unique_listeners,
    AVG(p.play_duration) as avg_play_duration
FROM songs s
LEFT JOIN plays p ON s.id = p.song_id
GROUP BY s.id, s.title;

CREATE OR REPLACE VIEW artist_play_stats AS
SELECT 
    a.id as artist_id,
    a.name,
    COUNT(p.id) as total_plays,
    COUNT(DISTINCT p.user_id) as unique_listeners,
    COUNT(DISTINCT s.id) as song_count
FROM artists a
JOIN song_artists sa ON a.id = sa.artist_id
JOIN songs s ON sa.song_id = s.id
LEFT JOIN plays p ON s.id = p.song_id
GROUP BY a.id, a.name;

CREATE OR REPLACE VIEW genre_play_stats AS
SELECT 
    unnest(s.genres) as genre,
    COUNT(p.id) as play_count,
    COUNT(DISTINCT s.id) as song_count,
    COUNT(DISTINCT p.user_id) as unique_listeners
FROM songs s
LEFT JOIN plays p ON s.id = p.song_id
GROUP BY genre;

CREATE OR REPLACE VIEW mood_play_stats AS
SELECT 
    unnest(s.moods) as mood,
    COUNT(p.id) as play_count,
    COUNT(DISTINCT s.id) as song_count,
    COUNT(DISTINCT p.user_id) as unique_listeners
FROM songs s
LEFT JOIN plays p ON s.id = p.song_id
WHERE s.moods IS NOT NULL
GROUP BY mood;

-- Insert sample data
INSERT INTO artists (name) VALUES
    ('Queen'),
    ('Led Zeppelin'),
    ('Eagles'),
    ('Daft Punk'),
    ('Miles Davis'),
    ('Bob Marley'),
    ('Radiohead'),
    ('Nina Simone'),
    ('Kendrick Lamar'),
    ('Massive Attack');

-- Insert sample songs with diverse genres and moods
INSERT INTO songs (title, bpm, key, genres, moods, public, file_url) VALUES
    ('Bohemian Rhapsody', 72, 'Bb', ARRAY['Rock', 'Progressive Rock'], ARRAY['Epic', 'Dramatic'], true, 'https://example.com/bohemian-rhapsody.mp3'),
    ('Stairway to Heaven', 63, 'Am', ARRAY['Rock', 'Folk Rock'], ARRAY['Mystical', 'Peaceful'], true, 'https://example.com/stairway-to-heaven.mp3'),
    ('Hotel California', 75, 'Bm', ARRAY['Rock', 'Soft Rock'], ARRAY['Mysterious', 'Nostalgic'], true, 'https://example.com/hotel-california.mp3'),
    ('Get Lucky', 116, 'Bm', ARRAY['Electronic', 'Disco', 'Pop'], ARRAY['Happy', 'Energetic'], true, 'https://example.com/get-lucky.mp3'),
    ('So What', 136, 'D', ARRAY['Jazz', 'Modal Jazz'], ARRAY['Cool', 'Sophisticated'], true, 'https://example.com/so-what.mp3'),
    ('No Woman No Cry', 74, 'C', ARRAY['Reggae'], ARRAY['Peaceful', 'Melancholic'], true, 'https://example.com/no-woman-no-cry.mp3'),
    ('Paranoid Android', 96, 'Cm', ARRAY['Alternative Rock', 'Art Rock'], ARRAY['Angry', 'Complex'], true, 'https://example.com/paranoid-android.mp3'),
    ('Feeling Good', 80, 'Em', ARRAY['Jazz', 'Soul'], ARRAY['Confident', 'Uplifting'], true, 'https://example.com/feeling-good.mp3'),
    ('Alright', 110, 'F#', ARRAY['Hip Hop', 'Rap'], ARRAY['Hopeful', 'Determined'], true, 'https://example.com/alright.mp3'),
    ('Teardrop', 103, 'E', ARRAY['Trip Hop', 'Electronic'], ARRAY['Atmospheric', 'Melancholic'], true, 'https://example.com/teardrop.mp3');

-- Link all songs with artists
INSERT INTO song_artists (song_id, artist_id)
SELECT s.id, a.id
FROM songs s, artists a
WHERE 
    (s.title = 'Bohemian Rhapsody' AND a.name = 'Queen') OR
    (s.title = 'Stairway to Heaven' AND a.name = 'Led Zeppelin') OR
    (s.title = 'Hotel California' AND a.name = 'Eagles') OR
    (s.title = 'Get Lucky' AND a.name = 'Daft Punk') OR
    (s.title = 'So What' AND a.name = 'Miles Davis') OR
    (s.title = 'No Woman No Cry' AND a.name = 'Bob Marley') OR
    (s.title = 'Paranoid Android' AND a.name = 'Radiohead') OR
    (s.title = 'Feeling Good' AND a.name = 'Nina Simone') OR
    (s.title = 'Alright' AND a.name = 'Kendrick Lamar') OR
    (s.title = 'Teardrop' AND a.name = 'Massive Attack');

-- Add varied play data over the last 7 days
WITH date_series AS (
  SELECT generate_series(
    NOW() - INTERVAL '7 days',
    NOW(),
    INTERVAL '1 hour'
  ) AS play_time
)
INSERT INTO plays (song_id, user_id, played_at, play_duration, completed)
SELECT 
    s.id,
    auth.uid(),
    d.play_time,
    CASE 
        WHEN RANDOM() < 0.1 THEN FLOOR(RANDOM() * 30 + 1)  -- 10% very short plays (skips)
        WHEN RANDOM() < 0.2 THEN FLOOR(RANDOM() * 60 + 30) -- 20% partial plays
        ELSE FLOOR(RANDOM() * 120 + 180)                   -- 70% full plays
    END,
    CASE 
        WHEN RANDOM() < 0.8 THEN true  -- 80% completion rate
        ELSE false
    END
FROM songs s
CROSS JOIN date_series d
WHERE RANDOM() < 0.3;  -- 30% chance of play per hour per song
