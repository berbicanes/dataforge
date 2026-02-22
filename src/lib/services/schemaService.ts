import * as tauri from '$lib/services/tauri';
import { schemaStore } from '$lib/stores/schema.svelte';
import { uiStore } from '$lib/stores/ui.svelte';
import type { SchemaInfo, TableInfo, ColumnInfo, IndexInfo, ForeignKeyInfo } from '$lib/types/schema';

export async function loadSchemas(connectionId: string): Promise<SchemaInfo[]> {
  try {
    const schemas = await tauri.getSchemas(connectionId);
    schemaStore.setSchemas(connectionId, schemas);
    return schemas;
  } catch (err) {
    uiStore.showError(`Failed to load schemas: ${err}`);
    return [];
  }
}

export async function loadTables(connectionId: string, schemaName: string): Promise<TableInfo[]> {
  // Check cache first
  const cached = schemaStore.getTables(connectionId, schemaName);
  if (cached.length > 0) return cached;

  try {
    const tables = await tauri.getTables(connectionId, schemaName);
    schemaStore.setTables(connectionId, schemaName, tables);
    return tables;
  } catch (err) {
    uiStore.showError(`Failed to load tables: ${err}`);
    return [];
  }
}

export async function loadColumns(connectionId: string, schemaName: string, tableName: string): Promise<ColumnInfo[]> {
  const cached = schemaStore.getColumns(connectionId, schemaName, tableName);
  if (cached.length > 0) return cached;

  try {
    const columns = await tauri.getColumns(connectionId, schemaName, tableName);
    schemaStore.setColumns(connectionId, schemaName, tableName, columns);
    return columns;
  } catch (err) {
    uiStore.showError(`Failed to load columns: ${err}`);
    return [];
  }
}

export async function loadIndexes(connectionId: string, schemaName: string, tableName: string): Promise<IndexInfo[]> {
  const cached = schemaStore.getIndexes(connectionId, schemaName, tableName);
  if (cached.length > 0) return cached;

  try {
    const indexes = await tauri.getIndexes(connectionId, schemaName, tableName);
    schemaStore.setIndexes(connectionId, schemaName, tableName, indexes);
    return indexes;
  } catch (err) {
    uiStore.showError(`Failed to load indexes: ${err}`);
    return [];
  }
}

export async function loadForeignKeys(connectionId: string, schemaName: string, tableName: string): Promise<ForeignKeyInfo[]> {
  const cached = schemaStore.getForeignKeys(connectionId, schemaName, tableName);
  if (cached.length > 0) return cached;

  try {
    const fks = await tauri.getForeignKeys(connectionId, schemaName, tableName);
    schemaStore.setForeignKeys(connectionId, schemaName, tableName, fks);
    return fks;
  } catch (err) {
    uiStore.showError(`Failed to load foreign keys: ${err}`);
    return [];
  }
}

export function refreshSchema(connectionId: string) {
  schemaStore.clearConnection(connectionId);
  return loadSchemas(connectionId);
}
