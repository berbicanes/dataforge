<script lang="ts">
  import { uiStore } from '$lib/stores/ui.svelte';
  import { workspacesStore } from '$lib/stores/workspaces.svelte';
  import { connectionStore } from '$lib/stores/connections.svelte';
  import type { WorkspaceProfile } from '$lib/types/workspace';

  let saveName = $state('');
  let renamingId = $state<string | null>(null);
  let renameValue = $state('');

  function close() {
    uiStore.showWorkspaceModal = false;
  }

  function handleSave() {
    if (!saveName.trim()) return;
    workspacesStore.saveCurrentState(saveName.trim());
    saveName = '';
    uiStore.showSuccess('Workspace saved');
  }

  function handleRestore(profile: WorkspaceProfile) {
    workspacesStore.restore(profile.id);
    uiStore.showSuccess(`Workspace "${profile.name}" restored`);
    close();
  }

  function handleUpdate(profile: WorkspaceProfile) {
    workspacesStore.update(profile.id);
    uiStore.showSuccess(`Workspace "${profile.name}" updated`);
  }

  function handleDelete(profile: WorkspaceProfile) {
    uiStore.confirm(`Delete workspace "${profile.name}"?`, () => {
      workspacesStore.remove(profile.id);
    });
  }

  function startRename(profile: WorkspaceProfile) {
    renamingId = profile.id;
    renameValue = profile.name;
  }

  function submitRename() {
    if (renamingId && renameValue.trim()) {
      workspacesStore.rename(renamingId, renameValue.trim());
    }
    renamingId = null;
    renameValue = '';
  }

  function handleRenameKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') submitRename();
    if (e.key === 'Escape') { renamingId = null; renameValue = ''; }
  }

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  function handleSaveKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleString();
  }

  function getConnName(connId: string | null): string {
    if (!connId) return 'None';
    const conn = connectionStore.connections.find(c => c.config.id === connId);
    return conn?.config.name ?? 'Unknown';
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="modal-overlay" onclick={handleOverlayClick} onkeydown={handleKeydown}>
  <div class="modal-card">
    <div class="modal-header">
      <h3>Workspace Profiles</h3>
      <button class="close-btn" onclick={close}>&times;</button>
    </div>

    <div class="save-section">
      <input
        type="text"
        bind:value={saveName}
        onkeydown={handleSaveKeydown}
        placeholder="Name for current workspace..."
        class="save-input"
      />
      <button class="btn btn-primary" onclick={handleSave} disabled={!saveName.trim()}>
        Save Current
      </button>
    </div>

    <div class="modal-body">
      {#each workspacesStore.profiles as profile}
        <div class="profile-item">
          <div class="profile-info">
            {#if renamingId === profile.id}
              <input
                type="text"
                bind:value={renameValue}
                onkeydown={handleRenameKeydown}
                onblur={submitRename}
                class="rename-input"
              />
            {:else}
              <span class="profile-name">{profile.name}</span>
            {/if}
            <div class="profile-meta">
              <span>{getConnName(profile.connectionId)}</span>
              <span class="separator">&middot;</span>
              <span>{profile.tabs.length} tab{profile.tabs.length !== 1 ? 's' : ''}</span>
              <span class="separator">&middot;</span>
              <span>{formatDate(profile.updatedAt)}</span>
            </div>
          </div>
          <div class="profile-actions">
            <button class="action-btn" onclick={() => handleRestore(profile)} title="Restore">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M14 8A6 6 0 1 1 8 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M8 0l3 2-3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="action-btn" onclick={() => handleUpdate(profile)} title="Overwrite with current state">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" stroke-width="1.2" fill="none" transform="scale(0.6) translate(1, 1)"/>
              </svg>
            </button>
            <button class="action-btn" onclick={() => startRename(profile)} title="Rename">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M11 2l3 3-9 9H2v-3l9-9z" stroke="currentColor" stroke-width="1.2" fill="none"/>
              </svg>
            </button>
            <button class="action-btn danger" onclick={() => handleDelete(profile)} title="Delete">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      {:else}
        <div class="empty-state">No workspace profiles saved yet</div>
      {/each}
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
    width: 520px;
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

  .save-section {
    display: flex;
    gap: 8px;
    padding: 12px 18px;
    border-bottom: 1px solid var(--border-color);
  }

  .save-input {
    flex: 1;
    padding: 6px 10px;
    font-size: 13px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-primary);
    color: var(--text-primary);
    outline: none;
  }

  .save-input:focus {
    border-color: var(--accent);
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }

  .profile-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px;
    border-bottom: 1px solid var(--border-color);
  }

  .profile-info {
    flex: 1;
    min-width: 0;
  }

  .profile-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .profile-meta {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .separator {
    margin: 0 4px;
  }

  .rename-input {
    padding: 3px 6px;
    font-size: 13px;
    border: 1px solid var(--accent);
    border-radius: var(--radius-sm);
    background: var(--bg-primary);
    color: var(--text-primary);
    outline: none;
    width: 200px;
  }

  .profile-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .action-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-sm);
  }

  .action-btn:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }

  .action-btn.danger:hover {
    color: var(--error);
    background: rgba(243, 139, 168, 0.1);
  }

  .empty-state {
    padding: 30px 20px;
    text-align: center;
    font-size: 13px;
    color: var(--text-muted);
  }

  .btn {
    padding: 6px 16px;
    font-size: 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    border: none;
    font-weight: 500;
    white-space: nowrap;
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
