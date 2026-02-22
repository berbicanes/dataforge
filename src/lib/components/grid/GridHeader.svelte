<script lang="ts">
  import type { ColumnDef } from '$lib/types/query';

  let { columns }: { columns: ColumnDef[] } = $props();
</script>

<div class="grid-header">
  <div class="header-row">
    <div class="header-cell row-number">#</div>
    {#each columns as col}
      <div class="header-cell" title="{col.name} ({col.data_type})">
        <span class="col-name">{col.name}</span>
        <span class="col-type">{col.data_type}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .grid-header {
    background: var(--bg-tertiary);
    border-bottom: 2px solid var(--border-color);
  }

  .header-row {
    display: flex;
  }

  .header-cell {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4px 10px;
    min-width: 120px;
    max-width: 300px;
    flex: 1;
    border-right: 1px solid var(--border-color);
    overflow: hidden;
    user-select: none;
  }

  .header-cell.row-number {
    min-width: 50px;
    max-width: 50px;
    flex: 0;
    text-align: center;
    font-size: 10px;
    color: var(--text-muted);
    font-weight: 600;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .col-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.3;
  }

  .col-type {
    font-size: 10px;
    color: var(--text-muted);
    font-family: var(--font-mono);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.3;
  }
</style>
