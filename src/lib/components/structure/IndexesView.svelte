<script lang="ts">
  import type { IndexInfo } from '$lib/types/schema';

  let { indexes }: { indexes: IndexInfo[] } = $props();
</script>

<div class="indexes-view">
  {#if indexes.length === 0}
    <div class="empty-state">
      <span class="text-muted">No indexes found</span>
    </div>
  {:else}
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Columns</th>
          <th class="col-bool">Unique</th>
          <th class="col-bool">Primary</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {#each indexes as idx}
          <tr class:primary-row={idx.is_primary}>
            <td class="name">
              {#if idx.is_primary}
                <span class="pk-icon" title="Primary Key Index">&#x1F511;</span>
              {/if}
              <span class:pk-name={idx.is_primary}>{idx.name}</span>
            </td>
            <td class="columns-cell">
              <span class="mono">{idx.columns.join(', ')}</span>
            </td>
            <td class="bool-cell">
              {#if idx.is_unique}
                <span class="check">&#x2713;</span>
              {:else}
                <span class="dash">&mdash;</span>
              {/if}
            </td>
            <td class="bool-cell">
              {#if idx.is_primary}
                <span class="check pk-check">&#x2713;</span>
              {:else}
                <span class="dash">&mdash;</span>
              {/if}
            </td>
            <td class="type-cell">
              <span class="mono">{idx.index_type}</span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .indexes-view {
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

  .primary-row {
    background: rgba(122, 162, 247, 0.05);
  }

  .columns-cell {
    max-width: 300px;
  }

  .mono {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-secondary);
  }

  .col-bool {
    width: 70px;
    text-align: center;
  }

  .bool-cell {
    text-align: center;
    width: 70px;
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

  .type-cell {
    max-width: 150px;
  }
</style>
