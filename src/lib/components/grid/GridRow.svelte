<script lang="ts">
  import type { ColumnDef, CellValue } from '$lib/types/query';
  import GridCell from './GridCell.svelte';

  let { row, columns, rowIndex, editable = false, onCellEdit }: {
    row: CellValue[];
    columns: ColumnDef[];
    rowIndex: number;
    editable?: boolean;
    onCellEdit?: (colIndex: number, value: string) => void;
  } = $props();

  let isEven = $derived(rowIndex % 2 === 0);
</script>

<div class="grid-row" class:even={isEven} class:odd={!isEven}>
  <div class="row-number-cell">
    {rowIndex + 1}
  </div>
  {#each row as cell, colIndex}
    <GridCell
      value={cell}
      column={columns[colIndex]}
      {editable}
      onEdit={onCellEdit ? (val) => onCellEdit!(colIndex, val) : undefined}
    />
  {/each}
</div>

<style>
  .grid-row {
    display: flex;
    height: 32px;
    border-bottom: 1px solid rgba(69, 71, 90, 0.3);
  }

  .grid-row.even {
    background: var(--bg-primary);
  }

  .grid-row.odd {
    background: rgba(42, 42, 60, 0.3);
  }

  .grid-row:hover {
    background: var(--bg-hover) !important;
  }

  .row-number-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 50px;
    max-width: 50px;
    font-size: 10px;
    color: var(--text-muted);
    font-family: var(--font-mono);
    border-right: 1px solid var(--border-color);
    user-select: none;
    flex-shrink: 0;
  }
</style>
