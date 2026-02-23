import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { v4 as uuidv4 } from 'uuid';
import type { ConnectionConfig, DatabaseType } from '$lib/types/connection';

interface ConnectionBundle {
  version: 1;
  exportedAt: number;
  connections: ExportedConnection[];
}

interface ExportedConnection {
  name: string;
  db_type: DatabaseType;
  host?: string;
  port?: number;
  username?: string;
  database?: string;
  use_ssl: boolean;
  file_path?: string;
  oracle_sid?: string;
  oracle_service_name?: string;
  snowflake_account?: string;
  snowflake_warehouse?: string;
  snowflake_role?: string;
  bolt_url?: string;
  aws_region?: string;
  ssh_enabled?: boolean;
  ssh_host?: string;
  ssh_port?: number;
  ssh_user?: string;
  ssh_key_path?: string;
  ssl_ca_cert?: string;
  ssl_client_cert?: string;
  ssl_client_key?: string;
  pool_max_connections?: number;
  pool_idle_timeout_secs?: number;
  pool_acquire_timeout_secs?: number;
  group?: string;
  color?: string;
}

function stripSecrets(config: ConnectionConfig): ExportedConnection {
  return {
    name: config.name,
    db_type: config.db_type,
    host: config.host,
    port: config.port,
    username: config.username,
    database: config.database,
    use_ssl: config.use_ssl,
    file_path: config.file_path,
    oracle_sid: config.oracle_sid,
    oracle_service_name: config.oracle_service_name,
    snowflake_account: config.snowflake_account,
    snowflake_warehouse: config.snowflake_warehouse,
    snowflake_role: config.snowflake_role,
    bolt_url: config.bolt_url,
    aws_region: config.aws_region,
    ssh_enabled: config.ssh_enabled,
    ssh_host: config.ssh_host,
    ssh_port: config.ssh_port,
    ssh_user: config.ssh_user,
    ssh_key_path: config.ssh_key_path,
    ssl_ca_cert: config.ssl_ca_cert,
    ssl_client_cert: config.ssl_client_cert,
    ssl_client_key: config.ssl_client_key,
    pool_max_connections: config.pool_max_connections,
    pool_idle_timeout_secs: config.pool_idle_timeout_secs,
    pool_acquire_timeout_secs: config.pool_acquire_timeout_secs,
    group: config.group,
    color: config.color,
  };
}

export async function exportConnections(configs: ConnectionConfig[]): Promise<boolean> {
  const bundle: ConnectionBundle = {
    version: 1,
    exportedAt: Date.now(),
    connections: configs.map(stripSecrets),
  };

  const path = await save({
    defaultPath: 'queryark-connections.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });

  if (!path) return false;

  await writeTextFile(path, JSON.stringify(bundle, null, 2));
  return true;
}

export async function importConnections(): Promise<ConnectionConfig[]> {
  const path = await open({
    filters: [{ name: 'JSON', extensions: ['json'] }],
    multiple: false,
  });

  if (!path) return [];

  const content = await readTextFile(path as string);
  const bundle = JSON.parse(content) as ConnectionBundle;

  if (!bundle.version || !bundle.connections || !Array.isArray(bundle.connections)) {
    throw new Error('Invalid connection bundle format');
  }

  return bundle.connections.map(exported => ({
    id: uuidv4(),
    name: exported.name,
    db_type: exported.db_type,
    host: exported.host,
    port: exported.port,
    username: exported.username,
    database: exported.database,
    use_ssl: exported.use_ssl,
    file_path: exported.file_path,
    oracle_sid: exported.oracle_sid,
    oracle_service_name: exported.oracle_service_name,
    snowflake_account: exported.snowflake_account,
    snowflake_warehouse: exported.snowflake_warehouse,
    snowflake_role: exported.snowflake_role,
    bolt_url: exported.bolt_url,
    aws_region: exported.aws_region,
    ssh_enabled: exported.ssh_enabled,
    ssh_host: exported.ssh_host,
    ssh_port: exported.ssh_port,
    ssh_user: exported.ssh_user,
    ssh_key_path: exported.ssh_key_path,
    ssl_ca_cert: exported.ssl_ca_cert,
    ssl_client_cert: exported.ssl_client_cert,
    ssl_client_key: exported.ssl_client_key,
    pool_max_connections: exported.pool_max_connections,
    pool_idle_timeout_secs: exported.pool_idle_timeout_secs,
    pool_acquire_timeout_secs: exported.pool_acquire_timeout_secs,
    group: exported.group,
    color: exported.color,
  }));
}
