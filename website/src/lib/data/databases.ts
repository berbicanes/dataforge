export interface DatabaseInfo {
  name: string;
  badge: string;
  color: string;
  bgColor: string;
  group: 'SQL' | 'Analytics' | 'NoSQL' | 'Cloud';
}

export const databases: DatabaseInfo[] = [
  { name: 'PostgreSQL', badge: 'PG', color: '#7aa2f7', bgColor: 'rgba(122, 162, 247, 0.2)', group: 'SQL' },
  { name: 'MySQL', badge: 'MY', color: '#f9e2af', bgColor: 'rgba(249, 226, 175, 0.2)', group: 'SQL' },
  { name: 'MariaDB', badge: 'MA', color: '#cba6f7', bgColor: 'rgba(203, 166, 247, 0.2)', group: 'SQL' },
  { name: 'SQLite', badge: 'SL', color: '#94e2d5', bgColor: 'rgba(148, 226, 213, 0.2)', group: 'SQL' },
  { name: 'SQL Server', badge: 'MS', color: '#f38ba8', bgColor: 'rgba(243, 139, 168, 0.2)', group: 'SQL' },
  { name: 'CockroachDB', badge: 'CR', color: '#a6e3a1', bgColor: 'rgba(166, 227, 161, 0.2)', group: 'SQL' },
  { name: 'Redshift', badge: 'RS', color: '#f38ba8', bgColor: 'rgba(243, 139, 168, 0.2)', group: 'Analytics' },
  { name: 'ClickHouse', badge: 'CH', color: '#f9e2af', bgColor: 'rgba(249, 226, 175, 0.2)', group: 'Analytics' },
  { name: 'Snowflake', badge: 'SF', color: '#89dceb', bgColor: 'rgba(137, 220, 235, 0.2)', group: 'Analytics' },
  { name: 'BigQuery', badge: 'BQ', color: '#74c7ec', bgColor: 'rgba(116, 199, 236, 0.2)', group: 'Analytics' },
  { name: 'MongoDB', badge: 'MO', color: '#a6e3a1', bgColor: 'rgba(166, 227, 161, 0.2)', group: 'NoSQL' },
  { name: 'Redis', badge: 'RD', color: '#f38ba8', bgColor: 'rgba(243, 139, 168, 0.2)', group: 'NoSQL' },
  { name: 'Cassandra', badge: 'CA', color: '#89b4fa', bgColor: 'rgba(137, 180, 250, 0.2)', group: 'NoSQL' },
  { name: 'ScyllaDB', badge: 'SC', color: '#fab387', bgColor: 'rgba(250, 179, 135, 0.2)', group: 'NoSQL' },
  { name: 'Neo4j', badge: 'NJ', color: '#94e2d5', bgColor: 'rgba(148, 226, 213, 0.2)', group: 'NoSQL' },
  { name: 'DynamoDB', badge: 'DY', color: '#f9e2af', bgColor: 'rgba(249, 226, 175, 0.2)', group: 'Cloud' },
];

export const dbGroups = ['SQL', 'Analytics', 'NoSQL', 'Cloud'] as const;
