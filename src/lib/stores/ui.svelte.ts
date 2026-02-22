class UiStore {
  sidebarWidth = $state(260);
  showConnectionModal = $state(false);
  showConfirmDialog = $state(false);
  confirmDialogMessage = $state('');
  confirmDialogCallback = $state<(() => void) | null>(null);
  isLoading = $state(false);
  loadingMessage = $state('');
  errorMessage = $state<string | null>(null);

  openConnectionModal() {
    this.showConnectionModal = true;
  }

  closeConnectionModal() {
    this.showConnectionModal = false;
  }

  confirm(message: string, callback: () => void) {
    this.confirmDialogMessage = message;
    this.confirmDialogCallback = callback;
    this.showConfirmDialog = true;
  }

  closeConfirmDialog() {
    this.showConfirmDialog = false;
    this.confirmDialogCallback = null;
  }

  setLoading(loading: boolean, message = '') {
    this.isLoading = loading;
    this.loadingMessage = message;
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = null;
    }, 5000);
  }
}

export const uiStore = new UiStore();
