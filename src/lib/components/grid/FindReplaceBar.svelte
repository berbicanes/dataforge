<script lang="ts">
  let {
    query = '',
    replaceText = '',
    matchCount = 0,
    currentMatchIndex = -1,
    showReplace = false,
    caseSensitive = false,
    editable = false,
    onQueryChange,
    onReplaceTextChange,
    onNext,
    onPrev,
    onReplace,
    onReplaceAll,
    onToggleCaseSensitive,
    onToggleReplace,
    onClose,
  }: {
    query?: string;
    replaceText?: string;
    matchCount?: number;
    currentMatchIndex?: number;
    showReplace?: boolean;
    caseSensitive?: boolean;
    editable?: boolean;
    onQueryChange?: (q: string) => void;
    onReplaceTextChange?: (t: string) => void;
    onNext?: () => void;
    onPrev?: () => void;
    onReplace?: () => void;
    onReplaceAll?: () => void;
    onToggleCaseSensitive?: () => void;
    onToggleReplace?: () => void;
    onClose?: () => void;
  } = $props();

  let searchInput = $state<HTMLInputElement | undefined>(undefined);

  $effect(() => {
    if (searchInput) {
      searchInput.focus();
    }
  });

  function handleSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrev?.();
      } else {
        onNext?.();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    }
  }

  function handleReplaceKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onReplace?.();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    }
  }

  let matchDisplay = $derived(
    matchCount > 0
      ? `${currentMatchIndex + 1} of ${matchCount}`
      : query.length > 0
        ? 'No results'
        : ''
  );
</script>

<div class="find-replace-bar">
  <div class="find-row">
    <input
      bind:this={searchInput}
      type="text"
      class="find-input"
      placeholder="Find..."
      value={query}
      oninput={(e) => onQueryChange?.(e.currentTarget.value)}
      onkeydown={handleSearchKeydown}
    />
    <span class="match-info">{matchDisplay}</span>
    <button
      class="bar-btn"
      class:active={caseSensitive}
      onclick={() => onToggleCaseSensitive?.()}
      title="Match case"
    >Aa</button>
    <button class="bar-btn" onclick={() => onPrev?.()} disabled={matchCount === 0} title="Previous match (Shift+Enter)">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path d="M8 12V4M4 8l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button class="bar-btn" onclick={() => onNext?.()} disabled={matchCount === 0} title="Next match (Enter)">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path d="M8 4v8M4 8l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    {#if editable}
      <button
        class="bar-btn"
        class:active={showReplace}
        onclick={() => onToggleReplace?.()}
        title="Toggle replace (Ctrl+H)"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M3 5h10M3 11h10M6 2l-3 3 3 3M10 8l3 3-3 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    {/if}
    <button class="bar-btn close-btn" onclick={() => onClose?.()} title="Close (Escape)">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
  {#if showReplace && editable}
    <div class="replace-row">
      <input
        type="text"
        class="find-input"
        placeholder="Replace..."
        value={replaceText}
        oninput={(e) => onReplaceTextChange?.(e.currentTarget.value)}
        onkeydown={handleReplaceKeydown}
      />
      <button class="bar-btn replace-btn" onclick={() => onReplace?.()} disabled={matchCount === 0} title="Replace">Replace</button>
      <button class="bar-btn replace-btn" onclick={() => onReplaceAll?.()} disabled={matchCount === 0} title="Replace all">All</button>
    </div>
  {/if}
</div>

<style>
  .find-replace-bar {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px 8px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .find-row, .replace-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .find-input {
    flex: 1;
    min-width: 0;
    max-width: 240px;
    height: 24px;
    padding: 2px 8px;
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--text-primary);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm, 3px);
    outline: none;
  }

  .find-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(122, 162, 247, 0.15);
  }

  .match-info {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--text-muted);
    min-width: 64px;
    text-align: center;
    white-space: nowrap;
  }

  .bar-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 4px;
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius-sm, 3px);
    color: var(--text-muted);
    cursor: pointer;
    font-size: 11px;
    font-family: var(--font-mono);
  }

  .bar-btn:hover:not(:disabled) {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .bar-btn.active {
    color: var(--accent);
    border-color: var(--accent);
    background: rgba(122, 162, 247, 0.1);
  }

  .bar-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .replace-btn {
    font-size: 11px;
    padding: 0 8px;
  }

  .close-btn {
    margin-left: 2px;
  }
</style>
