<script lang="ts">
  import { uiStore } from '$lib/stores/ui.svelte';
  import { snippetsStore } from '$lib/stores/snippets.svelte';
  import { connectionStore } from '$lib/stores/connections.svelte';
  import { tabStore } from '$lib/stores/tabs.svelte';
  import { parseVariables, substituteVariables } from '$lib/utils/snippetVariables';
  import type { QuerySnippet } from '$lib/types/query';

  let searchQuery = $state('');
  let selectedTag = $state<string | null>(null);
  let selectedSnippet = $state<QuerySnippet | null>(null);

  let allTags = $derived.by(() => {
    const tags = new Set<string>();
    for (const s of snippetsStore.snippets) {
      for (const t of s.tags) tags.add(t);
    }
    return Array.from(tags).sort();
  });

  let filteredSnippets = $derived.by(() => {
    let list = snippetsStore.snippets;
    if (selectedTag) {
      list = list.filter(s => s.tags.includes(selectedTag!));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.sql.toLowerCase().includes(q)
      );
    }
    return list;
  });

  function close() {
    uiStore.showSnippetLibrary = false;
    selectedSnippet = null;
  }

  function handleInsert(snippet: QuerySnippet) {
    const vars = parseVariables(snippet.sql);
    if (vars.length > 0 && snippet.variables.length > 0) {
      uiStore.snippetToInsert = snippet;
      uiStore.showSnippetVariablePrompt = true;
    } else {
      // Insert directly into a new or current query tab
      const connId = snippet.connectionId || connectionStore.activeConnectionId;
      if (connId) {
        const activeTab = tabStore.activeTab;
        if (activeTab?.type === 'query') {
          tabStore.updateTabSql(activeTab.id, (activeTab.sql ?? '') + '\n' + snippet.sql);
        } else {
          const tabId = tabStore.newQueryTab(connId);
          tabStore.updateTabSql(tabId, snippet.sql);
        }
      }
    }
    close();
  }

  function handleEdit(snippet: QuerySnippet) {
    uiStore.snippetToEdit = snippet;
    uiStore.showSnippetModal = true;
    close();
  }

  function handleDelete(snippet: QuerySnippet) {
    snippetsStore.remove(snippet.id);
    if (selectedSnippet?.id === snippet.id) {
      selectedSnippet = null;
    }
  }

  function handleNew() {
    uiStore.snippetToEdit = null;
    uiStore.showSnippetModal = true;
    close();
  }

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="modal-overlay" onclick={handleOverlayClick} onkeydown={handleKeydown}>
  <div class="library-card">
    <div class="library-header">
      <h3>Query Snippets</h3>
      <div class="header-actions">
        <button class="btn btn-primary" onclick={handleNew}>New Snippet</button>
        <button class="close-btn" onclick={close}>&times;</button>
      </div>
    </div>

    <div class="library-body">
      <div class="list-panel">
        <div class="search-bar">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search snippets..."
            class="search-input"
          />
        </div>

        {#if allTags.length > 0}
          <div class="tags-bar">
            <button
              class="tag-btn"
              class:active={selectedTag === null}
              onclick={() => selectedTag = null}
            >All</button>
            {#each allTags as tag}
              <button
                class="tag-btn"
                class:active={selectedTag === tag}
                onclick={() => selectedTag = selectedTag === tag ? null : tag}
              >{tag}</button>
            {/each}
          </div>
        {/if}

        <div class="snippet-list">
          {#each filteredSnippets as snippet}
            <button
              class="snippet-item"
              class:selected={selectedSnippet?.id === snippet.id}
              onclick={() => selectedSnippet = snippet}
            >
              <span class="snippet-name">{snippet.name}</span>
              {#if snippet.description}
                <span class="snippet-desc">{snippet.description}</span>
              {/if}
              <span class="snippet-meta">{formatDate(snippet.updatedAt)}</span>
            </button>
          {:else}
            <div class="empty-list">No snippets found</div>
          {/each}
        </div>
      </div>

      <div class="preview-panel">
        {#if selectedSnippet}
          <div class="preview-header">
            <h4>{selectedSnippet.name}</h4>
            <div class="preview-actions">
              <button class="btn btn-primary btn-sm" onclick={() => handleInsert(selectedSnippet!)}>Insert</button>
              <button class="btn btn-secondary btn-sm" onclick={() => handleEdit(selectedSnippet!)}>Edit</button>
              <button class="btn btn-danger btn-sm" onclick={() => handleDelete(selectedSnippet!)}>Delete</button>
            </div>
          </div>
          {#if selectedSnippet.description}
            <p class="preview-desc">{selectedSnippet.description}</p>
          {/if}
          {#if selectedSnippet.tags.length > 0}
            <div class="preview-tags">
              {#each selectedSnippet.tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          {/if}
          <pre class="preview-sql">{selectedSnippet.sql}</pre>
          {#if selectedSnippet.variables.length > 0}
            <div class="preview-vars">
              <span class="vars-label">Variables:</span>
              {#each selectedSnippet.variables as v}
                <span class="var-chip">{`{{${v.name}}}`}{v.defaultValue ? ` = ${v.defaultValue}` : ''}</span>
              {/each}
            </div>
          {/if}
        {:else}
          <div class="preview-empty">Select a snippet to preview</div>
        {/if}
      </div>
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

  .library-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 780px;
    height: 520px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .library-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border-color);
  }

  .library-header h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
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

  .library-body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .list-panel {
    width: 280px;
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .search-bar {
    padding: 8px;
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

  .tags-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--border-color);
  }

  .tag-btn {
    padding: 2px 8px;
    font-size: 10px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-secondary);
    cursor: pointer;
  }

  .tag-btn.active {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  .snippet-list {
    flex: 1;
    overflow-y: auto;
  }

  .snippet-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 8px 10px;
    text-align: left;
    border: none;
    background: none;
    cursor: pointer;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-primary);
  }

  .snippet-item:hover {
    background: var(--bg-hover);
  }

  .snippet-item.selected {
    background: rgba(122, 162, 247, 0.1);
  }

  .snippet-name {
    font-size: 12px;
    font-weight: 500;
  }

  .snippet-desc {
    font-size: 11px;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .snippet-meta {
    font-size: 10px;
    color: var(--text-muted);
  }

  .empty-list {
    padding: 20px;
    text-align: center;
    font-size: 12px;
    color: var(--text-muted);
  }

  .preview-panel {
    flex: 1;
    padding: 14px 18px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .preview-header h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .preview-actions {
    display: flex;
    gap: 6px;
  }

  .preview-desc {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
  }

  .preview-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .tag {
    padding: 2px 8px;
    font-size: 10px;
    border-radius: 10px;
    background: var(--bg-hover);
    color: var(--text-secondary);
  }

  .preview-sql {
    font-family: var(--font-mono);
    font-size: 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 10px;
    margin: 0;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    color: var(--text-primary);
  }

  .preview-vars {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    font-size: 11px;
  }

  .vars-label {
    color: var(--text-muted);
    font-weight: 500;
  }

  .var-chip {
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 2px 6px;
    background: rgba(122, 162, 247, 0.1);
    color: var(--accent);
    border-radius: var(--radius-sm);
  }

  .preview-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: 13px;
  }

  .btn {
    padding: 6px 14px;
    font-size: 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    border: none;
    font-weight: 500;
  }

  .btn-sm {
    padding: 4px 10px;
    font-size: 11px;
  }

  .btn-secondary {
    background: var(--bg-hover);
    color: var(--text-secondary);
  }

  .btn-secondary:hover {
    background: var(--border-color);
  }

  .btn-primary {
    background: var(--accent);
    color: #fff;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }

  .btn-danger {
    background: transparent;
    color: var(--error);
  }

  .btn-danger:hover {
    background: rgba(243, 139, 168, 0.1);
  }
</style>
