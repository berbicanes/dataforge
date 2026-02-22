<script lang="ts">
  import { connectionStore } from '$lib/stores/connections.svelte';
  import { uiStore } from '$lib/stores/ui.svelte';
  import ConnectionList from './ConnectionList.svelte';
  import SchemaTree from './SchemaTree.svelte';

  let isResizing = $state(false);
  let startX = $state(0);
  let startWidth = $state(0);

  let activeConnection = $derived(connectionStore.activeConnection);
  let isConnected = $derived(activeConnection?.status === 'connected');

  function handleAddConnection() {
    uiStore.openConnectionModal();
  }

  function onMouseDown(e: MouseEvent) {
    isResizing = true;
    startX = e.clientX;
    startWidth = uiStore.sidebarWidth;
    e.preventDefault();
  }

  function onMouseMove(e: MouseEvent) {
    if (!isResizing) return;
    const delta = e.clientX - startX;
    const newWidth = Math.max(180, Math.min(500, startWidth + delta));
    uiStore.sidebarWidth = newWidth;
  }

  function onMouseUp() {
    isResizing = false;
  }
</script>

<svelte:window
  onmousemove={onMouseMove}
  onmouseup={onMouseUp}
/>

<div class="sidebar" class:resizing={isResizing}>
  <div class="sidebar-header">
    <span class="sidebar-title">Connections</span>
    <button class="btn btn-sm add-btn" onclick={handleAddConnection} title="Add connection">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>

  <div class="sidebar-content">
    <ConnectionList />

    {#if isConnected && connectionStore.activeConnectionId}
      <div class="schema-section">
        <div class="section-header">
          <span class="section-title">Schema</span>
        </div>
        <SchemaTree connectionId={connectionStore.activeConnectionId} />
      </div>
    {/if}
  </div>

  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="resize-handle"
    onmousedown={onMouseDown}
    role="separator"
    aria-orientation="vertical"
    tabindex="-1"
  ></div>
</div>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-secondary);
    position: relative;
    user-select: none;
  }

  .sidebar.resizing {
    user-select: none;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .sidebar-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
  }

  .add-btn {
    color: var(--text-secondary);
    padding: 2px;
    border-radius: var(--radius-sm);
  }

  .add-btn:hover {
    color: var(--accent);
    background: var(--bg-hover);
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .schema-section {
    border-top: 1px solid var(--border-color);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
  }

  .section-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
  }

  .resize-handle {
    position: absolute;
    top: 0;
    right: -3px;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    z-index: 10;
  }

  .resize-handle:hover,
  .sidebar.resizing .resize-handle {
    background: var(--accent);
    opacity: 0.3;
  }
</style>
