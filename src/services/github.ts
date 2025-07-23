// GitHub API service for fetching latest releases
export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  assets: GitHubAsset[];
}

export interface GitHubAsset {
  id: number;
  name: string;
  browser_download_url: string;
  size: number;
}

export interface AppReleaseInfo {
  version: string;
  downloadUrl: string;
  size: number;
  publishedAt: string;
}

class GitHubService {
  private readonly baseUrl = 'https://api.github.com';
  private readonly cache = new Map<string, { data: GitHubRelease | null; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  
  /**
   * Fetch the latest release from a GitHub repository with caching and timeout
   */
  async getLatestRelease(owner: string, repo: string): Promise<GitHubRelease | null> {
    const cacheKey = `${owner}/${repo}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
      
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/releases/latest`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'cn-vite-app/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`Failed to fetch latest release for ${owner}/${repo}:`, response.statusText);
        return this.getFallbackData(cacheKey);
      }
      
      const data = await response.json();
      
      // Cache successful response
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Request timeout for ${owner}/${repo}`);
      } else {
        console.warn(`Network error fetching latest release for ${owner}/${repo}:`, error);
      }
      return this.getFallbackData(cacheKey);
    }
  }
  
  /**
   * Get fallback data from cache or return null
   */
  private getFallbackData(cacheKey: string): GitHubRelease | null {
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.info(`Using cached data for ${cacheKey}`);
      return cached.data;
    }
    return null;
  }

  /**
   * Find the best matching asset from release assets based on pattern
   */
  findMatchingAsset(assets: GitHubAsset[], patterns: string[]): GitHubAsset | null {
    for (const pattern of patterns) {
      const asset = assets.find(asset => 
        asset.name.toLowerCase().includes(pattern.toLowerCase())
      );
      if (asset) return asset;
    }
    return null;
  }

  /**
   * Get v2rayNG universal APK download info
   */
  async getV2rayNGRelease(): Promise<AppReleaseInfo | null> {
    const release = await this.getLatestRelease('2dust', 'v2rayNG');
    if (!release) return null;

    const asset = this.findMatchingAsset(release.assets, [
      'universal',
      'arm64-v8a+armeabi-v7a+x86+x86_64',
      'app-universal-release'
    ]);

    if (!asset) {
      console.warn('No universal APK found in v2rayNG release');
      return null;
    }

    return {
      version: release.tag_name,
      downloadUrl: asset.browser_download_url,
      size: asset.size,
      publishedAt: release.published_at
    };
  }

  /**
   * Get v2rayN Windows SelfContained download info
   */
  async getV2rayNRelease(): Promise<AppReleaseInfo | null> {
    const release = await this.getLatestRelease('2dust', 'v2rayN');
    if (!release) return null;

    const asset = this.findMatchingAsset(release.assets, [
      'windows-64-SelfContained',
      'SelfContained',
      'windows-64'
    ]);

    if (!asset) {
      console.warn('No Windows SelfContained found in v2rayN release');
      return null;
    }

    return {
      version: release.tag_name,
      downloadUrl: asset.browser_download_url,
      size: asset.size,
      publishedAt: release.published_at
    };
  }

  /**
   * Get FlClash Windows AMD64 setup download info
   */
  async getFlClashRelease(): Promise<AppReleaseInfo | null> {
    const release = await this.getLatestRelease('chen08209', 'FlClash');
    if (!release) return null;

    const asset = this.findMatchingAsset(release.assets, [
      'windows-amd64-setup.exe',
      'amd64-setup.exe',
      'windows-setup.exe',
      'setup.exe'
    ]);

    if (!asset) {
      console.warn('No Windows AMD64 setup found in FlClash release');
      return null;
    }

    return {
      version: release.tag_name,
      downloadUrl: asset.browser_download_url,
      size: asset.size,
      publishedAt: release.published_at
    };
  }

  /**
   * Get all app releases info with better error handling
   */
  async getAllAppReleases(): Promise<{
    v2rayNG: AppReleaseInfo | null;
    v2rayN: AppReleaseInfo | null;
    flclash: AppReleaseInfo | null;
  }> {
    try {
      // Try to fetch all releases in parallel with timeout
      const [v2rayNG, v2rayN, flclash] = await Promise.allSettled([
        this.getV2rayNGRelease(),
        this.getV2rayNRelease(),
        this.getFlClashRelease()
      ]);

      return {
        v2rayNG: v2rayNG.status === 'fulfilled' ? v2rayNG.value : null,
        v2rayN: v2rayN.status === 'fulfilled' ? v2rayN.value : null,
        flclash: flclash.status === 'fulfilled' ? flclash.value : null
      };
    } catch (error) {
      console.warn('Failed to fetch some app releases:', error);
      return {
        v2rayNG: null,
        v2rayN: null,
        flclash: null
      };
    }
  }
}

// Export singleton instance
export const githubService = new GitHubService();
