import { platforms as fallbackPlatforms, VERSION as FALLBACK_VERSION } from '$lib/data/downloads';
import type { PlatformDownload } from '$lib/data/downloads';

const GITHUB_RELEASES_API = 'https://api.github.com/repos/berbicanes/queryark/releases/latest';

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

function buildPlatforms(version: string, assets: GitHubAsset[]): PlatformDownload[] {
  function findAsset(pattern: string): GitHubAsset | undefined {
    return assets.find((a) => a.name.includes(pattern));
  }

  const macArm = findAsset('aarch64.dmg');
  const macIntel = findAsset('x64.dmg');
  const winExe = findAsset('x64-setup.exe');
  const winMsi = findAsset('x64_en-US.msi');
  const linuxAppImage = findAsset('.AppImage');
  const linuxDeb = findAsset('.deb');
  const linuxRpm = findAsset('.rpm');

  return [
    {
      platform: 'macOS',
      icon: 'apple',
      description: 'Universal binary for Apple Silicon and Intel Macs.',
      options: [
        ...(macArm
          ? [{ label: 'Apple Silicon (.dmg)', filename: macArm.name, url: macArm.browser_download_url, primary: true, arch: 'ARM64' }]
          : []),
        ...(macIntel
          ? [{ label: 'Intel (.dmg)', filename: macIntel.name, url: macIntel.browser_download_url, arch: 'x86_64' }]
          : []),
      ],
      requirements: 'macOS 10.15 (Catalina) or later',
    },
    {
      platform: 'Windows',
      icon: 'windows',
      description: 'Installer or portable MSI for Windows 10+.',
      options: [
        ...(winExe
          ? [{ label: 'Installer (.exe)', filename: winExe.name, url: winExe.browser_download_url, primary: true, arch: 'x86_64' }]
          : []),
        ...(winMsi
          ? [{ label: 'MSI Package (.msi)', filename: winMsi.name, url: winMsi.browser_download_url, arch: 'x86_64' }]
          : []),
      ],
      requirements: 'Windows 10 or later (64-bit)',
    },
    {
      platform: 'Linux',
      icon: 'linux',
      description: 'Available as AppImage, .deb, or .rpm.',
      options: [
        ...(linuxAppImage
          ? [{ label: 'AppImage', filename: linuxAppImage.name, url: linuxAppImage.browser_download_url, primary: true, arch: 'x86_64' }]
          : []),
        ...(linuxDeb
          ? [{ label: 'Debian (.deb)', filename: linuxDeb.name, url: linuxDeb.browser_download_url, arch: 'x86_64' }]
          : []),
        ...(linuxRpm
          ? [{ label: 'RPM (.rpm)', filename: linuxRpm.name, url: linuxRpm.browser_download_url, arch: 'x86_64' }]
          : []),
      ],
      requirements: 'Ubuntu 22.04+, Fedora 38+, or equivalent with WebKitGTK 4.1',
    },
  ];
}

export async function load({ fetch }) {
  try {
    const res = await fetch(GITHUB_RELEASES_API, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);

    const release: { tag_name: string; assets: GitHubAsset[] } = await res.json();
    const version = release.tag_name.replace(/^v/, '');
    const platforms = buildPlatforms(version, release.assets);

    return { version, platforms };
  } catch {
    return { version: FALLBACK_VERSION, platforms: fallbackPlatforms };
  }
}
