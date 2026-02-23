<script lang="ts">
  import { uiStore } from '$lib/stores/ui.svelte';
  import { snippetsStore } from '$lib/stores/snippets.svelte';
  import { connectionStore } from '$lib/stores/connections.svelte';
  import { parseVariables } from '$lib/utils/snippetVariables';
  import type { SnippetVariable } from '$lib/types/query';

  let editing = $derived(uiStore.snippetToEdit);
  let name = $state(editing?.name ?? '');
  let description = $state(editing?.description ?? '');
  let sql = $state(editing?.sql ?? '');
  let tagsInput = $state(editing?.tags?.join(', ') ?? '');
  let scopeToConnection = $state(!!editing?.connectionId);
  let variables = $state<SnippetVariable[]>(editing?.variables ?? []);

  // Re-initialize when editing snippet changes
  $effect(() => {
    const e = uiStore.snippetToEdit;
    name = e?.name ?? '';
    description = e?.description ?? '';
    sql = e?.sql ?? '';
    tagsInput = e?.tags?.join(', ') ?? '';
    scopeToConnection = !!e?.connectionId;
    variables = e?.variables ?? [];
  });

  // Auto-detect variables from SQL
  let detectedVarNames = $derived(parseVariables(sql));

  $effect(() => {
    const detected = detectedVarNames;
    const existing = new Map(variables.map(v => [v.name, v]));
    const updated: SnippetVariable[] = detected.map(varName => {
      const existing_var = existing.get(varName);
      return existing_var ?? { name: varName, defaultValue: '', description: '' };
    });
    // Only update if the variable names changed
    const currentNames = variables.map(v => v.name).join(',');
    const newNames = updated.map(v => v.name).join(',');
    if (currentNames !== newNames) {
      variables = updated;
    }
  });

  function close() {
    uiStore.showSnippetModal = false;
    uiStore.snippetToEdit = null;
  }

  function handleSave() {
    if (!name.trim() || !sql.trim()) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const connId = scopeToConnection ? (connectionStore.activeConnectionId ?? undefined) : undefined;

    if (editing) {
      snippetsStore.update(editing.id, {
        name: name.trim(),
        description: description.trim(),
        sql,
        variables,
        connectionId: connId,
        tags,
      });
    } else {
      snippetsStore.save({
        name: name.trim(),
        description: description.trim(),
        sql,
        variables,
        connectionId: connId,
        tags,
      });
    }
    close();
  }

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="modal-overlay" onclick={handleOverlayClick} onkeydown={handleKeydown}>
  <div class="modal-card">
    <div class="modal-header">
      <h3>{editing ? 'Edit Snippet' : 'New Snippet'}</h3>
      <button class="close-btn" onclick={close}>&times;</button>
    </div>

    <div class="modal-body">
      <label class="field">
        <span class="field-label">Name</span>
        <input type="text" bind:value={name} placeholder="e.g. Find slow queries" />
      </label>

      <label class="field">
        <span class="field-label">Description</span>
        <input type="text" bind:value={description} placeholder="Optional description" />
      </label>

      <label class="field">
        <span class="field-label">SQL</span>
        <textarea bind:value={sql} rows="8" placeholder={'SELECT * FROM {{table_name}} WHERE id = {{id}}'} spellcheck="false"></textarea>
      </label>

      {#if variables.length > 0}
        <div class="variables-section">
          <span class="field-label">Variables</span>
          {#each variables as variable, i}
            <div class="variable-row">
              <span class="var-name">{`{{${variable.name}}}`}</span>
              <input
                type="text"
                bind:value={variables[i].defaultValue}
                placeholder="Default value"
              />
              <input
                type="text"
                bind:value={variables[i].description}
                placeholder="Description"
              />
            </div>
          {/each}
        </div>
      {/if}

      <label class="field">
        <span class="field-label">Tags</span>
        <input type="text" bind:value={tagsInput} placeholder="Comma-separated tags" />
      </label>

      <label class="field-inline">
        <input type="checkbox" bind:checked={scopeToConnection} />
        <span>Scope to current connection</span>
      </label>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" onclick={close}>Cancel</button>
      <button class="btn btn-primary" onclick={handleSave} disabled={!name.trim() || !sql.trim()}>
        {editing ? 'Update' : 'Save'}
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
  }

  .modal-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 540px;
    max-height: 85vh;
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

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .field input,
  .field textarea {
    padding: 6px 10px;
    font-size: 13px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-primary);
    color: var(--text-primary);
    outline: none;
    font-family: inherit;
  }

  .field textarea {
    font-family: var(--font-mono);
    font-size: 12px;
    resize: vertical;
  }

  .field input:focus,
  .field textarea:focus {
    border-color: var(--accent);
  }

  .variables-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .variable-row {
    display: grid;
    grid-template-columns: 100px 1fr 1fr;
    gap: 6px;
    align-items: center;
  }

  .var-name {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--accent);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .variable-row input {
    padding: 4px 8px;
    font-size: 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-primary);
    color: var(--text-primary);
    outline: none;
  }

  .variable-row input:focus {
    border-color: var(--accent);
  }

  .field-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
  }

  .field-inline input[type="checkbox"] {
    accent-color: var(--accent);
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

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
