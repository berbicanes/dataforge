import type { SchemaInfo, TableInfo, ColumnInfo, IndexInfo, ForeignKeyInfo } from '$lib/types/schema';

interface SchemaCache {
  schemas: SchemaInfo[];
  tables: Record<string, TableInfo[]>; // schemaName -> tables
  columns: Record<string, ColumnInfo[]>; // "schema.table" -> columns
  indexes: Record<string, IndexInfo[]>; // "schema.table" -> indexes
  foreignKeys: Record<string, ForeignKeyInfo[]>; // "schema.table" -> fks
}

class SchemaStore {
  cache = $state<Record<string, SchemaCache>>({}); // connectionId -> SchemaCache

  getSchemas(connectionId: string): SchemaInfo[] {
    return this.cache[connectionId]?.schemas ?? [];
  }

  getTables(connectionId: string, schemaName: string): TableInfo[] {
    return this.cache[connectionId]?.tables[schemaName] ?? [];
  }

  getColumns(connectionId: string, schemaName: string, tableName: string): ColumnInfo[] {
    const key = `${schemaName}.${tableName}`;
    return this.cache[connectionId]?.columns[key] ?? [];
  }

  getIndexes(connectionId: string, schemaName: string, tableName: string): IndexInfo[] {
    const key = `${schemaName}.${tableName}`;
    return this.cache[connectionId]?.indexes[key] ?? [];
  }

  getForeignKeys(connectionId: string, schemaName: string, tableName: string): ForeignKeyInfo[] {
    const key = `${schemaName}.${tableName}`;
    return this.cache[connectionId]?.foreignKeys[key] ?? [];
  }

  setSchemas(connectionId: string, schemas: SchemaInfo[]) {
    if (!this.cache[connectionId]) {
      this.cache[connectionId] = { schemas: [], tables: {}, columns: {}, indexes: {}, foreignKeys: {} };
    }
    this.cache[connectionId].schemas = schemas;
  }

  setTables(connectionId: string, schemaName: string, tables: TableInfo[]) {
    if (!this.cache[connectionId]) {
      this.cache[connectionId] = { schemas: [], tables: {}, columns: {}, indexes: {}, foreignKeys: {} };
    }
    this.cache[connectionId].tables[schemaName] = tables;
  }

  setColumns(connectionId: string, schemaName: string, tableName: string, columns: ColumnInfo[]) {
    if (!this.cache[connectionId]) {
      this.cache[connectionId] = { schemas: [], tables: {}, columns: {}, indexes: {}, foreignKeys: {} };
    }
    this.cache[connectionId].columns[`${schemaName}.${tableName}`] = columns;
  }

  setIndexes(connectionId: string, schemaName: string, tableName: string, indexes: IndexInfo[]) {
    if (!this.cache[connectionId]) {
      this.cache[connectionId] = { schemas: [], tables: {}, columns: {}, indexes: {}, foreignKeys: {} };
    }
    this.cache[connectionId].indexes[`${schemaName}.${tableName}`] = indexes;
  }

  setForeignKeys(connectionId: string, schemaName: string, tableName: string, fks: ForeignKeyInfo[]) {
    if (!this.cache[connectionId]) {
      this.cache[connectionId] = { schemas: [], tables: {}, columns: {}, indexes: {}, foreignKeys: {} };
    }
    this.cache[connectionId].foreignKeys[`${schemaName}.${tableName}`] = fks;
  }

  clearConnection(connectionId: string) {
    delete this.cache[connectionId];
  }
}

export const schemaStore = new SchemaStore();
