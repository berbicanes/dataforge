export interface FuzzyResult {
  match: boolean;
  score: number;
  ranges: [number, number][]; // pairs of [start, end] for highlighting
}

/**
 * Simple fuzzy match: each character in pattern must appear in text in order.
 * Scoring: prefix bonus, consecutive bonus, gap penalty.
 */
export function fuzzyMatch(pattern: string, text: string): FuzzyResult {
  if (!pattern) return { match: true, score: 0, ranges: [] };

  const pLower = pattern.toLowerCase();
  const tLower = text.toLowerCase();

  let pi = 0;
  let score = 0;
  let consecutive = 0;
  let lastMatchIdx = -2;
  const ranges: [number, number][] = [];
  let rangeStart = -1;

  for (let ti = 0; ti < tLower.length && pi < pLower.length; ti++) {
    if (tLower[ti] === pLower[pi]) {
      // Prefix bonus
      if (ti === pi) score += 10;
      // Consecutive bonus
      if (ti === lastMatchIdx + 1) {
        consecutive++;
        score += consecutive * 3;
      } else {
        consecutive = 0;
        // Gap penalty
        if (lastMatchIdx >= 0) score -= (ti - lastMatchIdx - 1);
      }
      // Word boundary bonus (start of word)
      if (ti === 0 || tLower[ti - 1] === ' ' || tLower[ti - 1] === '_' || tLower[ti - 1] === '-' || tLower[ti - 1] === '.') {
        score += 5;
      }
      // Case match bonus
      if (text[ti] === pattern[pi]) score += 1;

      score += 1; // base match score

      // Build ranges
      if (rangeStart === -1) {
        rangeStart = ti;
      }
      if (ti !== lastMatchIdx + 1 && rangeStart < ti) {
        // Close previous range, start new
        if (lastMatchIdx >= 0 && rangeStart <= lastMatchIdx) {
          ranges.push([rangeStart, lastMatchIdx + 1]);
        }
        rangeStart = ti;
      }

      lastMatchIdx = ti;
      pi++;
    } else {
      // Close range if in one
      if (rangeStart !== -1 && lastMatchIdx >= rangeStart) {
        ranges.push([rangeStart, lastMatchIdx + 1]);
        rangeStart = -1;
      }
    }
  }

  // Close final range
  if (rangeStart !== -1 && lastMatchIdx >= rangeStart) {
    ranges.push([rangeStart, lastMatchIdx + 1]);
  }

  if (pi < pLower.length) {
    return { match: false, score: 0, ranges: [] };
  }

  // Length penalty — prefer shorter matches
  score -= Math.floor(text.length / 10);

  return { match: true, score, ranges };
}

export interface FuzzyItem<T> {
  item: T;
  score: number;
  ranges: [number, number][];
}

/**
 * Filter and sort items by fuzzy match score.
 */
export function fuzzyFilter<T>(
  pattern: string,
  items: T[],
  getText: (item: T) => string,
): FuzzyItem<T>[] {
  if (!pattern) return items.map(item => ({ item, score: 0, ranges: [] }));

  const results: FuzzyItem<T>[] = [];

  for (const item of items) {
    const text = getText(item);
    const result = fuzzyMatch(pattern, text);
    if (result.match) {
      results.push({ item, score: result.score, ranges: result.ranges });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}
