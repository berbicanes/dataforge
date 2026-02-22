<script lang="ts">
  import type { ColumnInfo } from '$lib/types/schema';

  let { columns }: { columns: ColumnInfo[] } = $props();
</script>

<div class="columns-view">
  {#if columns.length === 0}
    <div class="empty-state">
      <span class="text-muted">No columns found</span>
    </div>
  {:else}
    <table class="data-table">
      <thead>
        <tr>
          <th class="col-ordinal">#</th>
          <th class="col-name">Name</th>
          <th class="col-type">Type</th>
          <th class="col-nullable">Nullable</th>
          <th class="col-default">Default</th>
          <th class="col-pk">Primary Key</th>
        </tr>
      </thead>
      <tbody>
        {#each columns as col}
          <tr class:pk-row={col.is_primary_key}>
            <td class="ordinal">{col.ordinal_position}</td>
            <td class="name">
              {#if col.is_primary_key}
                <span class="pk-icon" title="Primary Key">&#x1F511;</span>
              {/if}
              <span class:pk-name={col.is_primary_key}>{col.name}</span>
            </td>
            <td class="type">{col.data_type}</td>
            <td class="nullable">
              {#if col.is_nullable}
                <span class="check" title="Nullable">&#x2713;</span>
              {:else}
                <span class="dash">&mdash;</span>
              {/if}
            </td>
            <td class="default-val">
              {#if col.column_default}
                <span class="mono">{col.column_default}</span>
              {:else}
                <span class="dash">&mdash;</span>
              {/if}
            </td>
            <td class="pk">
              {#if col.is_primary_key}
                <span class="check pk-check">&#x2713;</span>
              {:else}
                <span class="dash">&mdash;</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .columns-view {
    height: 100%;
    overflow: auto;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 13px;
  }

  .ordinal {
    color: var(--text-muted);
    font-size: 11px;
    text-align: center;
    width: 40px;
  }

  .name {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
  }

  .pk-icon {
    font-size: 12px;
    flex-shrink: 0;
  }

  .pk-name {
    color: var(--accent);
  }

  .pk-row {
    background: rgba(122, 162, 247, 0.05);
  }

  .type {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-secondary);
  }

  .nullable, .pk {
    text-align: center;
    width: 80px;
  }

  .check {
    color: var(--success);
    font-size: 14px;
  }

  .pk-check {
    color: var(--accent);
  }

  .dash {
    color: var(--text-muted);
    opacity: 0.4;
  }

  .default-val {
    max-width: 200px;
  }

  .mono {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-secondary);
  }

  .col-ordinal {
    width: 40px;
    text-align: center;
  }

  .col-nullable, .col-pk {
    width: 80px;
    text-align: center;
  }
</style>
