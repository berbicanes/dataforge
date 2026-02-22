<script lang="ts">
  import { tabStore } from '$lib/stores/tabs.svelte';
  import { connectionStore } from '$lib/stores/connections.svelte';
  import { uiStore } from '$lib/stores/ui.svelte';

  let scrollContainer: HTMLDivElement;

  function handleTabClick(id: string) {
    tabStore.setActive(id);
  }

  function handleTabClose(e: MouseEvent, id: string) {
    e.stopPropagation();
    tabStore.closeTab(id);
  }

  function handleNewTab() {
    if (connectionStore.activeConnectionId) {
      tabStore.newQueryTab(connectionStore.activeConnectionId);
    } else {
      uiStore.showError('No active connection. Connect to a database first.');
    }
  }

  function handleMiddleClick(e: MouseEvent, id: string) {
    if (e.button === 1) {
      e.preventDefault();
      tabStore.closeTab(id);
    }
  }

  function getTabIcon(type: string): string {
    return type === 'query' ? '\u{2318}' : '\u{1F5C3}';
  }
</script>

<div class="tab-bar">
  <div class="tabs-scroll" bind:this={scrollContainer}>
    {#each tabStore.tabs as tab}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="tab"
        class:active={tab.id === tabStore.activeTabId}
        onclick={() => handleTabClick(tab.id)}
        onauxclick={(e) => handleMiddleClick(e, tab.id)}
        onkeydown={(e) => { if (e.key === 'Enter') handleTabClick(tab.id); }}
        role="tab"
        tabindex="0"
        title={tab.title}
      >
        <span class="tab-icon">{getTabIcon(tab.type)}</span>
        <span class="tab-title truncate">{tab.title}</span>
        <button
          class="tab-close"
          onclick={(e) => handleTabClose(e, tab.id)}
          title="Close tab"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    {/each}
  </div>

  <button class="new-tab-btn" onclick={handleNewTab} title="New query tab">
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </button>
</div>

<style>
  .tab-bar {
    display: flex;
    align-items: stretch;
    height: 34px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .tabs-scroll {
    display: flex;
    align-items: stretch;
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
  }

  .tabs-scroll::-webkit-scrollbar {
    display: none;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    border: none;
    background: none;
    border-right: 1px solid var(--border-color);
    cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast);
    min-width: 100px;
    max-width: 200px;
    position: relative;
    flex-shrink: 0;
  }

  .tab:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .tab.active {
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .tab.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--accent);
  }

  .tab-icon {
    flex-shrink: 0;
    font-size: 11px;
    opacity: 0.6;
  }

  .tab-title {
    flex: 1;
    min-width: 0;
    text-align: left;
  }

  .tab-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    flex-shrink: 0;
    opacity: 0;
    transition: opacity var(--transition-fast), background var(--transition-fast), color var(--transition-fast);
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
  }

  .tab:hover .tab-close,
  .tab.active .tab-close {
    opacity: 1;
  }

  .tab-close:hover {
    background: var(--bg-active);
    color: var(--text-primary);
  }

  .new-tab-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    flex-shrink: 0;
    color: var(--text-muted);
    border: none;
    background: none;
    cursor: pointer;
    transition: color var(--transition-fast), background var(--transition-fast);
    padding: 0;
    border-left: 1px solid var(--border-color);
  }

  .new-tab-btn:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }
</style>
