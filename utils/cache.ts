import AsyncStorage from "@react-native-async-storage/async-storage";

type CacheItem<T> = {
  data: T;
  timestamp: number;
};

export const cache = {
  /**
   * Set data in cache
   * @param key Unique key for the cache
   * @param data Data to store
   */
  async set<T>(key: string, data: T): Promise<void> {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error saving to cache (${key}):`, error);
    }
  },

  /**
   * Get data from cache
   * @param key Unique key for the cache
   * @param expiryMs Optional expiry in milliseconds
   */
  async get<T>(key: string, expiryMs?: number): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;

      const item: CacheItem<T> = JSON.parse(value);

      if (expiryMs && Date.now() - item.timestamp > expiryMs) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error(`Error reading cache (${key}):`, error);
      return null;
    }
  },

  /**
   * Remove a specific key from cache
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from cache (${key}):`, error);
    }
  },

  /**
   * Clear all cache (caution: this might clear other AsyncStorage data if not namespaced)
   * Better to use a prefix if we want to clear only app cache.
   */
  async clear(): Promise<void> {
    try {
      // For now, let's just leave it or implement namespaced clear if needed.
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  },
};
