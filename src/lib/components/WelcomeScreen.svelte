<script lang="ts">
  import { connectionStore } from '$lib/stores/connections.svelte';
  import { uiStore } from '$lib/stores/ui.svelte';
  import * as connectionService from '$lib/services/connectionService';
  import { DB_METADATA, DB_GROUPS } from '$lib/types/database';
  import type { DatabaseType, ConnectionState } from '$lib/types/connection';

  let { onAddConnection }: { onAddConnection: () => void } = $props();

  /** Badge class → CSS color value for the colored dots */
  const DOT_COLORS: Record<string, string> = {
    'badge-pg': 'var(--accent)',
    'badge-mysql': 'var(--warning)',
    'badge-mariadb': '#cba6f7',
    'badge-sqlite': '#94e2d5',
    'badge-mssql': 'var(--error)',
    'badge-oracle': '#fab387',
    'badge-cockroach': 'var(--success)',
    'badge-redshift': '#f38ba8',
    'badge-clickhouse': '#f9e2af',
    'badge-snowflake': '#89dceb',
    'badge-bigquery': '#74c7ec',
    'badge-mongodb': '#a6e3a1',
    'badge-cassandra': '#89b4fa',
    'badge-scylladb': '#fab387',
    'badge-redis': '#f38ba8',
    'badge-neo4j': '#94e2d5',
    'badge-dynamodb': '#f9e2af',
  };

  let hasConnections = $derived(connectionStore.connections.length > 0);

  // Grouped connections for dashboard
  let groups = $derived(connectionStore.groups);
  let ungrouped = $derived(connectionStore.getConnectionsByGroup(null));

  function handleCardClick(conn: ConnectionState) {
    connectionStore.setActive(conn.config.id);
    if (conn.status !== 'connected') {
      connectionService.connect(conn.config);
    }
    uiStore.dismissHome();
  }

  function handleCardDblClick(conn: ConnectionState) {
    connectionStore.setActive(conn.config.id);
    if (conn.status !== 'connected') {
      connectionService.connect(conn.config);
    }
    uiStore.dismissHome();
  }

  let hasConnectedSqlDbs = $derived(
    connectionStore.connections.some(c => {
      if (c.status !== 'connected') return false;
      const cat = DB_METADATA[c.config.db_type]?.category;
      return cat === 'Relational' || cat === 'Analytics' || cat === 'WideColumn';
    })
  );

  function handleBackupDatabase() {
    uiStore.databaseBackupConnectionId = null;
    uiStore.showDatabaseBackupModal = true;
  }
</script>

<div class="welcome-screen">
  {#if !hasConnections}
    <!-- Hero state — no connections yet -->
    <div class="welcome-hero">
      <div class="hero-brand">
        <svg class="brand-glyph" width="36" height="36" viewBox="0 0 36 36" fill="none">
          <ellipse cx="18" cy="10" rx="12" ry="5" stroke="var(--accent)" stroke-width="2" fill="rgba(122, 162, 247, 0.12)"/>
          <path d="M6 10v8c0 2.76 5.37 5 12 5s12-2.24 12-5v-8" stroke="var(--accent)" stroke-width="2" fill="none"/>
          <path d="M6 18v8c0 2.76 5.37 5 12 5s12-2.24 12-5v-8" stroke="var(--accent)" stroke-width="2" fill="none" opacity="0.6"/>
        </svg>
        <h1 class="brand-name">QueryArk</h1>
      </div>
      <p class="tagline">A fast, lightweight database IDE for developers</p>

      <button class="cta-btn" onclick={onAddConnection}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Add Your First Connection
      </button>

      <!-- Database showcase grouped by category -->
      <div class="db-showcase">
        {#each DB_GROUPS as group}
          <div class="db-group">
            <div class="db-group-label">{group.name}</div>
            <div class="db-group-items">
              {#each group.types as dbType}
                {@const meta = DB_METADATA[dbType]}
                <div class="db-item">
                  <span class="db-dot" style="background: {DOT_COLORS[meta.badgeClass] || 'var(--text-muted)'}"></span>
                  <span class="db-name">{meta.label}</span>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <!-- Feature highlights -->
      <div class="features">
        <div class="feature">
          <div class="feature-icon">
            <!-- Code editor: terminal prompt with cursor -->
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="1.5" y="2.5" width="17" height="15" rx="2.5" stroke="var(--accent)" stroke-width="1.4"/>
              <path d="M5 8l3 2.5L5 13" stroke="var(--accent)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M11 13h4" stroke="var(--accent)" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </div>
          <span>SQL Editor</span>
        </div>
        <div class="feature">
          <div class="feature-icon">
            <!-- Flow diagram: two nodes connected -->
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="1.5" y="3" width="6" height="5" rx="1.5" stroke="var(--accent)" stroke-width="1.4"/>
              <rect x="12.5" y="12" width="6" height="5" rx="1.5" stroke="var(--accent)" stroke-width="1.4"/>
              <path d="M7.5 5.5H11a1.5 1.5 0 011.5 1.5v5.5" stroke="var(--accent)" stroke-width="1.4" stroke-linecap="round"/>
              <path d="M12.5 14.5H9a1.5 1.5 0 01-1.5-1.5V8" stroke="var(--accent)" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </div>
          <span>Visual Query Builder</span>
        </div>
        <div class="feature">
          <div class="feature-icon">
            <!-- Database stack: three-layer cylinder -->
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <ellipse cx="10" cy="5.5" rx="7" ry="3" stroke="var(--accent)" stroke-width="1.4"/>
              <path d="M3 5.5v4.5c0 1.66 3.13 3 7 3s7-1.34 7-3V5.5" stroke="var(--accent)" stroke-width="1.4"/>
              <path d="M3 10v4.5c0 1.66 3.13 3 7 3s7-1.34 7-3V10" stroke="var(--accent)" stroke-width="1.4" opacity="0.6"/>
            </svg>
          </div>
          <span>17 Databases</span>
        </div>
      </div>
    </div>
  {:else}
    <!-- Dashboard state — has connections -->
    <div class="dashboard">
      <div class="dashboard-header">
        <div class="dashboard-brand">
          <span class="dashboard-title">QueryArk</span>
          <span class="dashboard-divider"></span>
          <span class="dashboard-count">{connectionStore.connections.length} connection{connectionStore.connections.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      <div class="dashboard-action-bar">
        <button class="action-btn primary" onclick={onAddConnection}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Add Connection
        </button>
        <button
          class="action-btn"
          onclick={handleBackupDatabase}
          disabled={!hasConnectedSqlDbs}
          title={hasConnectedSqlDbs ? 'Backup a connected database to a .sql file' : 'Connect to a SQL database first'}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 10V2M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          Backup Database
        </button>
      </div>

      <div class="cards-area">
        {#if ungrouped.length > 0}
          <div class="cards-grid">
            {#each ungrouped as conn}
              {@const meta = DB_METADATA[conn.config.db_type]}
              <button
                class="conn-card"
                style={conn.config.color ? `--card-accent: ${conn.config.color}` : ''}
                onclick={() => handleCardClick(conn)}
                ondblclick={() => handleCardDblClick(conn)}
              >
                {#if conn.config.color}
                  <span class="card-stripe" style="background: {conn.config.color}"></span>
                {/if}
                <div class="card-top">
                  <span class="badge {meta.badgeClass}">{meta.badge}</span>
                  <span class="status-dot {conn.status}"></span>
                </div>
                <div class="card-name">{conn.config.name}</div>
                <div class="card-host">
                  {#if meta.requiresHost}
                    {conn.config.host || 'localhost'}{conn.config.port ? `:${conn.config.port}` : ''}
                  {:else if meta.requiresFilePath}
                    {conn.config.database || 'local'}
                  {:else}
                    {conn.config.database || meta.label}
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        {/if}

        {#each groups as group}
          {@const groupConns = connectionStore.getConnectionsByGroup(group)}
          <div class="group-label">{group}</div>
          <div class="cards-grid">
            {#each groupConns as conn}
              {@const meta = DB_METADATA[conn.config.db_type]}
              <button
                class="conn-card"
                style={conn.config.color ? `--card-accent: ${conn.config.color}` : ''}
                onclick={() => handleCardClick(conn)}
                ondblclick={() => handleCardDblClick(conn)}
              >
                {#if conn.config.color}
                  <span class="card-stripe" style="background: {conn.config.color}"></span>
                {/if}
                <div class="card-top">
                  <span class="badge {meta.badgeClass}">{meta.badge}</span>
                  <span class="status-dot {conn.status}"></span>
                </div>
                <div class="card-name">{conn.config.name}</div>
                <div class="card-host">
                  {#if meta.requiresHost}
                    {conn.config.host || 'localhost'}{conn.config.port ? `:${conn.config.port}` : ''}
                  {:else if meta.requiresFilePath}
                    {conn.config.database || 'local'}
                  {:else}
                    {conn.config.database || meta.label}
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="shortcuts-hint">
    <span class="kbd">Ctrl+N</span> New query
    <span class="sep"></span>
    <span class="kbd">Ctrl+P</span> Command palette
    <span class="sep"></span>
    <span class="kbd">Ctrl+B</span> Toggle sidebar
  </div>
</div>

<style>
  .welcome-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 8px;
    user-select: none;
    position: relative;
    background:
      radial-gradient(ellipse 80% 60% at 50% 40%, rgba(122, 162, 247, 0.06) 0%, transparent 70%),
      var(--bg-primary);
  }

  /* ── Hero state (no connections) ── */

  .welcome-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
    max-width: 640px;
    width: 100%;
    padding: 0 24px;
  }

  .hero-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
  }

  .brand-glyph {
    filter: drop-shadow(0 0 10px rgba(122, 162, 247, 0.3));
    flex-shrink: 0;
  }

  .brand-name {
    font-size: 36px;
    font-weight: 800;
    color: var(--accent);
    margin: 0;
    letter-spacing: -1px;
  }

  .tagline {
    font-size: 15px;
    color: var(--text-secondary);
    margin: 0 0 8px;
  }

  .cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 28px;
    margin-top: 4px;
    font-size: 14px;
    font-weight: 600;
    font-family: var(--font-sans);
    color: #fff;
    background: var(--accent);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: box-shadow 150ms ease, transform 150ms ease;
    box-shadow: 0 2px 8px rgba(122, 162, 247, 0.25);
  }

  .cta-btn:hover {
    box-shadow: 0 4px 20px rgba(122, 162, 247, 0.45);
    transform: translateY(-2px);
  }

  /* DB showcase grid */
  .db-showcase {
    display: grid;
    grid-template-columns: repeat(4, auto);
    justify-content: center;
    gap: 20px 40px;
    margin-top: 28px;
    width: 100%;
  }

  .db-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .db-group-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--text-muted);
    text-align: left;
  }

  .db-group-items {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .db-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .db-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .db-name {
    font-size: 13px;
    color: var(--text-primary);
    white-space: nowrap;
    text-align: left;
  }

  /* Feature highlights */
  .features {
    display: flex;
    gap: 32px;
    margin-top: 32px;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .feature-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: rgba(122, 162, 247, 0.1);
    flex-shrink: 0;
  }

  /* ── Dashboard state (has connections) ── */

  .dashboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 840px;
    gap: 20px;
    padding-top: 24px;
  }

  .dashboard-header {
    width: 100%;
    padding: 0 32px;
  }

  .dashboard-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .dashboard-title {
    font-size: 22px;
    font-weight: 800;
    color: var(--accent);
    letter-spacing: -0.5px;
  }

  .dashboard-divider {
    width: 1px;
    height: 18px;
    background: var(--border-color);
  }

  .dashboard-count {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .dashboard-action-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 0 32px;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 16px;
    font-size: 12px;
    font-weight: 500;
    font-family: var(--font-sans);
    color: var(--text-primary);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .action-btn:hover:not(:disabled) {
    background: var(--bg-hover);
    border-color: var(--accent);
  }

  .action-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .action-btn.primary {
    color: #fff;
    background: var(--accent);
    border-color: var(--accent);
  }

  .action-btn.primary:hover {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
  }

  /* Cards area */
  .cards-area {
    width: 100%;
    padding: 0 32px;
  }

  .group-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--text-secondary);
    padding: 16px 0 8px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 12px;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
    margin-bottom: 12px;
  }

  .conn-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 18px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    cursor: pointer;
    text-align: left;
    transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
    position: relative;
    overflow: hidden;
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 13px;
  }

  .conn-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--card-accent, var(--accent));
    border-color: var(--card-accent, var(--accent));
  }

  .card-stripe {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-muted);
    opacity: 0.4;
    flex-shrink: 0;
  }

  .status-dot.connected {
    background: var(--success);
    opacity: 1;
    box-shadow: 0 0 6px rgba(166, 227, 161, 0.5);
  }

  .status-dot.connecting {
    background: var(--warning);
    opacity: 1;
  }

  .status-dot.error {
    background: var(--error);
    opacity: 1;
  }

  .card-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-host {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Shared ── */

  .shortcuts-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    position: absolute;
    bottom: 16px;
    font-size: 11px;
    color: var(--text-secondary);
    opacity: 0.7;
  }

  .sep {
    width: 1px;
    height: 12px;
    background: var(--border-color);
  }
</style>
