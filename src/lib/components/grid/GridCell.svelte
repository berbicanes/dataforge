<script lang="ts">
  import type { ColumnDef, CellValue } from '$lib/types/query';
  import { extractCellValue, isNull } from '$lib/utils/formatters';

  let { value, column, editable = false, onEdit }: {
    value: CellValue;
    column: ColumnDef;
    editable?: boolean;
    onEdit?: (value: string) => void;
  } = $props();

  let isEditing = $state(false);
  let editValue = $state('');
  let inputEl: HTMLInputElement;

  let displayValue = $derived(extractCellValue(value));
  let cellIsNull = $derived(isNull(value));
  let isBool = $derived(value.type === 'Bool');
  let isNumeric = $derived(value.type === 'Int' || value.type === 'Float');

  function handleDblClick() {
    if (!editable || !onEdit) return;
    isEditing = true;
    editValue = cellIsNull ? '' : displayValue;
    // Focus on next tick
    requestAnimationFrame(() => {
      inputEl?.focus();
      inputEl?.select();
    });
  }

  function handleSave() {
    isEditing = false;
    if (onEdit) {
      onEdit(editValue);
    }
  }

  function handleCancel() {
    isEditing = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  }
</script>

<div
  class="grid-cell"
  class:null-value={cellIsNull}
  class:numeric={isNumeric}
  class:bool-value={isBool}
  ondblclick={handleDblClick}
>
  {#if isEditing}
    <input
      bind:this={inputEl}
      bind:value={editValue}
      class="cell-input"
      onblur={handleSave}
      onkeydown={handleKeydown}
    />
  {:else}
    <span class="cell-text truncate">{displayValue}</span>
  {/if}
</div>

<style>
  .grid-cell {
    display: flex;
    align-items: center;
    padding: 0 10px;
    min-width: 120px;
    max-width: 300px;
    flex: 1;
    border-right: 1px solid rgba(69, 71, 90, 0.3);
    overflow: hidden;
    cursor: default;
    font-size: 12px;
    font-family: var(--font-mono);
  }

  .grid-cell.null-value .cell-text {
    color: var(--text-muted);
    font-style: italic;
    opacity: 0.6;
  }

  .grid-cell.numeric {
    justify-content: flex-end;
  }

  .grid-cell.bool-value .cell-text {
    color: var(--accent);
  }

  .cell-text {
    max-width: 100%;
    line-height: 32px;
  }

  .cell-input {
    width: 100%;
    height: 28px;
    padding: 2px 6px;
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--text-primary);
    background: var(--bg-primary);
    border: 1px solid var(--accent);
    border-radius: 2px;
    outline: none;
  }
</style>
