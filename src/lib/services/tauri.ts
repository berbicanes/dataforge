import { invoke } from '@tauri-apps/api/core';
import type { ConnectionConfig } from '$lib/types/connection';
import type { QueryResponse } from '$lib/types/query';
import type { SchemaInfo, TableInfo, ColumnInfo, IndexInfo, ForeignKeyInfo } from '$lib/types/schema';

export async function connectDb(config: ConnectionConfig): Promise<string> {
  return invoke<string>('connect_db', { config });
}

export async function disconnectDb(connectionId: string): Promise<void> {
  return invoke<void>('disconnect_db', { connectionId });
}

export async function testConnection(config: ConnectionConfig): Promise<boolean> {
  return invoke<boolean>('test_connection', { config });
}

export async function executeQuery(connectionId: string, sql: string): Promise<QueryResponse> {
  return invoke<QueryResponse>('execute_query', { connectionId, sql });
}

export async function getSchemas(connectionId: string): Promise<SchemaInfo[]> {
  return invoke<SchemaInfo[]>('get_schemas', { connectionId });
}

export async function getTables(connectionId: string, schema: string): Promise<TableInfo[]> {
  return invoke<TableInfo[]>('get_tables', { connectionId, schema });
}

export async function getColumns(connectionId: string, schema: string, table: string): Promise<ColumnInfo[]> {
  return invoke<ColumnInfo[]>('get_columns', { connectionId, schema, table });
}

export async function getIndexes(connectionId: string, schema: string, table: string): Promise<IndexInfo[]> {
  return invoke<IndexInfo[]>('get_indexes', { connectionId, schema, table });
}

export async function getForeignKeys(connectionId: string, schema: string, table: string): Promise<ForeignKeyInfo[]> {
  return invoke<ForeignKeyInfo[]>('get_foreign_keys', { connectionId, schema, table });
}

export async function getTableData(connectionId: string, schema: string, table: string, limit: number, offset: number): Promise<QueryResponse> {
  return invoke<QueryResponse>('get_table_data', { connectionId, schema, table, limit, offset });
}

export async function getRowCount(connectionId: string, schema: string, table: string): Promise<number> {
  return invoke<number>('get_row_count', { connectionId, schema, table });
}

export async function updateCell(connectionId: string, schema: string, table: string, column: string, value: string, pkColumns: string[], pkValues: string[]): Promise<void> {
  return invoke<void>('update_cell', { connectionId, schema, table, column, value, pkColumns, pkValues });
}

export async function insertRow(connectionId: string, schema: string, table: string, columns: string[], values: string[]): Promise<void> {
  return invoke<void>('insert_row', { connectionId, schema, table, columns, values });
}

export async function deleteRows(connectionId: string, schema: string, table: string, pkColumns: string[], pkValuesList: string[][]): Promise<number> {
  return invoke<number>('delete_rows', { connectionId, schema, table, pkColumns, pkValuesList });
}
