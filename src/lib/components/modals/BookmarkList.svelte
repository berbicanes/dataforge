<script lang="ts">
  import { uiStore } from '$lib/stores/ui.svelte';
  import { bookmarksStore } from '$lib/stores/bookmarks.svelte';
  import { connectionStore } from '$lib/stores/connections.svelte';
  import { tabStore } from '$lib/stores/tabs.svelte';
  import type { ResultBookmark } from '$lib/types/query';

  let searchQuery = $state('');

  let grouped = $derived.by(() => {
    const groups: Record<string, { connName: string; bookmarks: ResultBookmark[] }> = {};
    for (const b of bookmarksStore.bookmarks) {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!b.name.toLowerCase().includes(q) && !b.sql.toLowerCase().includes(q)) continue;
      }
      if (!groups[b.connectionId]) {
        const conn = connectionStore.connections.find(c => c.config.id === b.connectionId);
        groups[b.connectionId] = {
          connName: conn?.config.name ?? 'Unknown',
          bookmarks: [],
        };
      }
      groups[b.connectionId].bookmarks.push(b);
    }
    return groups;
  });

  function close() {
    uiStore.showBookmarkList = false;
  }

  function openBookmark(bookmark: ResultBookmark) {
    tabStore.openTab({
      type: 'bookmark',
      title: bookmark.name,
      connectionId: bookmark.connectionId,
      bookmarkId: bookmark.id,
    });
    close();
  }

  function deleteBookmark(bookmark: ResultBookmark) {
    bookmarksStore.remove(bookmark.id);
  }

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleString();
  }

  function formatRows(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="modal-overlay" onclick={handleOverlayClick} onkeydown={handleKeydown}>
  <div class="modal-card">
    <div class="modal-header">
      <h3>Result Bookmarks</h3>
      <button class="close-btn" onclick={close}>&times;</button>
    </div>

    <div class="search-bar">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search bookmarks..."
        class="search-input"
      />
    </div>

    <div class="modal-body">
      {#each Object.entries(grouped) as [connId, group]}
        <div class="group-header">{group.connName}</div>
        {#each group.bookmarks as bookmark}
          <div class="bookmark-item">
            <button class="bookmark-main" onclick={() => openBookmark(bookmark)}>
              <div class="bookmark-top">
                <span class="bookmark-name">{bookmark.name}</span>
                <span class="bookmark-meta">{formatRows(bookmark.rowCount)} rows &middot; {bookmark.executionTimeMs}ms</span>
              </div>
              <div class="bookmark-sql">{bookmark.sql.substring(0, 100).replace(/\n/g, ' ')}</div>
              <div class="bookmark-date">{formatDate(bookmark.createdAt)}</div>
            </button>
            <button class="delete-btn" onclick={() => deleteBookmark(bookmark)} title="Delete bookmark">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        {/each}
      {:else}
        <div class="empty-state">
          {searchQuery ? 'No bookmarks match your search' : 'No bookmarks saved yet'}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
  }

  .modal-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 520px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border-color);
  }

  .modal-header h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 18px;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0 4px;
  }

  .close-btn:hover {
    color: var(--text-primary);
  }

  .search-bar {
    padding: 8px 18px;
    border-bottom: 1px solid var(--border-color);
  }

  .search-input {
    width: 100%;
    padding: 5px 8px;
    font-size: 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-primary);
    color: var(--text-primary);
    outline: none;
  }

  .search-input:focus {
    border-color: var(--accent);
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }

  .group-header {
    padding: 8px 18px 4px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
  }

  .bookmark-item {
    display: flex;
    align-items: center;
    padding: 0 12px 0 0;
  }

  .bookmark-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 18px;
    text-align: left;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--text-primary);
    min-width: 0;
  }

  .bookmark-main:hover {
    background: var(--bg-hover);
  }

  .bookmark-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .bookmark-name {
    font-size: 12px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bookmark-meta {
    font-size: 10px;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .bookmark-sql {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bookmark-date {
    font-size: 10px;
    color: var(--text-muted);
    opacity: 0.7;
  }

  .delete-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
  }

  .delete-btn:hover {
    color: var(--error);
    background: rgba(243, 139, 168, 0.1);
  }

  .empty-state {
    padding: 30px 20px;
    text-align: center;
    font-size: 13px;
    color: var(--text-muted);
  }
</style>
