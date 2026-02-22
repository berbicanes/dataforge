import { save, open } from '@tauri-apps/plugin-dialog';
import * as tauri from '$lib/services/tauri';
import { uiStore } from '$lib/stores/ui.svelte';
import type { ColumnDef, CellValue } from '$lib/types/query';
import { extractCellValue, isNull } from '$lib/utils/formatters';

export type ExportFormat = 'csv' | 'json' | 'sql';

const FORMAT_EXTENSIONS: Record<ExportFormat, { name: string; extensions: string[] }> = {
  csv: { name: 'CSV Files', extensions: ['csv'] },
  json: { name: 'JSON Files', extensions: ['json'] },
  sql: { name: 'SQL Files', extensions: ['sql'] },
};

export async function exportData(
  format: ExportFormat,
  opts: {
    connectionId?: string;
    schema?: string;
    table?: string;
    columns: ColumnDef[];
    rows: CellValue[][];
    exportAll?: boolean;
  },
): Promise<void> {
  const filter = FORMAT_EXTENSIONS[format];
  const defaultName = opts.table
    ? `${opts.table}.${filter.extensions[0]}`
    : `export.${filter.extensions[0]}`;

  const filePath = await save({
    defaultPath: defaultName,
    filters: [filter],
  });

  if (!filePath) return; // user cancelled

  try {
    let count: number;
    if (format === 'csv') {
      count = await tauri.exportToCsv(
        filePath, opts.columns, opts.rows,
        opts.connectionId, opts.schema, opts.table, opts.exportAll ?? false,
      );
    } else if (format === 'json') {
      count = await tauri.exportToJson(
        filePath, opts.columns, opts.rows,
        opts.connectionId, opts.schema, opts.table, opts.exportAll ?? false,
      );
    } else {
      count = await tauri.exportToSql(
        filePath, opts.columns, opts.rows,
        opts.connectionId, opts.schema, opts.table, opts.exportAll ?? false,
      );
    }
    uiStore.showSuccess(`Exported ${count} rows to ${format.toUpperCase()}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    uiStore.showError(`Export failed: ${message}`);
  }
}

export async function exportDdl(
  connectionId: string,
  schema: string,
  table: string,
): Promise<void> {
  const filePath = await save({
    defaultPath: `${table}_ddl.sql`,
    filters: [{ name: 'SQL Files', extensions: ['sql'] }],
  });

  if (!filePath) return;

  try {
    await tauri.exportDdl(connectionId, schema, table, filePath);
    uiStore.showSuccess('DDL exported successfully');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    uiStore.showError(`DDL export failed: ${message}`);
  }
}

export async function importCsvFile(
  connectionId: string,
  schema: string,
  table: string,
): Promise<boolean> {
  const filePath = await open({
    multiple: false,
    filters: [{ name: 'CSV Files', extensions: ['csv', 'tsv', 'txt'] }],
  });

  if (!filePath) return false;

  try {
    const result = await tauri.importCsv(connectionId, schema, table, filePath as string);
    if (result.rows_failed > 0) {
      uiStore.showError(
        `Imported ${result.rows_imported} rows, ${result.rows_failed} failed. ${result.errors[0] ?? ''}`,
      );
    } else {
      uiStore.showSuccess(`Imported ${result.rows_imported} rows`);
    }
    return result.rows_imported > 0;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    uiStore.showError(`Import failed: ${message}`);
    return false;
  }
}

export function copyAsCsv(columns: ColumnDef[], rows: CellValue[][]): void {
  const header = columns.map(c => c.name).join(',');
  const body = rows
    .map(row =>
      columns.map((_, i) => {
        const cell = row[i];
        if (!cell || isNull(cell)) return '';
        const val = extractCellValue(cell);
        // Quote if contains comma, newline, or double quote
        if (val.includes(',') || val.includes('\n') || val.includes('"')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(','),
    )
    .join('\n');
  navigator.clipboard.writeText(header + '\n' + body);
}

export function copyAsMarkdown(columns: ColumnDef[], rows: CellValue[][]): void {
  const header = '| ' + columns.map(c => c.name).join(' | ') + ' |';
  const separator = '| ' + columns.map(() => '---').join(' | ') + ' |';
  const body = rows
    .map(row =>
      '| ' +
      columns.map((_, i) => {
        const cell = row[i];
        if (!cell || isNull(cell)) return 'NULL';
        return extractCellValue(cell).replace(/\|/g, '\\|').replace(/\n/g, ' ');
      }).join(' | ') +
      ' |',
    )
    .join('\n');
  navigator.clipboard.writeText(header + '\n' + separator + '\n' + body);
}
