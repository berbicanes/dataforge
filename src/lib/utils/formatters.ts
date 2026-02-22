import type { CellValue } from '$lib/types/query';

export function extractCellValue(cell: CellValue): string {
  switch (cell.type) {
    case 'Null': return 'NULL';
    case 'Bool': return cell.value ? 'true' : 'false';
    case 'Int': return cell.value.toString();
    case 'Float': return cell.value.toString();
    case 'Text': return cell.value;
    case 'Timestamp': return cell.value;
    case 'Binary': return `[${cell.value.length} bytes]`;
    case 'Json': return cell.value;
    default: return '';
  }
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatRowCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function isNull(cell: CellValue): boolean {
  return cell.type === 'Null';
}
