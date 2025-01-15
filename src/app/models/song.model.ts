export interface Song {
    id: number;
    owner_id: string;
    title: string;
    artist: string;
    track_status: 'draft' | 'pending_approval' | 'released';
    is_released: boolean;
    length_seconds: number;
    audio_file_url: string;
    cover_image_url: string;
    created_at: string;
    updated_at: string;
    song_metadata?: {
        bpm: number;
        song_key: string;
        genre: string;
        mood: string;
        tags: string[];
        instruments: string[];
    };
    song_stats?: {
        play_count: number;
        last_played_date: string;
    };
}
