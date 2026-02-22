<script lang="ts">
  import { uiStore } from '$lib/stores/ui.svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { DEFAULT_SHORTCUTS } from '$lib/types/shortcuts';

  let recordingId = $state<string | null>(null);
  let recordedKey = $state('');

  // Group shortcuts by category
  let grouped = $derived(() => {
    const map = new Map<string, typeof DEFAULT_SHORTCUTS>();
    for (const action of DEFAULT_SHORTCUTS) {
      if (!map.has(action.category)) map.set(action.category, []);
      map.get(action.category)!.push(action);
    }
    return Array.from(map.entries());
  });

  function handleClose() {
    uiStore.showShortcutsModal = false;
    recordingId = null;
  }

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) handleClose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (recordingId) {
      e.preventDefault();
      e.stopPropagation();
      const keyStr = settingsStore.eventToDisplayString(e);
      if (!keyStr) return; // modifier-only
      recordedKey = keyStr;
      settingsStore.setShortcut(recordingId, keyStr);
      recordingId = null;
      return;
    }
    if (e.key === 'Escape') handleClose();
  }

  function startRecording(actionId: string) {
    recordingId = actionId;
    recordedKey = '';
  }

  function resetShortcut(actionId: string) {
    settingsStore.resetShortcut(actionId);
  }

  function resetAll() {
    settingsStore.resetAllShortcuts();
  }

  function formatKey(key: string): string[] {
    return key.split('+');
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={handleOverlayClick}>
  <div class="modal-card shortcuts-modal">
    <div class="modal-header">
      <h2>Keyboard Shortcuts</h2>
      <div class="header-actions">
        <button class="btn btn-sm" onclick={resetAll}>Reset All</button>
        <button class="close-btn" onclick={handleClose} title="Close" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="modal-body">
      {#each grouped() as [category, actions]}
        <div class="shortcut-group">
          <div class="group-label">{category}</div>
          {#each actions as action}
            {@const binding = settingsStore.getBinding(action.id)}
            {@const isRecording = recordingId === action.id}
            <div class="shortcut-row">
              <span class="action-label">{action.label}</span>
              <div class="binding-area">
                <button
                  class="binding-btn"
                  class:recording={isRecording}
                  onclick={() => startRecording(action.id)}
                  title="Click to change shortcut"
                >
                  {#if isRecording}
                    <span class="recording-text">Press a key...</span>
                  {:else}
                    {#each formatKey(binding) as part, i}
                      {#if i > 0}<span class="key-sep">+</span>{/if}
                      <span class="kbd">{part}</span>
                    {/each}
                  {/if}
                </button>
                {#if settingsStore.shortcutOverrides[action.id]}
                  <button
                    class="reset-btn"
                    onclick={() => resetShortcut(action.id)}
                    title="Reset to default"
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="M14 8A6 6 0 1 1 8 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M8 0l3 2-3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .shortcuts-modal {
    width: 480px;
    max-height: 80vh;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    border: none;
    background: none;
    cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast);
    padding: 0;
  }

  .close-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .shortcut-group {
    margin-bottom: 16px;
  }

  .group-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    margin-bottom: 6px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border-color);
  }

  .shortcut-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 0;
  }

  .action-label {
    font-size: 13px;
    color: var(--text-primary);
  }

  .binding-area {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .binding-btn {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 3px 8px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    cursor: pointer;
    transition: border-color var(--transition-fast);
    min-width: 80px;
    justify-content: center;
    color: var(--text-primary);
    font-size: 12px;
  }

  .binding-btn:hover {
    border-color: var(--accent);
  }

  .binding-btn.recording {
    border-color: var(--accent);
    background: rgba(122, 162, 247, 0.1);
  }

  .recording-text {
    font-size: 11px;
    color: var(--accent);
    font-style: italic;
  }

  .key-sep {
    color: var(--text-muted);
    font-size: 10px;
  }

  .reset-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
  }

  .reset-btn:hover {
    color: var(--accent);
    background: var(--bg-hover);
  }
</style>
