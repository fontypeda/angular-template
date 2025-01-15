BEGIN;

-- 1) Insert a profile
INSERT INTO public.profiles (
  id,
  username,
  full_name,
  avatar_url,
  role
)
VALUES
(
  '13921f87-f93e-4379-acdc-3fc0b3c574ca',
  'johndoe',
  'John Doe',
  'https://example.com/avatars/johndoe.png',
  'user'
);

-- 2) Insert songs (no id column!)
INSERT INTO public.songs (
  owner_id,
  title,
  artist,
  track_status,
  is_released,
  length_seconds,
  audio_file_url,
  cover_image_url
)
VALUES
(
  '13921f87-f93e-4379-acdc-3fc0b3c574ca',
  'My First Song',
  'Artist A',
  'draft',
  false,
  180,
  'https://example.com/audio/song1.mp3',
  'https://example.com/cover/cover1.jpg'
),
(
  '13921f87-f93e-4379-acdc-3fc0b3c574ca',
  'Another Great Tune',
  'Artist B',
  'released',
  true,
  200,
  'https://example.com/audio/song2.mp3',
  'https://example.com/cover/cover2.jpg'
);

-- 3) Insert song_metadata (use the songs’ auto-generated IDs by checking them)
-- For example, if you know the first inserted row got id=1, second got id=2
-- you can do:
INSERT INTO public.song_metadata (
  song_id,
  bpm,
  song_key,
  genre,
  mood,
  tags
)
VALUES
(1, 120, 'C Major', 'Pop', 'Happy', ARRAY['upbeat','radio']),
(2, 90, 'D Minor', 'Hip-Hop', 'Moody', ARRAY['chill','vibe']);

-- 4) Insert basic stats
INSERT INTO public.song_stats (song_id, play_count, last_played_date)
VALUES
(1, 10, NOW() - INTERVAL '1 day'),
(2, 50, NOW() - INTERVAL '2 days');

-- 5) Insert contacts (again, omit id so it's auto-generated)
INSERT INTO public.contacts (
  owner_id,
  name,
  contact_type,
  email
)
VALUES
(
  '13921f87-f93e-4379-acdc-3fc0b3c574ca',
  'Artist A',
  'Artist',
  'artistA@example.com'
),
(
  '13921f87-f93e-4379-acdc-3fc0b3c574ca',
  'Writer W',
  'Writer',
  'writerW@example.com'
);

-- 6) Link songs to contacts (with royalty splits)
INSERT INTO public.song_contact (id, song_id, contact_id, role_in_song, split_percentage)
VALUES
(1, 1, 1, 'Primary Artist', 50.00),
(2, 1, 2, 'Writer', 50.00),
(3, 2, 1, 'Artist', 100.00);

-- 7) Insert a sample playlist
INSERT INTO public.playlists (id, owner_id, name, is_public)
VALUES
(1, '13921f87-f93e-4379-acdc-3fc0b3c574ca', 'My Fav Playlist', false);

-- 8) Add both songs to that playlist
INSERT INTO public.playlist_songs (id, playlist_id, song_id, order_index)
VALUES
(1, 1, 1, 1),
(2, 1, 2, 2);

-- 9) Create a share link for the playlist
INSERT INTO public.playlist_shares (id, playlist_id, share_token, share_expiration)
VALUES
(1, 1, 'abc123', NOW() + INTERVAL '7 days');

-- 10) Insert a comment on the first song
INSERT INTO public.song_comments (song_id, user_id, comment_text)
VALUES
(1, '13921f87-f93e-4379-acdc-3fc0b3c574ca', 'This is my first comment on song #1');

-- 11) Insert a rating on the second song
INSERT INTO public.song_ratings (song_id, user_id, rating)
VALUES
(2, '13921f87-f93e-4379-acdc-3fc0b3c574ca', 5);

-- 12) Insert release info for the second song
INSERT INTO public.song_release (song_id, isrc_code, distribution_channels, official_release_date)
VALUES
(2, 'USA1A2000123', ARRAY['Spotify','AppleMusic'], '2024-01-01');

COMMIT;