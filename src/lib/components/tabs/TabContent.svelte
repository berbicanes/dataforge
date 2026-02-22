<script lang="ts">
  import { tabStore } from '$lib/stores/tabs.svelte';
  import QueryTab from './QueryTab.svelte';
  import TableTab from './TableTab.svelte';
  import DocumentTab from './DocumentTab.svelte';
  import KeyValueTab from './KeyValueTab.svelte';
  import GraphTab from './GraphTab.svelte';

  let { onqueryresult, paneId }: {
    onqueryresult?: (detail: { executionTime: number; rowCount: number }) => void;
    paneId?: 'left' | 'right';
  } = $props();

  let activeTab = $derived.by(() => {
    if (tabStore.splitMode && paneId) {
      const activeId = paneId === 'left' ? tabStore.activeLeftTabId : tabStore.activeRightTabId;
      return tabStore.tabs.find(t => t.id === activeId);
    }
    return tabStore.activeTab;
  });
</script>

<div class="tab-content">
  {#if !activeTab}
    <div class="empty-state">
      <div class="message">No tab selected</div>
    </div>
  {:else if activeTab.type === 'query'}
    {#key activeTab.id}
      <QueryTab tab={activeTab} {onqueryresult} />
    {/key}
  {:else if activeTab.type === 'table'}
    {#key activeTab.id}
      <TableTab tab={activeTab} {onqueryresult} />
    {/key}
  {:else if activeTab.type === 'document'}
    {#key activeTab.id}
      <DocumentTab tab={activeTab} />
    {/key}
  {:else if activeTab.type === 'keyvalue'}
    {#key activeTab.id}
      <KeyValueTab tab={activeTab} />
    {/key}
  {:else if activeTab.type === 'graph'}
    {#key activeTab.id}
      <GraphTab tab={activeTab} />
    {/key}
  {/if}
</div>

<style>
  .tab-content {
    height: 100%;
    overflow: hidden;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
  }
</style>
