<script lang="ts">
  import { bookmarksStore } from '$lib/stores/bookmarks.svelte';
  import { tabStore } from '$lib/stores/tabs.svelte';
  import { uiStore } from '$lib/stores/ui.svelte';
  import type { Tab } from '$lib/types/tabs';
  import DataGrid from '$lib/components/grid/DataGrid.svelte';
  import Pagination from '$lib/components/grid/Pagination.svelte';

  let { tab }: { tab: Tab } = $props();

  let bookmark = $derived(tab.bookmarkId ? bookmarksStore.getById(tab.bookmarkId) : undefined);

  // Client-side pagination
  let currentPage = $state(1);
  let pageSize = $state(100);

  let totalRows = $derived(bookmark?.rows.length ?? 0);
  let totalPages = $derived(Math.max(1, Math.ceil(totalRows / pageSize)));
  let pagedRows = $derived.by(() => {
    if (!bookmark) return [];
    const start = (currentPage - 1) * pageSize;
    return bookmark.rows.slice(start, start + pageSize);
  });

  function handleRerunQuery() {
    if (!bookmark) return;
    const tabId = tabStore.newQueryTab(bookmark.connectionId);
    tabStore.updateTabSql(tabId, bookmark.sql);
  }

  function handleDelete() {
    if (!bookmark) return;
    uiStore.confirm(`Delete bookmark "${bookmark.name}"?`, () => {
      bookmarksStore.remove(bookmark!.id);
      tabStore.closeTab(tab.id);
    });
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleString();
  }
</script>

<div class="bookmark-viewer">
  {#if bookmark}
    <div class="bookmark-header">
      <div class="header-info">
        <h3>{bookmark.name}</h3>
        <div class="header-meta">
          <span>Saved {formatDate(bookmark.createdAt)}</span>
          <span class="separator">&middot;</span>
          <span>{bookmark.rowCount} rows</span>
          <span class="separator">&middot;</span>
          <span>{bookmark.executionTimeMs}ms</span>
        </div>
      </div>
      <div class="header-actions">
        <button class="toolbar-btn" onclick={handleRerunQuery} title="Re-run this query">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M4 2l10 6-10 6V2z" fill="currentColor"/>
          </svg>
          <span>Re-run</span>
        </button>
        <button class="toolbar-btn danger" onclick={handleDelete} title="Delete bookmark">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" stroke-width="1.2" fill="none"/>
          </svg>
          <span>Delete</span>
        </button>
      </div>
    </div>

    <div class="bookmark-sql">
      <pre>{bookmark.sql}</pre>
    </div>

    <div class="bookmark-grid">
      <DataGrid
        columns={bookmark.columns}
        rows={pagedRows}
        connectionId={bookmark.connectionId}
      />
    </div>

    {#if totalPages > 1}
      <div class="pagination-bar">
        <Pagination
          {currentPage}
          {pageSize}
          totalRows={totalRows}
          onPageChange={(p: number) => currentPage = p}
          onPageSizeChange={(s: number) => { pageSize = s; currentPage = 1; }}
        />
      </div>
    {/if}
  {:else}
    <div class="empty-state">
      <span class="text-muted">Bookmark not found</span>
    </div>
  {/if}
</div>

<style>
  .bookmark-viewer {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .bookmark-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .header-info h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .header-meta {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .separator {
    margin: 0 4px;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    font-size: 11px;
    background: var(--bg-hover);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    cursor: pointer;
  }

  .toolbar-btn:hover {
    background: var(--border-color);
    color: var(--text-primary);
  }

  .toolbar-btn.danger {
    color: var(--error);
  }

  .toolbar-btn.danger:hover {
    background: rgba(243, 139, 168, 0.1);
  }

  .bookmark-sql {
    padding: 8px 16px;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
    max-height: 80px;
    overflow: auto;
  }

  .bookmark-sql pre {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-secondary);
    white-space: pre-wrap;
    word-break: break-all;
  }

  .bookmark-grid {
    flex: 1;
    overflow: hidden;
  }

  .pagination-bar {
    border-top: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 13px;
    color: var(--text-muted);
  }
</style>
