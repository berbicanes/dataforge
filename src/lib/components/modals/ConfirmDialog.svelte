<script lang="ts">
  import { uiStore } from '$lib/stores/ui.svelte';

  function handleConfirm() {
    if (uiStore.confirmDialogCallback) {
      uiStore.confirmDialogCallback();
    }
    uiStore.closeConfirmDialog();
  }

  function handleCancel() {
    uiStore.closeConfirmDialog();
  }

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter') {
      handleConfirm();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={handleOverlayClick}>
  <div class="modal-card confirm-dialog">
    <div class="modal-header">
      <h2>Confirm</h2>
    </div>

    <div class="modal-body">
      <p class="confirm-message">{uiStore.confirmDialogMessage}</p>
    </div>

    <div class="modal-footer">
      <button class="btn cancel-btn" onclick={handleCancel}>
        Cancel
      </button>
      <button class="btn btn-danger confirm-btn" onclick={handleConfirm}>
        Confirm
      </button>
    </div>
  </div>
</div>

<style>
  .confirm-dialog {
    width: 400px;
    min-width: auto;
  }

  .confirm-message {
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.6;
    margin: 0;
  }

  .cancel-btn {
    color: var(--text-secondary);
    padding: 6px 14px;
    border-radius: var(--radius-sm);
  }

  .cancel-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .confirm-btn {
    padding: 6px 14px;
    border-radius: var(--radius-sm);
    font-weight: 500;
    background: rgba(243, 139, 168, 0.15);
    border: 1px solid var(--error);
  }

  .confirm-btn:hover {
    background: rgba(243, 139, 168, 0.25);
  }
</style>
