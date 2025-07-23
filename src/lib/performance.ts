// Performance optimization utilities

/**
 * Debounce function to limit API calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit function calls
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if user is on a slow connection
 */
export function isSlowConnection(): boolean {
  if ('connection' in navigator) {
    const connection = (navigator as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    return Boolean(connection && (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      connection.saveData === true
    ));
  }
  return false;
}

/**
 * Preload critical resources
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Cache manager for localStorage with expiration
 */
export class CacheManager {
  private static readonly PREFIX = 'cn-vite-cache-';
  
  static set(key: string, data: unknown, expirationMinutes: number = 5): void {
    const item = {
      data,
      timestamp: Date.now(),
      expiration: expirationMinutes * 60 * 1000
    };
    
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }
  
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      const now = Date.now();
      
      if (now - parsed.timestamp > parsed.expiration) {
        this.remove(key);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.warn('Failed to get cached data:', error);
      return null;
    }
  }
  
  static remove(key: string): void {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  }
  
  static clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}

/**
 * Network status detector
 */
export class NetworkMonitor {
  private static listeners: Array<(online: boolean) => void> = [];
  
  static init(): void {
    window.addEventListener('online', () => this.notifyListeners(true));
    window.addEventListener('offline', () => this.notifyListeners(false));
  }
  
  static isOnline(): boolean {
    return navigator.onLine;
  }
  
  static addListener(callback: (online: boolean) => void): void {
    this.listeners.push(callback);
  }
  
  static removeListener(callback: (online: boolean) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  private static notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online));
  }
}
