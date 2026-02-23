export const VERSION = '0.2.1';
const BASE_URL = `https://github.com/berbicanes/queryark/releases/latest/download`;

export interface DownloadOption {
  label: string;
  filename: string;
  url: string;
  primary?: boolean;
  arch?: string;
}

export interface PlatformDownload {
  platform: 'macOS' | 'Windows' | 'Linux';
  icon: string;
  description: string;
  options: DownloadOption[];
  requirements: string;
}

export const platforms: PlatformDownload[] = [
  {
    platform: 'macOS',
    icon: 'apple',
    description: 'Universal binary for Apple Silicon and Intel Macs.',
    options: [
      {
        label: 'Apple Silicon (.dmg)',
        filename: `queryark_${VERSION}_aarch64.dmg`,
        url: `${BASE_URL}/queryark_${VERSION}_aarch64.dmg`,
        primary: true,
        arch: 'ARM64',
      },
      {
        label: 'Intel (.dmg)',
        filename: `queryark_${VERSION}_x64.dmg`,
        url: `${BASE_URL}/queryark_${VERSION}_x64.dmg`,
        arch: 'x86_64',
      },
    ],
    requirements: 'macOS 10.15 (Catalina) or later',
  },
  {
    platform: 'Windows',
    icon: 'windows',
    description: 'Installer or portable MSI for Windows 10+.',
    options: [
      {
        label: 'Installer (.exe)',
        filename: `queryark_${VERSION}_x64-setup.exe`,
        url: `${BASE_URL}/queryark_${VERSION}_x64-setup.exe`,
        primary: true,
        arch: 'x86_64',
      },
      {
        label: 'MSI Package (.msi)',
        filename: `queryark_${VERSION}_x64_en-US.msi`,
        url: `${BASE_URL}/queryark_${VERSION}_x64_en-US.msi`,
        arch: 'x86_64',
      },
    ],
    requirements: 'Windows 10 or later (64-bit)',
  },
  {
    platform: 'Linux',
    icon: 'linux',
    description: 'Available as AppImage, .deb, or .rpm.',
    options: [
      {
        label: 'AppImage',
        filename: `queryark_${VERSION}_amd64.AppImage`,
        url: `${BASE_URL}/queryark_${VERSION}_amd64.AppImage`,
        primary: true,
        arch: 'x86_64',
      },
      {
        label: 'Debian (.deb)',
        filename: `queryark_${VERSION}_amd64.deb`,
        url: `${BASE_URL}/queryark_${VERSION}_amd64.deb`,
        arch: 'x86_64',
      },
      {
        label: 'RPM (.rpm)',
        filename: `queryark-${VERSION}-1.x86_64.rpm`,
        url: `${BASE_URL}/queryark-${VERSION}-1.x86_64.rpm`,
        arch: 'x86_64',
      },
    ],
    requirements: 'Ubuntu 22.04+, Fedora 38+, or equivalent with WebKitGTK 4.1',
  },
];