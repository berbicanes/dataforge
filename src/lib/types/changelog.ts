export interface ChangelogEntry {
  version: string;
  date: string;
  highlights: string[];
  category: 'feature' | 'fix' | 'improvement';
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.2.1',
    date: '2026-02-23',
    highlights: [
      'Welcome screen redesign with improved onboarding',
      'Cell inspector sidebar for viewing large values',
      'MSSQL Azure connection fix',
      'Database backup/dump to .sql file with progress tracking',
      'Schema selector with multi-schema visibility',
      'Schema context menu (create/drop schema, new query)',
      'Cross-schema query support',
      'Performance & reliability improvements (keepalive, virtual tree, LRU cache)',
      'Multi-cell selection, drag-fill, paste from Excel/CSV',
      'ER diagram viewer, visual query builder, table/data diff',
      'Query result charts, parameterized queries, query profiling',
      'Config auto-backup, crash reporting, E2E test scaffolding',
    ],
    category: 'feature',
  },
  {
    version: '0.2.0',
    date: '2026-02-23',
    highlights: [
      'Crash reporting with Sentry (opt-in)',
      'Anonymous usage telemetry (opt-out by default)',
      'In-app "What\'s New" changelog after updates',
      'Automatic config backup with restore support',
      'End-to-end test scaffolding with Playwright',
      'Auto-suggest indexes for slow queries',
      'Query result charts (bar, line, pie)',
      'Side-by-side result comparison',
      'Parameterized query execution',
      'Query profiling dashboard with optimization hints',
    ],
    category: 'feature',
  },
  {
    version: '0.1.0',
    date: '2026-01-01',
    highlights: [
      'Initial release with 17 database engine support',
      'Query editor with CodeMirror 6',
      'Inline cell editing, row insertion/deletion',
      'Connection management with SSH tunneling and SSL',
      'ER diagram viewer and visual query builder',
      'Table/data diff and migration generator',
    ],
    category: 'feature',
  },
];
