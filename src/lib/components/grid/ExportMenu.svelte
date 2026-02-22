<script lang="ts">
  import type { ColumnDef, CellValue } from '$lib/types/query';
  import { exportData, exportDdl, importCsvFile, type ExportFormat } from '$lib/services/exportService';

  let {
    columns,
    rows,
    connectionId,
    schema,
    table,
    showDdl = false,
    showImport = false,
    showExportAll = false,
    onImportComplete,
  }: {
    columns: ColumnDef[];
    rows: CellValue[][];
    connectionId?: string;
    schema?: string;
    table?: string;
    showDdl?: boolean;
    showImport?: boolean;
    showExportAll?: boolean;
    onImportComplete?: () => void;
  } = $props();

  let isOpen = $state(false);
  let menuEl: HTMLDivElement | undefined = $state(undefined);

  function toggleMenu() {
    isOpen = !isOpen;
  }

  function handleClickOutside(e: MouseEvent) {
    if (isOpen && menuEl && !menuEl.contains(e.target as Node)) {
      isOpen = false;
    }
  }

  async function handleExport(format: ExportFormat, all = false) {
    isOpen = false;
    await exportData(format, {
      connectionId, schema, table,
      columns, rows,
      exportAll: all,
    });
  }

  async function handleDdl() {
    isOpen = false;
    if (connectionId && schema && table) {
      await exportDdl(connectionId, schema, table);
    }
  }

  async function handleImport() {
    isOpen = false;
    if (connectionId && schema && table) {
      const success = await importCsvFile(connectionId, schema, table);
      if (success) {
        onImportComplete?.();
      }
    }
  }
</script>

<svelte:window onmousedown={handleClickOutside} />

<div class="export-menu" bind:this={menuEl}>
  <button class="export-btn" onclick={toggleMenu} title="Export / Import">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    <span>Export</span>
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>

  {#if isOpen}
    <div class="dropdown" role="menu">
      <div class="menu-group-label">Export current view</div>
      <button class="menu-item" onclick={() => handleExport('csv')} role="menuitem">
        <span>CSV</span>
        <span class="hint">.csv</span>
      </button>
      <button class="menu-item" onclick={() => handleExport('json')} role="menuitem">
        <span>JSON</span>
        <span class="hint">.json</span>
      </button>
      <button class="menu-item" onclick={() => handleExport('sql')} role="menuitem">
        <span>SQL (INSERT)</span>
        <span class="hint">.sql</span>
      </button>

      {#if showExportAll}
        <div class="menu-separator"></div>
        <div class="menu-group-label">Export all rows</div>
        <button class="menu-item" onclick={() => handleExport('csv', true)} role="menuitem">
          <span>All rows as CSV</span>
        </button>
        <button class="menu-item" onclick={() => handleExport('json', true)} role="menuitem">
          <span>All rows as JSON</span>
        </button>
        <button class="menu-item" onclick={() => handleExport('sql', true)} role="menuitem">
          <span>All rows as SQL</span>
        </button>
      {/if}

      {#if showDdl && connectionId && schema && table}
        <div class="menu-separator"></div>
        <button class="menu-item" onclick={handleDdl} role="menuitem">
          <span>Export DDL</span>
          <span class="hint">CREATE TABLE</span>
        </button>
      {/if}

      {#if showImport && connectionId && schema && table}
        <div class="menu-separator"></div>
        <button class="menu-item import-item" onclick={handleImport} role="menuitem">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>Import CSV</span>
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .export-menu {
    position: relative;
  }

  .export-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border: none;
    background: none;
    color: var(--text-muted);
    font-size: 11px;
    font-family: var(--font-sans);
    cursor: pointer;
    border-radius: var(--radius-sm);
    white-space: nowrap;
  }

  .export-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 1000;
    min-width: 180px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md, 6px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    padding: 4px 0;
    margin-top: 2px;
  }

  .menu-group-label {
    padding: 4px 12px 2px;
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 6px 12px;
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    text-align: left;
    font-size: 12px;
  }

  .menu-item:hover {
    background: var(--bg-hover);
  }

  .menu-item.import-item {
    gap: 6px;
    justify-content: flex-start;
  }

  .hint {
    font-size: 10px;
    color: var(--text-muted);
    font-family: var(--font-mono);
  }

  .menu-separator {
    height: 1px;
    background: var(--border-color);
    margin: 4px 0;
  }
</style>
