<script lang="ts">
  import { connectionStore } from '$lib/stores/connections.svelte';
  import { DB_METADATA } from '$lib/types/database';
  import type { DatabaseType } from '$lib/types/connection';

  let { onAddConnection }: { onAddConnection: () => void } = $props();

  const supportedDbs: DatabaseType[] = [
    'PostgreSQL', 'MySQL', 'MariaDB', 'SQLite', 'MSSQL', 'CockroachDB',
    'Redshift', 'ClickHouse', 'MongoDB', 'Redis', 'Cassandra', 'ScyllaDB',
    'Neo4j', 'DynamoDB',
  ];

  let hasConnections = $derived(connectionStore.connections.length > 0);
</script>

<div class="welcome-screen">
  {#if !hasConnections}
    <div class="welcome-hero">
      <div class="logo-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="8" width="40" height="8" rx="4" stroke="var(--accent)" stroke-width="2.5"/>
          <rect x="4" y="20" width="40" height="8" rx="4" stroke="var(--accent)" stroke-width="2.5"/>
          <rect x="4" y="32" width="40" height="8" rx="4" stroke="var(--accent)" stroke-width="2.5"/>
          <circle cx="10" cy="12" r="1.5" fill="var(--accent)"/>
          <circle cx="10" cy="24" r="1.5" fill="var(--accent)"/>
          <circle cx="10" cy="36" r="1.5" fill="var(--accent)"/>
        </svg>
      </div>
      <h1 class="welcome-title">Welcome to DataForge</h1>
      <p class="welcome-subtitle">A fast, lightweight database IDE for developers</p>

      <button class="cta-btn" onclick={onAddConnection}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Add Your First Connection
      </button>

      <div class="db-badges">
        {#each supportedDbs as db}
          {@const meta = DB_METADATA[db]}
          <span class="badge {meta.badgeClass}" title={meta.label}>{meta.badge}</span>
        {/each}
      </div>
    </div>
  {:else}
    <div class="empty-hero">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
      </div>
      <p class="empty-message">No tabs open</p>
      <p class="empty-hint">Select a table from the sidebar or open a new query tab</p>
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
  }

  .welcome-hero,
  .empty-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .logo-icon {
    opacity: 0.8;
    margin-bottom: 4px;
  }

  .welcome-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .welcome-subtitle {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0;
  }

  .cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    margin-top: 8px;
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-sans);
    color: var(--bg-primary);
    background: var(--accent);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: opacity var(--transition-fast);
  }

  .cta-btn:hover {
    opacity: 0.9;
  }

  .db-badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    max-width: 400px;
    margin-top: 16px;
    opacity: 0.7;
  }

  .empty-icon {
    opacity: 0.3;
    margin-bottom: 4px;
  }

  .empty-message {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0;
  }

  .empty-hint {
    font-size: 12px;
    color: var(--text-muted);
    opacity: 0.7;
    margin: 0;
  }

  .shortcuts-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 24px;
    font-size: 11px;
    color: var(--text-muted);
    opacity: 0.6;
  }

  .sep {
    width: 1px;
    height: 12px;
    background: var(--border-color);
  }
</style>
