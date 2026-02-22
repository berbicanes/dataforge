export type ChangeType = 'cell_edit' | 'row_insert' | 'row_delete';

export interface CellChange {
  type: 'cell_edit';
  rowIndex: number;
  colIndex: number;
  oldValue: string;
  newValue: string;
  isNull?: boolean;
}

export interface RowInsert {
  type: 'row_insert';
  rowIndex: number;
  columns: string[];
  values: string[];
}

export interface RowDelete {
  type: 'row_delete';
  rowIndex: number;
  pkColumns: string[];
  pkValues: string[];
}

export type Change = CellChange | RowInsert | RowDelete;

interface TabChanges {
  changes: Change[];
  undoStack: Change[][];
  redoStack: Change[][];
}

class ChangeTracker {
  private tabData = $state<Record<string, TabChanges>>({});

  private getOrCreate(tabId: string): TabChanges {
    if (!this.tabData[tabId]) {
      this.tabData[tabId] = { changes: [], undoStack: [], redoStack: [] };
      this.tabData = { ...this.tabData };
    }
    return this.tabData[tabId];
  }

  addCellEdit(tabId: string, rowIndex: number, colIndex: number, oldValue: string, newValue: string, isNull?: boolean) {
    const data = this.getOrCreate(tabId);
    const change: CellChange = { type: 'cell_edit', rowIndex, colIndex, oldValue, newValue, isNull };

    // Check if there's already a change for this cell - replace it
    const existingIdx = data.changes.findIndex(
      c => c.type === 'cell_edit' && c.rowIndex === rowIndex && c.colIndex === colIndex
    );
    if (existingIdx >= 0) {
      const existing = data.changes[existingIdx] as CellChange;
      change.oldValue = existing.oldValue; // keep original old value
      data.changes[existingIdx] = change;
    } else {
      data.changes.push(change);
    }

    data.undoStack.push([change]);
    data.redoStack = [];
    this.tabData = { ...this.tabData };
  }

  addRowInsert(tabId: string, rowIndex: number, columns: string[], values: string[]) {
    const data = this.getOrCreate(tabId);
    const change: RowInsert = { type: 'row_insert', rowIndex, columns, values };
    data.changes.push(change);
    data.undoStack.push([change]);
    data.redoStack = [];
    this.tabData = { ...this.tabData };
  }

  addRowDelete(tabId: string, rowIndex: number, pkColumns: string[], pkValues: string[]) {
    const data = this.getOrCreate(tabId);
    const change: RowDelete = { type: 'row_delete', rowIndex, pkColumns, pkValues };
    data.changes.push(change);
    data.undoStack.push([change]);
    data.redoStack = [];
    this.tabData = { ...this.tabData };
  }

  undo(tabId: string): Change | null {
    const data = this.tabData[tabId];
    if (!data || data.undoStack.length === 0) return null;

    const undone = data.undoStack.pop()!;
    data.redoStack.push(undone);

    // Remove from changes
    for (const change of undone) {
      const idx = data.changes.indexOf(change);
      if (idx >= 0) data.changes.splice(idx, 1);
    }

    this.tabData = { ...this.tabData };
    return undone[0] ?? null;
  }

  redo(tabId: string): Change | null {
    const data = this.tabData[tabId];
    if (!data || data.redoStack.length === 0) return null;

    const redone = data.redoStack.pop()!;
    data.undoStack.push(redone);

    // Re-add to changes
    for (const change of redone) {
      data.changes.push(change);
    }

    this.tabData = { ...this.tabData };
    return redone[0] ?? null;
  }

  discard(tabId: string) {
    delete this.tabData[tabId];
    this.tabData = { ...this.tabData };
  }

  getChanges(tabId: string): Change[] {
    return this.tabData[tabId]?.changes ?? [];
  }

  hasChanges(tabId: string): boolean {
    const data = this.tabData[tabId];
    return data ? data.changes.length > 0 : false;
  }

  canUndo(tabId: string): boolean {
    return (this.tabData[tabId]?.undoStack.length ?? 0) > 0;
  }

  canRedo(tabId: string): boolean {
    return (this.tabData[tabId]?.redoStack.length ?? 0) > 0;
  }

  isCellModified(tabId: string, rowIndex: number, colIndex: number): boolean {
    const changes = this.getChanges(tabId);
    return changes.some(c => c.type === 'cell_edit' && c.rowIndex === rowIndex && c.colIndex === colIndex);
  }

  isRowDeleted(tabId: string, rowIndex: number): boolean {
    const changes = this.getChanges(tabId);
    return changes.some(c => c.type === 'row_delete' && c.rowIndex === rowIndex);
  }

  isRowInserted(tabId: string, rowIndex: number): boolean {
    const changes = this.getChanges(tabId);
    return changes.some(c => c.type === 'row_insert' && c.rowIndex === rowIndex);
  }

  changeCount(tabId: string): number {
    return this.getChanges(tabId).length;
  }
}

export const changeTracker = new ChangeTracker();
