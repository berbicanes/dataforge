<script lang="ts">
  import type { ColumnDef, CellValue } from '$lib/types/query';
  import GridHeader from './GridHeader.svelte';
  import GridRow from './GridRow.svelte';

  let { columns, rows, onCellEdit }: {
    columns: ColumnDef[];
    rows: CellValue[][];
    onCellEdit?: (rowIndex: number, colIndex: number, value: string) => void;
  } = $props();

  const ROW_HEIGHT = 32;
  const BUFFER_ROWS = 10;

  let scrollContainer: HTMLDivElement;
  let scrollTop = $state(0);
  let containerHeight = $state(400);

  let totalHeight = $derived(rows.length * ROW_HEIGHT);
  let startIndex = $derived(Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS));
  let endIndex = $derived(Math.min(rows.length, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER_ROWS));
  let visibleRows = $derived(rows.slice(startIndex, endIndex));
  let offsetY = $derived(startIndex * ROW_HEIGHT);

  function handleScroll() {
    if (scrollContainer) {
      scrollTop = scrollContainer.scrollTop;
    }
  }

  function handleResize() {
    if (scrollContainer) {
      containerHeight = scrollContainer.clientHeight;
    }
  }

  $effect(() => {
    if (scrollContainer) {
      containerHeight = scrollContainer.clientHeight;
    }
  });

  function handleCellEdit(rowIndex: number, colIndex: number, value: string) {
    onCellEdit?.(startIndex + rowIndex, colIndex, value);
  }
</script>

<svelte:window onresize={handleResize} />

<div class="data-grid">
  {#if columns.length === 0}
    <div class="empty-state">
      <span class="text-muted">No results</span>
    </div>
  {:else}
    <div class="grid-header-wrapper">
      <GridHeader {columns} />
    </div>
    <div
      class="grid-body"
      bind:this={scrollContainer}
      onscroll={handleScroll}
    >
      <div class="virtual-spacer" style="height: {totalHeight}px; position: relative;">
        <div class="virtual-rows" style="transform: translateY({offsetY}px);">
          {#each visibleRows as row, i}
            <GridRow
              {row}
              {columns}
              rowIndex={startIndex + i}
              editable={!!onCellEdit}
              onCellEdit={(colIndex, value) => handleCellEdit(i, colIndex, value)}
            />
          {/each}
        </div>
      </div>
    </div>
    <div class="grid-footer">
      <span class="row-info">{rows.length} row{rows.length !== 1 ? 's' : ''}</span>
    </div>
  {/if}
</div>

<style>
  .data-grid {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: var(--bg-primary);
  }

  .grid-header-wrapper {
    flex-shrink: 0;
    overflow: hidden;
  }

  .grid-body {
    flex: 1;
    overflow: auto;
  }

  .virtual-spacer {
    width: 100%;
  }

  .virtual-rows {
    width: 100%;
  }

  .grid-footer {
    display: flex;
    align-items: center;
    padding: 4px 12px;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .row-info {
    font-size: 11px;
    color: var(--text-muted);
    font-family: var(--font-mono);
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 13px;
  }
</style>
