<script lang="ts">
  import type { ForeignKeyInfo } from '$lib/types/schema';

  let { foreignKeys }: { foreignKeys: ForeignKeyInfo[] } = $props();
</script>

<div class="fk-view">
  {#if foreignKeys.length === 0}
    <div class="empty-state">
      <span class="text-muted">No foreign keys found</span>
    </div>
  {:else}
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Columns</th>
          <th>Referenced Table</th>
          <th>Referenced Columns</th>
          <th>On Update</th>
          <th>On Delete</th>
        </tr>
      </thead>
      <tbody>
        {#each foreignKeys as fk}
          <tr>
            <td class="name">{fk.name}</td>
            <td class="mono-cell">{fk.columns.join(', ')}</td>
            <td class="ref-table">
              <span class="schema-prefix">{fk.referenced_schema}.</span>{fk.referenced_table}
            </td>
            <td class="mono-cell">{fk.referenced_columns.join(', ')}</td>
            <td class="action-cell">
              <span class="action-badge">{fk.on_update}</span>
            </td>
            <td class="action-cell">
              <span class="action-badge" class:cascade={fk.on_delete === 'CASCADE'} class:restrict={fk.on_delete === 'RESTRICT' || fk.on_delete === 'NO ACTION'}>
                {fk.on_delete}
              </span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .fk-view {
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
    font-weight: 500;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mono-cell {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-secondary);
    max-width: 200px;
  }

  .ref-table {
    font-weight: 500;
  }

  .schema-prefix {
    color: var(--text-muted);
    font-weight: 400;
    font-size: 11px;
  }

  .action-cell {
    width: 100px;
  }

  .action-badge {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 500;
    font-family: var(--font-mono);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .action-badge.cascade {
    background: rgba(249, 226, 175, 0.15);
    color: var(--warning);
  }

  .action-badge.restrict {
    background: rgba(166, 227, 161, 0.15);
    color: var(--success);
  }
</style>
