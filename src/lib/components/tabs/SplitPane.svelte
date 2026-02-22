<script lang="ts">
  import { tabStore } from '$lib/stores/tabs.svelte';
  import TabBar from './TabBar.svelte';
  import TabContent from './TabContent.svelte';

  let { onqueryresult }: {
    onqueryresult?: (detail: { executionTime: number; rowCount: number }) => void;
  } = $props();

  let isResizing = $state(false);
  let containerEl: HTMLDivElement;

  function handleMouseDown(e: MouseEvent) {
    isResizing = true;
    e.preventDefault();
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing || !containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    tabStore.splitRatio = Math.max(0.2, Math.min(0.8, ratio));
  }

  function handleMouseUp() {
    isResizing = false;
  }

  function handlePaneClick(pane: 'left' | 'right') {
    tabStore.activePaneId = pane;
  }
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div
  class="split-container"
  class:resizing={isResizing}
  style="--split-ratio: {tabStore.splitRatio}"
  bind:this={containerEl}
>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="split-pane left-pane"
    class:active-pane={tabStore.activePaneId === 'left'}
    onclick={() => handlePaneClick('left')}
  >
    <TabBar paneId="left" />
    <div class="pane-content">
      <TabContent paneId="left" {onqueryresult} />
    </div>
  </div>

  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="split-divider"
    onmousedown={handleMouseDown}
    role="separator"
    aria-orientation="vertical"
    tabindex="-1"
  ></div>

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="split-pane right-pane"
    class:active-pane={tabStore.activePaneId === 'right'}
    onclick={() => handlePaneClick('right')}
  >
    <TabBar paneId="right" />
    <div class="pane-content">
      <TabContent paneId="right" {onqueryresult} />
    </div>
  </div>
</div>

<style>
  .split-container {
    display: grid;
    grid-template-columns: calc(var(--split-ratio) * 100% - 2px) 4px calc((1 - var(--split-ratio)) * 100% - 2px);
    height: 100%;
    overflow: hidden;
  }

  .split-container.resizing {
    user-select: none;
    cursor: col-resize;
  }

  .split-pane {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  .split-pane.active-pane {
    outline: 1px solid var(--accent);
    outline-offset: -1px;
    border-radius: 1px;
  }

  .pane-content {
    flex: 1;
    overflow: hidden;
  }

  .split-divider {
    background: var(--border-color);
    cursor: col-resize;
    transition: background var(--transition-fast);
  }

  .split-divider:hover,
  .split-container.resizing .split-divider {
    background: var(--accent);
  }
</style>
