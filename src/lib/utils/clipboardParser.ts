/**
 * Parse clipboard text (TSV or CSV) into a 2D array of strings.
 * Auto-detects TSV vs CSV based on presence of tabs.
 */
export function parseClipboardText(text: string): string[][] {
  if (!text || text.trim().length === 0) return [];

  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Remove trailing newline if present
  const trimmed = normalized.endsWith('\n') ? normalized.slice(0, -1) : normalized;

  // Detect delimiter: if tabs are present, use TSV; otherwise CSV
  const delimiter = trimmed.includes('\t') ? '\t' : ',';

  if (delimiter === '\t') {
    // Simple TSV parsing (no quoting needed)
    return trimmed.split('\n').map(line => line.split('\t'));
  }

  // CSV parsing with quote handling
  return trimmed.split('\n').map(line => parseCsvLine(line));
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  let field = '';
  let inQuotes = false;

  while (i < line.length) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote
          field += '"';
          i += 2;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"' && field.length === 0) {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        fields.push(field);
        field = '';
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  fields.push(field);
  return fields;
}
