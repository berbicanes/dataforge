<p align="center">
  <img src="src-tauri/icons/128x128@2x.png" width="128" height="128" alt="QueryArk icon" />
</p>

<h1 align="center">QueryArk</h1>

<p align="center">
  A fast, lightweight database IDE for developers.<br/>
  One app for <strong>17 database engines</strong> — SQL, NoSQL, graph, key-value, and analytics.
</p>

<p align="center">
  <a href="https://github.com/berbicanes/queryark/releases"><img src="https://img.shields.io/github/v/release/berbicanes/queryark?style=flat-square&color=06b6d4" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
  <a href="https://github.com/berbicanes/queryark/actions"><img src="https://img.shields.io/github/actions/workflow/status/berbicanes/queryark/ci.yml?style=flat-square&label=CI" alt="CI"></a>
</p>

---

## Supported Databases

| SQL | Analytics | Document | Wide Column | Key-Value | Graph |
|-----|-----------|----------|-------------|-----------|-------|
| PostgreSQL | Snowflake | MongoDB | Cassandra | Redis | Neo4j |
| MySQL | BigQuery | DynamoDB | ScyllaDB | | |
| MariaDB | ClickHouse | | | | |
| SQLite | Redshift | | | | |
| MSSQL | | | | | |
| CockroachDB | | | | | |

## Features

**Query Editor**
- CodeMirror 6 with multi-dialect SQL highlighting (PostgreSQL, MySQL, SQLite, MSSQL, Cassandra)
- Schema-aware autocomplete (tables, columns, functions)
- Query formatting, comment toggle, error highlighting
- Multi-statement execution with multiple result sets
- Query history and saved queries
- EXPLAIN ANALYZE with visual tree view
- Query cancellation

**Data Grid**
- Virtual scrolling (100K+ rows)
- Inline cell editing (double-click), bulk edit mode with undo/redo
- Column sorting, filtering, resizing, reordering
- Row selection, multi-row delete, row insertion
- Type-aware editing (boolean checkbox, JSON textarea, NULL pill badges)
- Copy/paste, copy as CSV/JSON/INSERT/Markdown
- Context menu with filter-by-value

**Schema Browser**
- Expandable tree: schemas > tables > columns, views, functions, sequences, enums
- Table structure view with columns, indexes, foreign keys tabs
- DDL viewer (CREATE TABLE) with copy button
- Table creation, alteration, and index management GUIs with live DDL preview
- Search/filter within the tree
- Row count and table size stats

**NoSQL Support**
- MongoDB / DynamoDB: document browsing, JSON viewer, insert/update/delete
- Redis: type-aware viewer (string, list, set, hash, zset), scan/get/set/delete
- Neo4j: label browser, relationship types, node data grid
- Cassandra / ScyllaDB: CQL queries, schema browsing

**Connection Management**
- Connection groups/folders with color coding
- SSH tunneling (local port forwarding via russh)
- SSL certificates (CA, client cert, client key)
- OS keychain integration (macOS Keychain, Windows Credential Manager, Linux Secret Service)
- Connection URL parsing (`postgres://`, `mysql://`, `mongodb://`, `redis://`, `bolt://`, `sqlite:`)
- Connection pool tuning (pool size, idle timeout, acquire timeout)
- Connection duplication

**Data Export & Import**
- Export to CSV, JSON, SQL (INSERT statements), DDL
- Import from CSV with bulk loading
- Copy selected rows as CSV/JSON/INSERT/Markdown

**Transaction Support**
- BEGIN / COMMIT / ROLLBACK controls in the UI
- Supported for PostgreSQL, MySQL, MariaDB, SQLite, CockroachDB, Redshift

**UI & UX**
- Dark theme (default) and light theme (Catppuccin Latte) with toggle
- Tab system with drag-and-drop reordering, pinning, split panes
- Command palette (Ctrl+P) with fuzzy search
- Configurable keyboard shortcuts
- Window state and session persistence
- Settings modal (font sizes, page size, confirmations)
- Auto-updater with in-app notifications

## Installation

### Download

Grab the latest release for your platform from [GitHub Releases](https://github.com/berbicanes/queryark/releases):

| Platform | Format |
|----------|--------|
| macOS (Apple Silicon) | `.dmg` |
| macOS (Intel) | `.dmg` |
| Windows | `.exe` (NSIS installer) / `.msi` |
| Linux | `.deb` / `.rpm` / `.AppImage` |

### Build from Source

**Prerequisites:**
- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.70+
- [Tauri CLI](https://v2.tauri.app/start/prerequisites/)
- Platform-specific dependencies (see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/))

```bash
# Clone the repository
git clone https://github.com/berbicanes/queryark.git
cd queryark

# Install frontend dependencies
npm install

# Run in development mode
npm run tauri dev

# Build production binary
npm run tauri build
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop runtime | Tauri 2 (Rust) |
| Frontend | SvelteKit 5, Svelte 5 runes, TypeScript |
| SQL editor | CodeMirror 6 |
| SQL drivers | sqlx (PG, MySQL, SQLite), tiberius (MSSQL), clickhouse, snowflake-api, gcp-bigquery-client |
| NoSQL drivers | mongodb, scylla, redis, neo4rs, aws-sdk-dynamodb |
| SSH tunneling | russh |
| OS keychain | keyring |
| Styling | CSS variables, JetBrains Mono / Inter |

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Run query | `Ctrl+Enter` |
| New query tab | `Ctrl+N` |
| Close tab | `Ctrl+W` |
| Next / Previous tab | `Ctrl+Tab` / `Ctrl+Shift+Tab` |
| Command palette | `Ctrl+P` |
| Toggle sidebar | `Ctrl+B` |
| Toggle theme | `Ctrl+Shift+T` |
| Save query | `Ctrl+S` |
| Refresh schema | `F5` |
| Format SQL | `Ctrl+Shift+F` |
| Keyboard shortcuts | `Ctrl+K` |

All shortcuts are customizable in the shortcuts panel.

## Project Structure

```
src/                        # Frontend (SvelteKit + TypeScript)
├── lib/
│   ├── components/         # UI components (editor, grid, modals, sidebar, tabs)
│   ├── services/           # Tauri IPC wrappers
│   ├── stores/             # Svelte 5 rune stores
│   ├── types/              # TypeScript types
│   └── utils/              # Formatters, SQL helpers
└── routes/                 # SvelteKit pages

src-tauri/                  # Backend (Rust)
├── src/
│   ├── commands/           # Tauri command handlers
│   ├── db/
│   │   ├── drivers/        # Database driver implementations (16 drivers)
│   │   ├── traits.rs       # DbDriver, SqlDriver, DocumentDriver, KeyValueDriver, GraphDriver
│   │   ├── pool.rs         # Connection pool manager
│   │   └── handle.rs       # DriverHandle enum
│   ├── models/             # Serde structs
│   └── error.rs            # AppError enum
└── Cargo.toml
```

## Development

```bash
npm run dev              # Start Vite dev server (port 1420)
npm run build            # Build frontend
npm run tauri dev        # Run full Tauri app in dev mode
npm run tauri build      # Build production binary
npm run check            # TypeScript / Svelte type checking
```

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)
