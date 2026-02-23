<script lang="ts">
  import type { CellValue, ColumnDef } from '$lib/types/query';
  import { extractCellValue, isNull, isLargeValue } from '$lib/utils/formatters';

  let {
    cell,
    column,
    rowIndex,
    editable = false,
    onClose,
    onEdit,
    onSetNull,
  }: {
    cell: CellValue | null;
    column: ColumnDef | null;
    rowIndex: number | null;
    editable?: boolean;
    onClose: () => void;
    onEdit?: (value: string) => void;
    onSetNull?: () => void;
  } = $props();

  let copied = $state(false);
  let isEditing = $state(false);
  let editValue = $state('');
  let textareaEl = $state<HTMLTextAreaElement | undefined>(undefined);

  let displayValue = $derived(cell ? extractCellValue(cell) : '');
  let cellIsNull = $derived(cell ? isNull(cell) : true);
  let isLarge = $derived(cell ? isLargeValue(cell) : false);

  let isJson = $derived.by(() => {
    if (!cell || !column) return false;
    if (cell.type === 'Json' || cell.type === 'LargeJson') return true;
    if (column.data_type.toLowerCase().includes('json')) return true;
    if (cell.type === 'Text' || cell.type === 'LargeText') {
      const val = displayValue.trim();
      return (val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']'));
    }
    return false;
  });

  let prettyValue = $derived.by(() => {
    if (!isJson || cellIsNull) return displayValue;
    try {
      return JSON.stringify(JSON.parse(displayValue), null, 2);
    } catch {
      return displayValue;
    }
  });

  let typeLabel = $derived.by(() => {
    if (!cell) return '';
    if (cell.type === 'LargeText' || cell.type === 'LargeJson' || cell.type === 'LargeBinary') {
      return cell.type.replace('Large', '') + ' (truncated)';
    }
    return cell.type;
  });

  let charCount = $derived(displayValue.length);

  // Reset edit state when cell changes
  $effect(() => {
    // Access cell/column/rowIndex to track changes
    const _c = cell;
    const _col = column;
    const _r = rowIndex;
    if (_c || _col || _r !== null) {
      isEditing = false;
    }
  });

  async function handleCopy() {
    try {
      const text = isJson ? prettyValue : displayValue;
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => { copied = false; }, 1500);
    } catch {
      // ignore
    }
  }

  function startEditing() {
    if (!editable || !onEdit) return;
    isEditing = true;
    editValue = isJson ? prettyValue : (cellIsNull ? '' : displayValue);
    requestAnimationFrame(() => {
      textareaEl?.focus();
    });
  }

  function handleSave() {
    isEditing = false;
    const original = cellIsNull ? '' : displayValue;
    // For JSON, try to compact before comparing
    let valueToSave = editValue;
    if (isJson) {
      try {
        valueToSave = JSON.stringify(JSON.parse(editValue));
      } catch {
        // Keep as-is if not valid JSON
        valueToSave = editValue;
      }
    }
    if (valueToSave !== original) {
      onEdit?.(valueToSave);
    }
  }

  function handleCancel() {
    isEditing = false;
  }

  function handleSetNull() {
    isEditing = false;
    onSetNull?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleCancel();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  }
</script>

<div class="cell-inspector">
  <div class="inspector-header">
    <span class="inspector-title">Inspector</span>
    <button class="inspector-close" onclick={onClose} title="Close (Esc)">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4 4l8 8M12 4l-8 8"/>
      </svg>
    </button>
  </div>

  {#if cell && column}
    <div class="inspector-meta">
      <div class="meta-row">
        <span class="meta-label">Column</span>
        <span class="meta-value col-name">{column.name}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Type</span>
        <span class="meta-value type-badge">{column.data_type}</span>
      </div>
      {#if rowIndex !== null}
        <div class="meta-row">
          <span class="meta-label">Row</span>
          <span class="meta-value">{rowIndex + 1}</span>
        </div>
      {/if}
      {#if !cellIsNull}
        <div class="meta-row">
          <span class="meta-label">Size</span>
          <span class="meta-value">{charCount.toLocaleString()} chars</span>
        </div>
      {/if}
    </div>

    <div class="inspector-toolbar">
      <div class="toolbar-group">
        <button class="tool-btn" class:copied onclick={handleCopy} disabled={cellIsNull} title="Copy value">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3">
            <rect x="5" y="5" width="9" height="9" rx="1"/>
            <path d="M3 11V3a1 1 0 011-1h8"/>
          </svg>
          {copied ? 'Copied!' : 'Copy'}
        </button>
        {#if editable && onEdit && !isLarge}
          {#if isEditing}
            <button class="tool-btn save" onclick={handleSave} title="Save (Ctrl+Enter)">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="3 8 6 11 13 4"/>
              </svg>
              Save
            </button>
            <button class="tool-btn" onclick={handleCancel} title="Cancel (Esc)">Cancel</button>
            {#if onSetNull}
              <button class="tool-btn null" onclick={handleSetNull} title="Set NULL">NULL</button>
            {/if}
          {:else}
            <button class="tool-btn edit" onclick={startEditing} title="Edit value">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3">
                <path d="M11.5 1.5l3 3L5 14H2v-3z"/>
              </svg>
              Edit
            </button>
          {/if}
        {/if}
      </div>
    </div>

    <div class="inspector-content">
      {#if isEditing}
        <textarea
          bind:this={textareaEl}
          bind:value={editValue}
          class="edit-textarea"
          class:json={isJson}
          onkeydown={handleKeydown}
          spellcheck="false"
        ></textarea>
      {:else if cellIsNull}
        <div class="null-display">
          <span class="null-badge">NULL</span>
        </div>
      {:else if isLarge}
        <div class="truncated-notice">
          Value truncated — expand in grid to load full content.
        </div>
        <pre class="value-display">{displayValue}</pre>
      {:else if isJson}
        <pre class="value-display json">{prettyValue}</pre>
      {:else}
        <pre class="value-display">{displayValue}</pre>
      {/if}
    </div>
  {:else}
    <div class="inspector-empty">
      Click a cell to inspect its value
    </div>
  {/if}
</div>

<style>
  .cell-inspector {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 360px;
    min-width: 280px;
    flex-shrink: 0;
    border-left: 1px solid var(--border-color);
    background: var(--bg-secondary);
    overflow: hidden;
  }

  .inspector-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .inspector-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .inspector-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    background: none;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: var(--radius-sm);
  }

  .inspector-close:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .inspector-meta {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .meta-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 3px 0;
    font-size: 12px;
  }

  .meta-label {
    color: var(--text-muted);
    flex-shrink: 0;
    min-width: 55px;
    font-size: 11px;
  }

  .meta-value {
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta-value.col-name {
    color: var(--accent);
    font-weight: 600;
  }

  .meta-value.type-badge {
    color: var(--text-secondary);
    font-size: 11px;
    background: var(--bg-tertiary, rgba(69, 71, 90, 0.3));
    padding: 1px 6px;
    border-radius: 3px;
  }

  .inspector-toolbar {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }

  .tool-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    font-size: 11px;
    font-family: var(--font-sans);
    border: 1px solid var(--border-color);
    background: none;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: var(--radius-sm);
    white-space: nowrap;
  }

  .tool-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .tool-btn.copied {
    color: var(--success, #a6e3a1);
    border-color: var(--success, #a6e3a1);
  }

  .tool-btn.save {
    color: var(--success, #a6e3a1);
    border-color: var(--success, #a6e3a1);
  }

  .tool-btn.edit {
    color: var(--accent);
    border-color: var(--accent);
  }

  .tool-btn.null {
    color: var(--text-muted);
    font-weight: 700;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.5px;
  }

  .tool-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .inspector-content {
    flex: 1;
    overflow: auto;
    padding: 12px;
  }

  .edit-textarea {
    width: 100%;
    height: 100%;
    min-height: 120px;
    padding: 8px;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-primary);
    background: var(--bg-primary);
    border: 1px solid var(--accent);
    border-radius: var(--radius-sm);
    outline: none;
    resize: none;
    box-sizing: border-box;
    tab-size: 2;
    box-shadow: 0 0 0 3px rgba(122, 162, 247, 0.12);
  }

  .edit-textarea.json {
    white-space: pre;
    overflow-x: auto;
  }

  .null-display {
    padding: 8px 0;
  }

  .null-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 12px;
    font-size: 11px;
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--text-muted);
    background: var(--bg-tertiary, rgba(69, 71, 90, 0.3));
    border: 1px solid var(--border-color);
    border-radius: 9999px;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  .truncated-notice {
    padding: 8px 10px;
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--warning, #fab387);
    background: rgba(250, 179, 135, 0.08);
    border: 1px solid rgba(250, 179, 135, 0.2);
    border-radius: var(--radius-sm);
    line-height: 1.4;
  }

  .value-display {
    margin: 0;
    padding: 0;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.6;
    color: var(--text-primary);
    white-space: pre-wrap;
    word-break: break-word;
    tab-size: 2;
  }

  .value-display.json {
    color: var(--text-primary);
  }

  .inspector-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 12px;
    color: var(--text-muted);
    padding: 20px;
    text-align: center;
  }
</style>
