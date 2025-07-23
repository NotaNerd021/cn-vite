import { useEffect, useState, useCallback } from 'react';
import { NetworkMonitor } from '@/lib/performance';

/**
 * Hook to monitor network status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(NetworkMonitor.isOnline());

  useEffect(() => {
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online);
    };

    NetworkMonitor.addListener(handleNetworkChange);

    return () => {
      NetworkMonitor.removeListener(handleNetworkChange);
    };
  }, []);

  return isOnline;
}

/**
 * Hook to track page performance metrics
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<{
    loadTime: number;
    renderTime: number;
    firstContentfulPaint: number;
  } | null>(null);

  useEffect(() => {
    // Measure initial load time
    const measurePerformance = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
        
        setMetrics({
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstContentfulPaint: fcpEntry ? fcpEntry.startTime : 0
        });
      }
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  return metrics;
}

/**
 * Hook to handle retry logic with exponential backoff
 */
export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const retry = useCallback(async (): Promise<T | null> => {
    setIsRetrying(true);
    setError(null);
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await asyncFunction();
        setRetryCount(0);
        setIsRetrying(false);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        setRetryCount(attempt + 1);
        
        if (attempt < maxRetries) {
          // Exponential backoff: delay increases with each retry
          const delay = initialDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    setIsRetrying(false);
    return null;
  }, [asyncFunction, maxRetries, initialDelay]);

  return {
    retry,
    isRetrying,
    retryCount,
    error
  };
}

/**
 * Hook to track API request performance
 */
export function useRequestMetrics() {
  const [metrics, setMetrics] = useState<{
    totalRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    slowRequests: number; // requests > 2 seconds
  }>({
    totalRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    slowRequests: 0
  });

  const [responseTimes, setResponseTimes] = useState<number[]>([]);

  const recordRequest = useCallback((responseTime: number, success: boolean) => {
    setMetrics(prev => {
      const newResponseTimes = [...responseTimes, responseTime].slice(-100); // Keep last 100 requests
      setResponseTimes(newResponseTimes);
      
      return {
        totalRequests: prev.totalRequests + 1,
        failedRequests: success ? prev.failedRequests : prev.failedRequests + 1,
        averageResponseTime: newResponseTimes.reduce((a, b) => a + b, 0) / newResponseTimes.length,
        slowRequests: responseTime > 2000 ? prev.slowRequests + 1 : prev.slowRequests
      };
    });
  }, [responseTimes]);

  return {
    metrics,
    recordRequest
  };
}

/**
 * Hook to detect slow connections
 */
export function useConnectionQuality() {
  const [connectionQuality, setConnectionQuality] = useState<'fast' | 'slow' | 'offline'>('fast');
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (!isOnline) {
      setConnectionQuality('offline');
      return;
    }

    // Check connection quality using performance API
    if ('connection' in navigator) {
      const connection = (navigator as { connection?: { effectiveType?: string; downlink?: number } }).connection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink || 0;
        
        if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
          setConnectionQuality('slow');
        } else {
          setConnectionQuality('fast');
        }
      }
    }
  }, [isOnline]);

  return connectionQuality;
}
