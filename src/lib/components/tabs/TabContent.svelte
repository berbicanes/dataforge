<script lang="ts">
  import { tabStore } from '$lib/stores/tabs.svelte';
  import QueryTab from './QueryTab.svelte';
  import TableTab from './TableTab.svelte';

  let { onqueryresult }: {
    onqueryresult?: (detail: { executionTime: number; rowCount: number }) => void;
  } = $props();

  let activeTab = $derived(tabStore.activeTab);
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
