export class CacheService {
  private cache = new Map<string, { data: any; timestamp: number }>();

  async fetchWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    expirationMs: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < expirationMs) {
      return cached.data as T;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheEntry(key: string): void {
    this.cache.delete(key);
  }
}
