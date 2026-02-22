import type { DatabaseType } from '$lib/types/connection';

export function quoteIdentifier(name: string, dbType: DatabaseType): string {
  if (dbType === 'PostgreSQL') {
    return `"${name.replace(/"/g, '""')}"`;
  }
  return `\`${name.replace(/`/g, '``')}\``;
}
