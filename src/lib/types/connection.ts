export type DatabaseType = 'PostgreSQL' | 'MySQL';

export interface ConnectionConfig {
  id: string;
  name: string;
  db_type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  use_ssl: boolean;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectionState {
  config: ConnectionConfig;
  status: ConnectionStatus;
  error?: string;
}
