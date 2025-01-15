import { Injectable } from '@angular/core';
import { AuthService } from '../../auth.service';
import { CacheService } from '../utils/cache.util';
import { ErrorUtil } from '../utils/error.util';
import { DbPlaylist } from '../interfaces/domain.interface';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  constructor(
    private authService: AuthService,
    private cacheService: CacheService
  ) {}

  async getPlaylists(): Promise<DbPlaylist[]> {
    try {
      const userId = this.validateUser();
      const cacheKey = `playlists:${userId}`;

      return await this.cacheService.fetchWithCache(cacheKey, async () => {
        const { data, error } = await this.authService.getSupabaseClient()
          .from('playlists')
          .select('*')
          .eq('user_id', userId);

        if (error) ErrorUtil.handleSupabaseError(error, 'getPlaylists');
        return data || [];
      });
    } catch (error) {
      ErrorUtil.handleSupabaseError(error, 'getPlaylists');
    }
  }

  private validateUser(): string {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser?.id) throw new Error('No user logged in');
    return currentUser.id;
  }
}
