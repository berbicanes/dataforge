<script lang="ts">
  import { onMount } from 'svelte';
  import { executeQuery } from '$lib/services/tauri';

  let {
    connectionId,
    referencedSchema,
    referencedTable,
    referencedColumn,
    currentValue = '',
    onSelect,
    onClose,
  }: {
    connectionId: string;
    referencedSchema: string;
    referencedTable: string;
    referencedColumn: string;
    currentValue?: string;
    onSelect?: (value: string) => void;
    onClose?: () => void;
  } = $props();

  let values = $state<string[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let searchQuery = $state('');
  let highlightIndex = $state(0);
  let dropdownEl = $state<HTMLDivElement | undefined>(undefined);
  let inputEl = $state<HTMLInputElement | undefined>(undefined);

  $effect(() => {
    searchQuery = currentValue ?? '';
  });

  let filteredValues = $derived(
    searchQuery.length > 0
      ? values.filter(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
      : values
  );

  onMount(async () => {
    try {
      const schema = referencedSchema ? `"${referencedSchema}".` : '';
      const query = `SELECT DISTINCT "${referencedColumn}" FROM ${schema}"${referencedTable}" ORDER BY 1 LIMIT 100`;
      const result = await executeQuery(connectionId, query, 256);
      values = result.rows.map(row => {
        const cell = row[0];
        if (!cell || cell.type === 'Null') return '';
        return 'value' in cell ? String(cell.value) : '';
      }).filter(v => v !== '');
      error = null;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      isLoading = false;
    }

    inputEl?.focus();

    // Position clamping
    if (dropdownEl) {
      const rect = dropdownEl.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom > vh) {
        dropdownEl.style.bottom = '100%';
        dropdownEl.style.top = 'auto';
      }
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightIndex = Math.min(highlightIndex + 1, filteredValues.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightIndex = Math.max(highlightIndex - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredValues.length > 0) {
        onSelect?.(filteredValues[highlightIndex]);
      } else {
        onSelect?.(searchQuery);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (dropdownEl && !dropdownEl.contains(e.target as Node)) {
      onClose?.();
    }
  }
</script>

<svelte:window onmousedown={handleClickOutside} />

<div class="fk-dropdown" bind:this={dropdownEl}>
  <input
    bind:this={inputEl}
    type="text"
    class="fk-search"
    placeholder="Search values..."
    bind:value={searchQuery}
    onkeydown={handleKeydown}
  />
  <div class="fk-list">
    {#if isLoading}
      <div class="fk-status">Loading...</div>
    {:else if error}
      <div class="fk-status fk-error">Error: {error}</div>
    {:else if filteredValues.length === 0}
      <div class="fk-status">No matching values</div>
    {:else}
      {#each filteredValues as val, i}
        <button
          class="fk-item"
          class:highlighted={i === highlightIndex}
          class:current={val === currentValue}
          onclick={() => onSelect?.(val)}
          onmouseenter={() => { highlightIndex = i; }}
          role="option"
          aria-selected={i === highlightIndex}
        >
          {val}
        </button>
      {/each}
    {/if}
  </div>
</div>

<style>
  .fk-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    min-width: 180px;
    max-width: 300px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md, 6px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    overflow: hidden;
  }

  .fk-search {
    width: 100%;
    padding: 6px 8px;
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--text-primary);
    background: var(--bg-primary);
    border: none;
    border-bottom: 1px solid var(--border-color);
    outline: none;
    box-sizing: border-box;
  }

  .fk-search:focus {
    background: var(--bg-primary);
  }

  .fk-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .fk-item {
    display: block;
    width: 100%;
    padding: 4px 8px;
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--text-primary);
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .fk-item:hover, .fk-item.highlighted {
    background: var(--bg-hover);
  }

  .fk-item.current {
    color: var(--accent);
  }

  .fk-status {
    padding: 8px;
    font-size: 11px;
    color: var(--text-muted);
    text-align: center;
  }

  .fk-error {
    color: var(--error);
  }
</style>
