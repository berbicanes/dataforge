<script lang="ts">
  import { uiStore } from '$lib/stores/ui.svelte';
  import { substituteVariables } from '$lib/utils/snippetVariables';

  let { oninsert }: { oninsert?: (sql: string) => void } = $props();

  let snippet = $derived(uiStore.snippetToInsert);
  let values = $state<Record<string, string>>({});

  $effect(() => {
    if (snippet) {
      const initial: Record<string, string> = {};
      for (const v of snippet.variables) {
        initial[v.name] = v.defaultValue;
      }
      values = initial;
    }
  });

  function close() {
    uiStore.showSnippetVariablePrompt = false;
    uiStore.snippetToInsert = null;
  }

  function handleInsert() {
    if (!snippet) return;
    const result = substituteVariables(snippet.sql, values);
    oninsert?.(result);
    close();
  }

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleInsert();
  }
</script>

{#if snippet}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal-overlay" onclick={handleOverlayClick} onkeydown={handleKeydown}>
    <div class="modal-card">
      <div class="modal-header">
        <h3>Fill Variables — {snippet.name}</h3>
        <button class="close-btn" onclick={close}>&times;</button>
      </div>

      <div class="modal-body">
        {#if snippet.description}
          <p class="snippet-desc">{snippet.description}</p>
        {/if}

        {#each snippet.variables as variable}
          <label class="field">
            <span class="field-label">
              {`{{${variable.name}}}`}
              {#if variable.description}
                <span class="field-hint"> — {variable.description}</span>
              {/if}
            </span>
            <input
              type="text"
              bind:value={values[variable.name]}
              placeholder={variable.defaultValue || variable.name}
            />
          </label>
        {/each}
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={close}>Cancel</button>
        <button class="btn btn-primary" onclick={handleInsert}>Insert</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    backdrop-filter: blur(2px);
  }

  .modal-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 420px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border-color);
  }

  .modal-header h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 18px;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0 4px;
  }

  .close-btn:hover {
    color: var(--text-primary);
  }

  .modal-body {
    padding: 16px 18px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .snippet-desc {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--accent);
    font-family: var(--font-mono);
  }

  .field-hint {
    font-family: inherit;
    font-weight: 400;
    color: var(--text-muted);
    font-size: 11px;
  }

  .field input {
    padding: 6px 10px;
    font-size: 13px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-primary);
    color: var(--text-primary);
    outline: none;
  }

  .field input:focus {
    border-color: var(--accent);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 18px;
    border-top: 1px solid var(--border-color);
  }

  .btn {
    padding: 6px 16px;
    font-size: 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    border: none;
    font-weight: 500;
  }

  .btn-secondary {
    background: var(--bg-hover);
    color: var(--text-secondary);
  }

  .btn-secondary:hover {
    background: var(--border-color);
  }

  .btn-primary {
    background: var(--accent);
    color: #fff;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }
</style>
