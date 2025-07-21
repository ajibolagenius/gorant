/**
 * Open Graph image cache store implementation
 *
 * This module provides a cache store for Open Graph images with support for
 * different storage backends (memory, localStorage, and potentially Redis in production).
 */

// Cache entry interface
interface CacheEntry<T> {
    value: T;
    expires: number; // Timestamp when this entry expires
    createdAt: number; // Timestamp when this entry was created
}

// Cache store interface
export interface CacheStore<T> {
    get(key: string): Promise<T | null>;
    set(key: string, value: T, ttl: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
}

/**
 * In-memory cache store implementation
 */
export class MemoryCacheStore<T> implements CacheStore<T> {
    private cache = new Map<string, CacheEntry<T>>();
    private maxSize: number;
    private pruneInterval: NodeJS.Timeout | null = null;

    constructor(maxSize = 100, pruneIntervalMs = 60000) {
        this.maxSize = maxSize;

        // Set up automatic pruning of expired entries
        if (typeof window !== 'undefined') {
            this.pruneInterval = setInterval(() => {
                this.pruneExpired();
            }, pruneIntervalMs);
        }
    }

    /**
     * Get a value from the cache
     */
    async get(key: string): Promise<T | null> {
        const entry = this.cache.get(key);

        // Return null if entry doesn't exist
        if (!entry) return null;

        // Check if entry has expired
        if (Date.now() > entry.expires) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    /**
     * Set a value in the cache
     */
    async set(key: string, value: T, ttl: number): Promise<void> {
        // Prune if we're at capacity
        if (this.cache.size >= this.maxSize) {
            this.prune();
        }

        // Calculate expiration time
        const now = Date.now();
        const expires = now + (ttl * 1000);

        // Store the entry
        this.cache.set(key, {
            value,
            expires,
            createdAt: now,
        });
    }

    /**
     * Check if a key exists in the cache
     */
    async has(key: string): Promise<boolean> {
        const entry = this.cache.get(key);

        // Return false if entry doesn't exist
        if (!entry) return false;

        // Check if entry has expired
        if (Date.now() > entry.expires) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Delete a key from the cache
     */
    async delete(key: string): Promise<boolean> {
        return this.cache.delete(key);
    }

    /**
     * Clear the entire cache
     */
    async clear(): Promise<void> {
        this.cache.clear();
    }

    /**
     * Get all keys in the cache
     */
    async keys(): Promise<string[]> {
        return Array.from(this.cache.keys());
    }

    /**
     * Prune expired entries from the cache
     */
    private pruneExpired(): void {
        const now = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expires) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Prune the cache when it's full
     * Uses LRU (Least Recently Used) strategy
     */
    private prune(): void {
        // If we're under capacity, no need to prune
        if (this.cache.size < this.maxSize) return;

        // Sort entries by creation time (oldest first)
        const entries = Array.from(this.cache.entries())
            .sort(([, a], [, b]) => a.createdAt - b.createdAt);

        // Remove the oldest 20% of entries
        const pruneCount = Math.max(1, Math.floor(this.maxSize * 0.2));

        for (let i = 0; i < pruneCount && i < entries.length; i++) {
            this.cache.delete(entries[i][0]);
        }
    }

    /**
     * Clean up resources when the store is no longer needed
     */
    destroy(): void {
        if (this.pruneInterval) {
            clearInterval(this.pruneInterval);
            this.pruneInterval = null;
        }
    }
}

/**
 * Local storage cache store implementation
 * For client-side caching of OG image URLs
 */
export class LocalStorageCacheStore<T> implements CacheStore<T> {
    private prefix: string;
    private maxSize: number;

    constructor(prefix = 'og-cache:', maxSize = 50) {
        this.prefix = prefix;
        this.maxSize = maxSize;
    }

    /**
     * Get a value from the cache
     */
    async get(key: string): Promise<T | null> {
        // Skip if localStorage is not available
        if (typeof localStorage === 'undefined') return null;

        try {
            const rawData = localStorage.getItem(this.prefix + key);
            if (!rawData) return null;

            const entry: CacheEntry<T> = JSON.parse(rawData);

            // Check if entry has expired
            if (Date.now() > entry.expires) {
                localStorage.removeItem(this.prefix + key);
                return null;
            }

            return entry.value;
        } catch (error) {
            console.error('Error reading from localStorage cache:', error);
            return null;
        }
    }

    /**
     * Set a value in the cache
     */
    async set(key: string, value: T, ttl: number): Promise<void> {
        // Skip if localStorage is not available
        if (typeof localStorage === 'undefined') return;

        try {
            // Prune if we're at capacity
            await this.pruneIfNeeded();

            // Calculate expiration time
            const now = Date.now();
            const expires = now + (ttl * 1000);

            // Store the entry
            const entry: CacheEntry<T> = {
                value,
                expires,
                createdAt: now,
            };

            localStorage.setItem(this.prefix + key, JSON.stringify(entry));
        } catch (error) {
            console.error('Error writing to localStorage cache:', error);
        }
    }

    /**
     * Check if a key exists in the cache
     */
    async has(key: string): Promise<boolean> {
        // Skip if localStorage is not available
        if (typeof localStorage === 'undefined') return false;

        try {
            const rawData = localStorage.getItem(this.prefix + key);
            if (!rawData) return false;

            const entry: CacheEntry<T> = JSON.parse(rawData);

            // Check if entry has expired
            if (Date.now() > entry.expires) {
                localStorage.removeItem(this.prefix + key);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error checking localStorage cache:', error);
            return false;
        }
    }

    /**
     * Delete a key from the cache
     */
    async delete(key: string): Promise<boolean> {
        // Skip if localStorage is not available
        if (typeof localStorage === 'undefined') return false;

        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Error deleting from localStorage cache:', error);
            return false;
        }
    }

    /**
     * Clear the entire cache
     */
    async clear(): Promise<void> {
        // Skip if localStorage is not available
        if (typeof localStorage === 'undefined') return;

        try {
            const keys = await this.keys();

            for (const key of keys) {
                localStorage.removeItem(this.prefix + key);
            }
        } catch (error) {
            console.error('Error clearing localStorage cache:', error);
        }
    }

    /**
     * Get all keys in the cache
     */
    async keys(): Promise<string[]> {
        // Skip if localStorage is not available
        if (typeof localStorage === 'undefined') return [];

        try {
            const keys: string[] = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);

                if (key && key.startsWith(this.prefix)) {
                    keys.push(key.slice(this.prefix.length));
                }
            }

            return keys;
        } catch (error) {
            console.error('Error getting keys from localStorage cache:', error);
            return [];
        }
    }

    /**
     * Prune the cache if it's over capacity
     */
    private async pruneIfNeeded(): Promise<void> {
        try {
            const keys = await this.keys();

            if (keys.length >= this.maxSize) {
                // Get all entries with their creation times
                const entries: Array<{ key: string; createdAt: number }> = [];

                for (const key of keys) {
                    const rawData = localStorage.getItem(this.prefix + key);
                    if (rawData) {
                        try {
                            const entry: CacheEntry<T> = JSON.parse(rawData);
                            entries.push({ key, createdAt: entry.createdAt });
                        } catch (e) {
                            // If we can't parse it, it's probably corrupted, so we'll delete it
                            localStorage.removeItem(this.prefix + key);
                        }
                    }
                }

                // Sort by creation time (oldest first)
                entries.sort((a, b) => a.createdAt - b.createdAt);

                // Remove the oldest 20% of entries
                const pruneCount = Math.max(1, Math.floor(this.maxSize * 0.2));

                for (let i = 0; i < pruneCount && i < entries.length; i++) {
                    localStorage.removeItem(this.prefix + entries[i].key);
                }
            }
        } catch (error) {
            console.error('Error pruning localStorage cache:', error);
        }
    }
}

// Create singleton instances
let memoryCache: MemoryCacheStore<Uint8Array> | null = null;
let localStorageCache: LocalStorageCacheStore<string> | null = null;

/**
 * Get the memory cache instance
 */
export const getMemoryCache = (): MemoryCacheStore<Uint8Array> => {
    if (!memoryCache) {
        memoryCache = new MemoryCacheStore<Uint8Array>(100);
    }
    return memoryCache;
};

/**
 * Get the localStorage cache instance
 */
export const getLocalStorageCache = (): LocalStorageCacheStore<string> => {
    if (!localStorageCache) {
        localStorageCache = new LocalStorageCacheStore<string>('og-cache:', 50);
    }
    return localStorageCache;
};
