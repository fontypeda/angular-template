import { Injectable } from '@angular/core';
import { AuthService } from '../../auth.service';
import { CacheService } from '../utils/cache.util';
import { ErrorUtil } from '../utils/error.util';
import { SongTransformer } from '../transformers/song.transformer';
import { ArtistSongStats, DbSong } from '../interfaces/domain.interface';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  constructor(
    private authService: AuthService,
    private cacheService: CacheService
  ) {}

  async getTopArtists(): Promise<any> {
    try {
      const userId = this.validateUser();
      const cacheKey = `topArtists:${userId}`;

      return await this.cacheService.fetchWithCache(cacheKey, async () => {
        const { data, error } = await this.authService.getSupabaseClient()
          .from('artists')
          .select(`
            id,
            name,
            created_at,
            user_id,
            song_artists (
              song:songs (
                id,
                user_id,
                title,
                created_at
              )
            )
          `)
          .eq('user_id', userId);

        if (error) ErrorUtil.handleSupabaseError(error, 'getTopArtists');

        const artists = (data || []).map(artist => ({
          id: artist.id,
          name: artist.name,
          songCount: artist.song_artists?.filter(
            sa => sa.song && sa.song.user_id === userId
          ).length || 0
        }));

        return artists.sort((a, b) => b.songCount - a.songCount);
      });
    } catch (error) {
      ErrorUtil.handleSupabaseError(error, 'getTopArtists');
    }
  }

  async getArtistStatistics(artistName: string): Promise<ArtistSongStats> {
    try {
      const userId = this.validateUser();
      const cacheKey = `artistStats:${artistName}:${userId}`;

      return await this.cacheService.fetchWithCache(cacheKey, async () => {
        const artist = await this.findArtistByName(artistName);
        const songs = await this.getArtistSongs(artist.id, userId);
        const stats = this.calculateSongStats(songs);
        await this.enrichWithPlaylistData(stats, songs);
        return stats;
      });
    } catch (error) {
      ErrorUtil.handleSupabaseError(error, 'getArtistStatistics');
    }
  }

  private async findArtistByName(name: string) {
    const { data, error } = await this.authService.getSupabaseClient()
      .from('artists')
      .select('id')
      .eq('name', name)
      .single();

    if (error || !data) {
      ErrorUtil.handleSupabaseError(
        error || new Error('Artist not found'),
        'findArtistByName'
      );
    }

    return data;
  }

  private async getArtistSongs(artistId: string, userId: string): Promise<DbSong[]> {
    const { data: songArtists, error } = await this.authService.getSupabaseClient()
      .from('song_artists')
      .select(`
        song:songs (
          id,
          title,
          bpm,
          key,
          genres,
          created_at,
          user_id
        )
      `)
      .eq('artist_id', artistId);

    if (error) ErrorUtil.handleSupabaseError(error, 'getArtistSongs');

    return (songArtists || [])
      .map(item => SongTransformer.transformSupabaseSong(item.song, userId))
      .filter((song): song is NonNullable<typeof song> => song !== null);
  }

  private calculateSongStats(songs: DbSong[]): ArtistSongStats {
    const stats: ArtistSongStats = {
      totalSongs: songs.length,
      averageBpm: 0,
      genreDistribution: {},
      keyDistribution: {},
      monthlyUploads: {},
      playlistAppearances: 0
    };

    let totalBpm = 0;
    songs.forEach(song => {
      if (song.bpm) totalBpm += song.bpm;

      song.genres?.forEach(genre => {
        stats.genreDistribution[genre] = (stats.genreDistribution[genre] || 0) + 1;
      });

      if (song.key) {
        stats.keyDistribution[song.key] = (stats.keyDistribution[song.key] || 0) + 1;
      }

      const monthYear = new Date(song.created_at).toISOString().slice(0, 7);
      stats.monthlyUploads[monthYear] = (stats.monthlyUploads[monthYear] || 0) + 1;

      this.updateOldestNewestSongs(stats, song);
    });

    stats.averageBpm = songs.length ? Math.round(totalBpm / songs.length) : 0;
    return stats;
  }

  private updateOldestNewestSongs(stats: ArtistSongStats, song: DbSong): void {
    if (!stats.oldestSong || new Date(song.created_at) < new Date(stats.oldestSong.created_at)) {
      stats.oldestSong = song;
    }
    if (!stats.newestSong || new Date(song.created_at) > new Date(stats.newestSong.created_at)) {
      stats.newestSong = song;
    }
  }

  private async enrichWithPlaylistData(stats: ArtistSongStats, songs: DbSong[]): Promise<void> {
    if (!songs.length) return;

    const { data: playlistAppearances, error } = await this.authService.getSupabaseClient()
      .from('playlist_songs')
      .select('playlist_id')
      .in('song_id', songs.map(s => s.id));

    if (error) ErrorUtil.handleSupabaseError(error, 'enrichWithPlaylistData');

    const uniquePlaylists = new Set((playlistAppearances || []).map(item => item.playlist_id));
    stats.playlistAppearances = uniquePlaylists.size;
  }

  private validateUser(): string {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser?.id) throw new Error('No user logged in');
    return currentUser.id;
  }
}
