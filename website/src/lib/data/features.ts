export interface Feature {
  number: string;
  title: string;
  description: string;
  highlights: string[];
  mockupType: 'laptop' | 'tablet' | 'phone';
}

export const features: Feature[] = [
  {
    number: '01',
    title: 'Powerful SQL Editor',
    description: 'Write queries with confidence. Schema-aware autocomplete, syntax highlighting for every dialect, multi-statement execution, and query formatting — all powered by CodeMirror 6.',
    highlights: [
      'Schema-aware autocomplete',
      'Multi-dialect syntax highlighting',
      'Query history & saved queries',
      'EXPLAIN ANALYZE visualization',
    ],
    mockupType: 'laptop',
  },
  {
    number: '02',
    title: 'Interactive Data Grid',
    description: 'Browse and edit data like a spreadsheet. Inline editing, multi-cell selection, drag-fill, find & replace, and foreign key dropdowns make data manipulation effortless.',
    highlights: [
      'Inline cell editing',
      'Multi-cell selection & drag-fill',
      'Sort, filter, and resize columns',
      'Export to CSV, JSON, or SQL',
    ],
    mockupType: 'tablet',
  },
  {
    number: '03',
    title: 'Visual Database Tools',
    description: 'Understand your schema at a glance. Interactive ER diagrams, visual query builder, table diff across environments, and automatic migration generation.',
    highlights: [
      'ER diagram with zoom & pan',
      'Drag-and-drop query builder',
      'Schema diff between environments',
      'Migration script generation',
    ],
    mockupType: 'laptop',
  },
  {
    number: '04',
    title: 'Schema Browser',
    description: 'Navigate databases with ease. Expandable tree with schemas, tables, columns, indexes, and foreign keys. Virtual scrolling handles thousands of tables effortlessly.',
    highlights: [
      'Expandable schema tree',
      'Table stats & DDL viewer',
      'Favorite tables for quick access',
      'Multi-schema visibility',
    ],
    mockupType: 'phone',
  },
  {
    number: '05',
    title: 'Built for Developers',
    description: 'Secure connections, keyboard-driven workflow, and a polished desktop experience. SSH tunneling, SSL certificates, OS keychain integration, and configurable shortcuts.',
    highlights: [
      'SSH tunneling & SSL certs',
      'OS keychain for passwords',
      'Customizable keyboard shortcuts',
      'Workspace profiles & session restore',
    ],
    mockupType: 'tablet',
  },
];
