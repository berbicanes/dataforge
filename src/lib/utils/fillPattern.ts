/**
 * Detect a pattern in source values and generate fill values.
 *
 * - Single value → repeat
 * - Two+ numbers with constant diff → arithmetic sequence
 * - Non-numeric → cycle through source values
 */
export function detectAndFill(sourceValues: string[], count: number): string[] {
  if (sourceValues.length === 0 || count <= 0) return [];

  // Single value: repeat
  if (sourceValues.length === 1) {
    return Array(count).fill(sourceValues[0]);
  }

  // Check if all values are numeric
  const nums = sourceValues.map(v => Number(v));
  const allNumeric = sourceValues.every(v => v.trim() !== '' && !isNaN(Number(v)));

  if (allNumeric && sourceValues.length >= 2) {
    // Check for constant difference (arithmetic sequence)
    const diffs: number[] = [];
    for (let i = 1; i < nums.length; i++) {
      diffs.push(nums[i] - nums[i - 1]);
    }

    const isArithmetic = diffs.every(d => d === diffs[0]);
    if (isArithmetic) {
      const step = diffs[0];
      const result: string[] = [];
      let last = nums[nums.length - 1];
      // Detect if source values are integers
      const allIntegers = sourceValues.every(v => Number.isInteger(Number(v)));
      for (let i = 0; i < count; i++) {
        last += step;
        result.push(allIntegers ? String(Math.round(last)) : String(last));
      }
      return result;
    }
  }

  // Default: cycle through source values
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(sourceValues[i % sourceValues.length]);
  }
  return result;
}
