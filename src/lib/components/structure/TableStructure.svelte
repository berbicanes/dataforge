<script lang="ts">
  import { onMount } from 'svelte';
  import * as schemaService from '$lib/services/schemaService';
  import type { ColumnInfo, IndexInfo, ForeignKeyInfo } from '$lib/types/schema';
  import ColumnsView from './ColumnsView.svelte';
  import IndexesView from './IndexesView.svelte';
  import ForeignKeysView from './ForeignKeysView.svelte';

  let { connectionId, schema, table }: {
    connectionId: string;
    schema: string;
    table: string;
  } = $props();

  let activeView = $state<'columns' | 'indexes' | 'foreignKeys'>('columns');
  let columns = $state<ColumnInfo[]>([]);
  let indexes = $state<IndexInfo[]>([]);
  let foreignKeys = $state<ForeignKeyInfo[]>([]);
  let isLoading = $state(false);

  async function loadColumns() {
    isLoading = true;
    try {
      columns = await schemaService.loadColumns(connectionId, schema, table);
    } finally {
      isLoading = false;
    }
  }

  async function loadIndexes() {
    isLoading = true;
    try {
      indexes = await schemaService.loadIndexes(connectionId, schema, table);
    } finally {
      isLoading = false;
    }
  }

  async function loadForeignKeys() {
    isLoading = true;
    try {
      foreignKeys = await schemaService.loadForeignKeys(connectionId, schema, table);
    } finally {
      isLoading = false;
    }
  }

  function switchView(view: 'columns' | 'indexes' | 'foreignKeys') {
    activeView = view;
    if (view === 'columns' && columns.length === 0) loadColumns();
    else if (view === 'indexes' && indexes.length === 0) loadIndexes();
    else if (view === 'foreignKeys' && foreignKeys.length === 0) loadForeignKeys();
  }

  onMount(() => {
    loadColumns();
  });
</script>

<div class="table-structure">
  <div class="structure-tabs">
    <button
      class="structure-tab"
      class:active={activeView === 'columns'}
      onclick={() => switchView('columns')}
    >
      Columns
      {#if columns.length > 0}
        <span class="count-badge">{columns.length}</span>
      {/if}
    </button>
    <button
      class="structure-tab"
      class:active={activeView === 'indexes'}
      onclick={() => switchView('indexes')}
    >
      Indexes
      {#if indexes.length > 0}
        <span class="count-badge">{indexes.length}</span>
      {/if}
    </button>
    <button
      class="structure-tab"
      class:active={activeView === 'foreignKeys'}
      onclick={() => switchView('foreignKeys')}
    >
      Foreign Keys
      {#if foreignKeys.length > 0}
        <span class="count-badge">{foreignKeys.length}</span>
      {/if}
    </button>
  </div>

  <div class="structure-content">
    {#if isLoading}
      <div class="loading-state">
        <span class="spinner"></span>
        <span>Loading...</span>
      </div>
    {:else if activeView === 'columns'}
      <ColumnsView {columns} />
    {:else if activeView === 'indexes'}
      <IndexesView {indexes} />
    {:else}
      <ForeignKeysView {foreignKeys} />
    {/if}
  </div>
</div>

<style>
  .table-structure {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .structure-tabs {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 0 8px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .structure-tab {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--text-secondary);
    border: none;
    background: none;
    cursor: pointer;
    position: relative;
    transition: color var(--transition-fast);
  }

  .structure-tab:hover {
    color: var(--text-primary);
  }

  .structure-tab.active {
    color: var(--accent);
  }

  .structure-tab.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 4px;
    right: 4px;
    height: 2px;
    background: var(--accent);
    border-radius: 1px;
  }

  .count-badge {
    font-size: 10px;
    padding: 0 5px;
    border-radius: 8px;
    background: var(--bg-tertiary);
    color: var(--text-muted);
    line-height: 1.5;
  }

  .structure-content {
    flex: 1;
    overflow: auto;
  }

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 13px;
  }

  .spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid var(--border-color);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
