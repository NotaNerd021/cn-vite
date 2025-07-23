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
  
  /**
   * Fetch the latest release from a GitHub repository
   */
  async getLatestRelease(owner: string, repo: string): Promise<GitHubRelease | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/releases/latest`);
      
      if (!response.ok) {
        console.error(`Failed to fetch latest release for ${owner}/${repo}:`, response.statusText);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching latest release for ${owner}/${repo}:`, error);
      return null;
    }
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
   * Get all app releases info
   */
  async getAllAppReleases(): Promise<{
    v2rayNG: AppReleaseInfo | null;
    v2rayN: AppReleaseInfo | null;
    flclash: AppReleaseInfo | null;
  }> {
    const [v2rayNG, v2rayN, flclash] = await Promise.all([
      this.getV2rayNGRelease(),
      this.getV2rayNRelease(),
      this.getFlClashRelease()
    ]);

    return { v2rayNG, v2rayN, flclash };
  }
}

// Export singleton instance
export const githubService = new GitHubService();
