import { CHANGELOG, type ChangelogEntry } from '$lib/data/changelog';

const GITHUB_API = 'https://github.com/berbicanes/queryark/releases';
const GITHUB_RELEASES_API = 'https://api.github.com/repos/berbicanes/queryark/releases';

function parseReleaseBody(body: string): string[] {
  return body
    .split('\n')
    .map((line) => line.replace(/^[-*]\s+/, '').trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

function categorizeRelease(name: string): ChangelogEntry['category'] {
  const lower = name.toLowerCase();
  if (lower.includes('fix') || lower.includes('patch') || lower.includes('hotfix')) return 'fix';
  if (lower.includes('improve') || lower.includes('refactor') || lower.includes('polish')) return 'improvement';
  return 'feature';
}

export async function load({ fetch }) {
  try {
    const res = await fetch(GITHUB_RELEASES_API, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);

    const releases: Array<{
      tag_name: string;
      name: string | null;
      published_at: string;
      body: string | null;
      draft: boolean;
    }> = await res.json();

    const entries: ChangelogEntry[] = releases
      .filter((r) => !r.draft)
      .map((r) => ({
        version: r.tag_name.replace(/^v/, ''),
        date: r.published_at.split('T')[0],
        highlights: r.body ? parseReleaseBody(r.body) : [],
        category: categorizeRelease(r.name || r.tag_name),
      }))
      .filter((e) => e.highlights.length > 0);

    return { changelog: entries.length > 0 ? entries : CHANGELOG };
  } catch {
    // Fallback to static data if API is unreachable (e.g. rate-limited, no network)
    return { changelog: CHANGELOG };
  }
}
