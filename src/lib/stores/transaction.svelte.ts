class TransactionStore {
  activeTransactions = $state<Record<string, boolean>>({});

  isInTransaction(connectionId: string): boolean {
    return this.activeTransactions[connectionId] ?? false;
  }

  setInTransaction(connectionId: string, active: boolean) {
    if (active) {
      this.activeTransactions[connectionId] = true;
    } else {
      delete this.activeTransactions[connectionId];
    }
    this.activeTransactions = { ...this.activeTransactions };
  }

  clearConnection(connectionId: string) {
    delete this.activeTransactions[connectionId];
    this.activeTransactions = { ...this.activeTransactions };
  }
}

export const transactionStore = new TransactionStore();
