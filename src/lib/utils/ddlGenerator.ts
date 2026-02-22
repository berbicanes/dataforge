import type { DatabaseType } from '$lib/types/connection';
import { quoteIdentifier } from './sqlHelpers';

export interface ColumnSpec {
  name: string;
  dataType: string;
  nullable: boolean;
  defaultValue: string;
  isPrimaryKey: boolean;
}

function qualifiedTable(dbType: DatabaseType, schema: string, table: string): string {
  const q = (n: string) => quoteIdentifier(n, dbType);
  if (dbType === 'SQLite') return q(table);
  return `${q(schema)}.${q(table)}`;
}

export function generateCreateTable(
  dbType: DatabaseType,
  schema: string,
  table: string,
  columns: ColumnSpec[]
): string {
  const q = (n: string) => quoteIdentifier(n, dbType);
  const colDefs = columns.map(col => {
    let def = `  ${q(col.name)} ${col.dataType}`;
    if (!col.nullable) def += ' NOT NULL';
    if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
    return def;
  });

  const pkCols = columns.filter(c => c.isPrimaryKey);
  if (pkCols.length > 0) {
    colDefs.push(`  PRIMARY KEY (${pkCols.map(c => q(c.name)).join(', ')})`);
  }

  return `CREATE TABLE ${qualifiedTable(dbType, schema, table)} (\n${colDefs.join(',\n')}\n);`;
}

export function generateAddColumn(
  dbType: DatabaseType,
  schema: string,
  table: string,
  column: ColumnSpec
): string {
  const q = (n: string) => quoteIdentifier(n, dbType);
  let def = `${q(column.name)} ${column.dataType}`;
  if (!column.nullable) def += ' NOT NULL';
  if (column.defaultValue) def += ` DEFAULT ${column.defaultValue}`;

  return `ALTER TABLE ${qualifiedTable(dbType, schema, table)} ADD COLUMN ${def};`;
}

export function generateDropColumn(
  dbType: DatabaseType,
  schema: string,
  table: string,
  columnName: string
): string {
  const q = (n: string) => quoteIdentifier(n, dbType);
  return `ALTER TABLE ${qualifiedTable(dbType, schema, table)} DROP COLUMN ${q(columnName)};`;
}

export function generateCreateIndex(
  dbType: DatabaseType,
  schema: string,
  table: string,
  indexName: string,
  columns: string[],
  isUnique: boolean
): string {
  const q = (n: string) => quoteIdentifier(n, dbType);
  const unique = isUnique ? 'UNIQUE ' : '';
  const cols = columns.map(c => q(c)).join(', ');

  if (dbType === 'SQLite') {
    return `CREATE ${unique}INDEX ${q(indexName)} ON ${q(table)} (${cols});`;
  }
  return `CREATE ${unique}INDEX ${q(indexName)} ON ${qualifiedTable(dbType, schema, table)} (${cols});`;
}

export function generateDropIndex(
  dbType: DatabaseType,
  schema: string,
  indexName: string,
  table?: string,
): string {
  const q = (n: string) => quoteIdentifier(n, dbType);
  switch (dbType) {
    case 'MySQL':
    case 'MariaDB':
      return `DROP INDEX ${q(indexName)} ON ${qualifiedTable(dbType, schema, table ?? '')};`;
    case 'SQLite':
      return `DROP INDEX ${q(indexName)};`;
    case 'MSSQL':
      return `DROP INDEX ${q(indexName)} ON ${qualifiedTable(dbType, schema, table ?? '')};`;
    default:
      if (schema) {
        return `DROP INDEX ${q(schema)}.${q(indexName)};`;
      }
      return `DROP INDEX ${q(indexName)};`;
  }
}

export function getCommonDataTypes(dbType: DatabaseType): string[] {
  switch (dbType) {
    case 'PostgreSQL':
    case 'CockroachDB':
    case 'Redshift':
      return [
        'integer', 'bigint', 'smallint', 'serial', 'bigserial',
        'text', 'varchar(255)', 'char(1)',
        'boolean',
        'real', 'double precision', 'numeric(10,2)',
        'date', 'timestamp', 'timestamptz', 'time',
        'uuid', 'json', 'jsonb',
        'bytea',
      ];
    case 'MySQL':
    case 'MariaDB':
      return [
        'INT', 'BIGINT', 'SMALLINT', 'TINYINT',
        'VARCHAR(255)', 'TEXT', 'CHAR(1)', 'LONGTEXT',
        'BOOLEAN',
        'FLOAT', 'DOUBLE', 'DECIMAL(10,2)',
        'DATE', 'DATETIME', 'TIMESTAMP', 'TIME',
        'JSON', 'BLOB', 'ENUM', 'SET',
      ];
    case 'SQLite':
      return ['TEXT', 'INTEGER', 'REAL', 'BLOB', 'NUMERIC'];
    case 'MSSQL':
      return [
        'INT', 'BIGINT', 'SMALLINT', 'TINYINT',
        'NVARCHAR(255)', 'VARCHAR(255)', 'TEXT', 'NTEXT', 'CHAR(1)',
        'BIT',
        'FLOAT', 'REAL', 'DECIMAL(10,2)', 'MONEY',
        'DATE', 'DATETIME', 'DATETIME2', 'TIME',
        'UNIQUEIDENTIFIER', 'XML', 'VARBINARY(MAX)',
      ];
    case 'ClickHouse':
      return [
        'Int32', 'Int64', 'UInt32', 'UInt64',
        'String', 'FixedString(255)',
        'Float32', 'Float64', 'Decimal(10,2)',
        'Date', 'DateTime', 'UUID',
      ];
    default:
      return ['TEXT', 'INTEGER', 'REAL', 'BOOLEAN', 'DATE', 'TIMESTAMP'];
  }
}
