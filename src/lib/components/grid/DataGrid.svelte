<script lang="ts">
  import { untrack } from 'svelte';
  import type { ColumnDef, CellValue, SortColumn, FilterCondition } from '$lib/types/query';
  import type { ForeignKeyInfo } from '$lib/types/schema';
  import { extractCellValue, isNull } from '$lib/utils/formatters';
  import { copyAsCsv, copyAsMarkdown } from '$lib/services/exportService';
  import { parseClipboardText } from '$lib/utils/clipboardParser';
  import { detectAndFill } from '$lib/utils/fillPattern';
  import GridHeader from './GridHeader.svelte';
  import GridRow from './GridRow.svelte';
  import FilterBar from './FilterBar.svelte';
  import FindReplaceBar from './FindReplaceBar.svelte';
  import ContextMenu from './ContextMenu.svelte';

  let {
    columns,
    rows,
    editable = false,
    schema,
    table,
    sortColumns = [],
    filters = [],
    modifiedCells,
    deletedRows,
    foreignKeys,
    connectionId,
    onCellEdit,
    onCellSetNull,
    onSort,
    onFiltersChange,
    onFilterByValue,
    onExpandCell,
    onPaste,
    onActiveCellChange,
    onCellDblClick,
  }: {
    columns: ColumnDef[];
    rows: CellValue[][];
    editable?: boolean;
    schema?: string;
    table?: string;
    sortColumns?: SortColumn[];
    filters?: FilterCondition[];
    modifiedCells?: Map<number, Set<number>>;
    deletedRows?: Set<number>;
    foreignKeys?: ForeignKeyInfo[];
    connectionId?: string;
    onCellEdit?: (rowIndex: number, colIndex: number, value: string) => void;
    onCellSetNull?: (rowIndex: number, colIndex: number) => void;
    onSort?: (sorts: SortColumn[]) => void;
    onFiltersChange?: (filters: FilterCondition[]) => void;
    onFilterByValue?: (column: string, value: string) => void;
    onExpandCell?: (rowIndex: number, colIndex: number) => void;
    onPaste?: (startRow: number, startCol: number, values: string[][]) => void;
    onActiveCellChange?: (rowIndex: number, colIndex: number) => void;
    onCellDblClick?: (rowIndex: number, colIndex: number) => void;
  } = $props();

  const ROW_HEIGHT = 32;
  const BUFFER_ROWS = 10;
  const DEFAULT_COL_WIDTH = 150;

  let scrollContainer = $state<HTMLDivElement | undefined>(undefined);
  let gridWrapper = $state<HTMLDivElement | undefined>(undefined);
  let scrollTop = $state(0);
  let containerHeight = $state(400);

  // Column widths
  let columnWidths = $state<Record<string, number>>({});

  // Column order: array of indices into the original columns array
  let columnOrder = $state<number[]>([]);

  // Row selection
  let selectedRows = $state<Set<number>>(new Set());
  let lastSelectedRow = $state<number | null>(null);

  // Cell selection
  let activeCell = $state<{ row: number; col: number } | null>(null);
  let cellRange = $state<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);
  let isDragging = $state(false);

  // Fill handle drag
  let isFillDragging = $state(false);
  let fillTarget = $state<{ endRow: number; endCol: number } | null>(null);
  let fillDirection = $state<'down' | 'right' | null>(null);

  // Filter bar visibility
  let showFilterBar = $state(false);

  // Find & replace
  let showFindBar = $state(false);
  let showReplace = $state(false);
  let searchQuery = $state('');
  let replaceText = $state('');
  let caseSensitive = $state(false);
  let searchMatches = $state<Array<{ row: number; col: number }>>([]);
  let currentMatchIdx = $state(0);

  // Column header context menu
  let headerContextMenu = $state<{ x: number; y: number; colIndex: number } | null>(null);

  // Context menu
  let contextMenu = $state<{
    x: number;
    y: number;
    rowIndex: number;
    colIndex: number;
  } | null>(null);

  // Initialize column widths and order when columns change
  $effect(() => {
    const cols = columns;
    const prevWidths = untrack(() => columnWidths);
    const newWidths: Record<string, number> = {};
    for (const col of cols) {
      newWidths[col.name] = prevWidths[col.name] ?? DEFAULT_COL_WIDTH;
    }
    columnWidths = newWidths;
    columnOrder = cols.map((_, i) => i);
  });

  // Reorder columns based on columnOrder
  let orderedColumns = $derived(columnOrder.map(i => columns[i]).filter(Boolean));

  // Reorder each row's cells to match column order
  function reorderRow(row: CellValue[]): CellValue[] {
    return columnOrder.map(i => row[i]).filter((c): c is CellValue => c !== undefined);
  }

  // Map from ordered index back to original column index
  function originalColIndex(orderedIdx: number): number {
    return columnOrder[orderedIdx] ?? orderedIdx;
  }

  // Virtual scroll
  let totalHeight = $derived(rows.length * ROW_HEIGHT);
  let startIndex = $derived(Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS));
  let endIndex = $derived(Math.min(rows.length, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER_ROWS));
  let visibleRows = $derived(rows.slice(startIndex, endIndex));
  let offsetY = $derived(startIndex * ROW_HEIGHT);

  let allSelected = $derived(rows.length > 0 && selectedRows.size === rows.length);
  let someSelected = $derived(selectedRows.size > 0 && selectedRows.size < rows.length);

  // Normalized cell range (min/max)
  let normalizedRange = $derived.by(() => {
    if (!cellRange) return null;
    return {
      startRow: Math.min(cellRange.startRow, cellRange.endRow),
      endRow: Math.max(cellRange.startRow, cellRange.endRow),
      startCol: Math.min(cellRange.startCol, cellRange.endCol),
      endCol: Math.max(cellRange.startCol, cellRange.endCol),
    };
  });

  // FK map: ordered col index -> FK info for single-column FKs
  let fkMap = $derived.by(() => {
    if (!foreignKeys || foreignKeys.length === 0) return null;
    const map = new Map<number, { referencedSchema: string; referencedTable: string; referencedColumn: string }>();
    for (const fk of foreignKeys) {
      if (fk.columns.length === 1) {
        // Find the ordered column index for this FK column
        const origIdx = columns.findIndex(c => c.name === fk.columns[0]);
        if (origIdx >= 0) {
          const orderedIdx = columnOrder.indexOf(origIdx);
          if (orderedIdx >= 0) {
            map.set(orderedIdx, {
              referencedSchema: fk.referenced_schema,
              referencedTable: fk.referenced_table,
              referencedColumn: fk.referenced_columns[0],
            });
          }
        }
      }
    }
    return map.size > 0 ? map : null;
  });

  // Search computation
  let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    const q = searchQuery;
    const cs = caseSensitive;
    // Access rows to make this reactive
    const _rows = rows;
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      if (!q || q.length === 0) {
        searchMatches = [];
        currentMatchIdx = 0;
        return;
      }
      const matches: Array<{ row: number; col: number }> = [];
      const needle = cs ? q : q.toLowerCase();
      for (let r = 0; r < _rows.length; r++) {
        for (let c = 0; c < orderedColumns.length; c++) {
          const origC = originalColIndex(c);
          const cell = _rows[r]?.[origC];
          if (!cell || isNull(cell)) continue;
          const val = extractCellValue(cell);
          const haystack = cs ? val : val.toLowerCase();
          if (haystack.includes(needle)) {
            matches.push({ row: r, col: c });
          }
        }
      }
      searchMatches = matches;
      currentMatchIdx = matches.length > 0 ? 0 : -1;
    }, 200);
  });

  // Search match sets per row for efficient lookup
  let searchMatchesByRow = $derived.by(() => {
    const map = new Map<number, Set<number>>();
    for (const m of searchMatches) {
      if (!map.has(m.row)) map.set(m.row, new Set());
      map.get(m.row)!.add(m.col);
    }
    return map;
  });

  let currentMatch = $derived(searchMatches.length > 0 && currentMatchIdx >= 0 ? searchMatches[currentMatchIdx] : null);

  // Notify parent when active cell changes
  $effect(() => {
    if (activeCell) {
      onActiveCellChange?.(activeCell.row, originalColIndex(activeCell.col));
    }
  });

  function handleGridDblClick() {
    if (activeCell) {
      onCellDblClick?.(activeCell.row, originalColIndex(activeCell.col));
    }
  }

  function handleScroll() {
    if (scrollContainer) {
      scrollTop = scrollContainer.scrollTop;
    }
  }

  function handleResize() {
    if (scrollContainer) {
      containerHeight = scrollContainer.clientHeight;
    }
  }

  $effect(() => {
    if (scrollContainer) {
      containerHeight = scrollContainer.clientHeight;
    }
  });

  function handleColumnResize(column: string, width: number) {
    columnWidths = { ...columnWidths, [column]: width };
  }

  function handleCellEdit(rowIndex: number, orderedColIndex: number, value: string) {
    onCellEdit?.(startIndex + rowIndex, originalColIndex(orderedColIndex), value);
  }

  function handleCellSetNull(rowIndex: number, orderedColIndex: number) {
    onCellSetNull?.(startIndex + rowIndex, originalColIndex(orderedColIndex));
  }

  function handleExpandCell(rowIndex: number, orderedColIndex: number) {
    onExpandCell?.(startIndex + rowIndex, originalColIndex(orderedColIndex));
  }

  function handleSelectAll(selected: boolean) {
    if (selected) {
      selectedRows = new Set(rows.map((_, i) => i));
    } else {
      selectedRows = new Set();
    }
    // Clear cell selection when toggling row selection
    activeCell = null;
    cellRange = null;
  }

  function handleRowSelect(absoluteRowIndex: number, e: MouseEvent) {
    const newSelection = new Set(selectedRows);

    if (e.shiftKey && lastSelectedRow !== null) {
      const start = Math.min(lastSelectedRow, absoluteRowIndex);
      const end = Math.max(lastSelectedRow, absoluteRowIndex);
      for (let i = start; i <= end; i++) {
        newSelection.add(i);
      }
    } else if (e.ctrlKey || e.metaKey) {
      if (newSelection.has(absoluteRowIndex)) {
        newSelection.delete(absoluteRowIndex);
      } else {
        newSelection.add(absoluteRowIndex);
      }
    } else {
      if (newSelection.has(absoluteRowIndex) && newSelection.size === 1) {
        newSelection.delete(absoluteRowIndex);
      } else {
        newSelection.clear();
        newSelection.add(absoluteRowIndex);
      }
    }

    selectedRows = newSelection;
    lastSelectedRow = absoluteRowIndex;
    // Clear cell selection when using row checkboxes
    activeCell = null;
    cellRange = null;
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    const newOrder = [...columnOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    columnOrder = newOrder;
  }

  // --- Cell selection ---
  function handleCellMouseDown(visibleRowIdx: number, orderedColIdx: number, e: MouseEvent) {
    // Don't start cell selection on checkbox or row number columns
    const absoluteRow = startIndex + visibleRowIdx;

    // Clear row selection when clicking a cell
    selectedRows = new Set();
    lastSelectedRow = null;

    if (e.shiftKey && activeCell) {
      // Extend selection from active cell
      cellRange = {
        startRow: activeCell.row,
        startCol: activeCell.col,
        endRow: absoluteRow,
        endCol: orderedColIdx,
      };
    } else {
      activeCell = { row: absoluteRow, col: orderedColIdx };
      cellRange = {
        startRow: absoluteRow,
        startCol: orderedColIdx,
        endRow: absoluteRow,
        endCol: orderedColIdx,
      };
      isDragging = true;
    }
  }

  function handleGridMouseMove(e: MouseEvent) {
    if (!isDragging || !scrollContainer) return;
    const rect = scrollContainer.getBoundingClientRect();
    const y = e.clientY - rect.top + scrollContainer.scrollTop;
    const row = Math.max(0, Math.min(rows.length - 1, Math.floor(y / ROW_HEIGHT)));

    // Determine column from X position
    const x = e.clientX - rect.left;
    let col = 0;
    let accum = 82; // checkbox (32) + row number (50)
    for (let i = 0; i < orderedColumns.length; i++) {
      const w = columnWidths[orderedColumns[i].name] ?? DEFAULT_COL_WIDTH;
      if (x < accum + w) {
        col = i;
        break;
      }
      accum += w;
      col = i;
    }

    if (cellRange) {
      cellRange = { ...cellRange, endRow: row, endCol: col };
    }

    // Auto-scroll
    if (e.clientY > rect.bottom - 30) {
      scrollContainer.scrollTop += 16;
    } else if (e.clientY < rect.top + 30) {
      scrollContainer.scrollTop -= 16;
    }
  }

  function handleGridMouseUp() {
    isDragging = false;
    if (isFillDragging) {
      applyFill();
      isFillDragging = false;
      fillTarget = null;
      fillDirection = null;
    }
  }

  // --- Fill handle ---
  function handleFillHandleMouseDown(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    isFillDragging = true;
    fillTarget = null;
    fillDirection = null;
  }

  function handleFillMouseMove(e: MouseEvent) {
    if (!isFillDragging || !normalizedRange || !scrollContainer) return;
    const rect = scrollContainer.getBoundingClientRect();
    const y = e.clientY - rect.top + scrollContainer.scrollTop;
    const targetRow = Math.max(0, Math.min(rows.length - 1, Math.floor(y / ROW_HEIGHT)));

    const x = e.clientX - rect.left;
    let targetCol = 0;
    let accum = 82;
    for (let i = 0; i < orderedColumns.length; i++) {
      const w = columnWidths[orderedColumns[i].name] ?? DEFAULT_COL_WIDTH;
      if (x < accum + w) {
        targetCol = i;
        break;
      }
      accum += w;
      targetCol = i;
    }

    // Determine direction: down or right (lock after 10px)
    if (!fillDirection) {
      const dy = Math.abs(targetRow - normalizedRange.endRow);
      const dc = Math.abs(targetCol - normalizedRange.endCol);
      if (dy > 0 || dc > 0) {
        fillDirection = dy >= dc ? 'down' : 'right';
      }
    }

    if (fillDirection === 'down') {
      fillTarget = { endRow: targetRow, endCol: normalizedRange.endCol };
    } else if (fillDirection === 'right') {
      fillTarget = { endRow: normalizedRange.endRow, endCol: targetCol };
    }
  }

  function applyFill() {
    if (!normalizedRange || !fillTarget || !editable) return;
    const nr = normalizedRange;

    if (fillDirection === 'down' && fillTarget.endRow > nr.endRow) {
      // Fill down
      for (let col = nr.startCol; col <= nr.endCol; col++) {
        const sourceValues: string[] = [];
        for (let r = nr.startRow; r <= nr.endRow; r++) {
          const origCol = originalColIndex(col);
          const cell = rows[r]?.[origCol];
          sourceValues.push(cell ? cellToString(cell) : '');
        }
        const count = fillTarget.endRow - nr.endRow;
        const filled = detectAndFill(sourceValues, count);
        for (let i = 0; i < filled.length; i++) {
          const targetRow = nr.endRow + 1 + i;
          onCellEdit?.(targetRow, originalColIndex(col), filled[i]);
        }
      }
    } else if (fillDirection === 'right' && fillTarget.endCol > nr.endCol) {
      // Fill right
      for (let row = nr.startRow; row <= nr.endRow; row++) {
        const sourceValues: string[] = [];
        for (let c = nr.startCol; c <= nr.endCol; c++) {
          const origCol = originalColIndex(c);
          const cell = rows[row]?.[origCol];
          sourceValues.push(cell ? cellToString(cell) : '');
        }
        const count = fillTarget.endCol - nr.endCol;
        const filled = detectAndFill(sourceValues, count);
        for (let i = 0; i < filled.length; i++) {
          const targetCol = nr.endCol + 1 + i;
          onCellEdit?.(row, originalColIndex(targetCol), filled[i]);
        }
      }
    }
  }

  // Fill handle position
  let fillHandleStyle = $derived.by(() => {
    if (!normalizedRange || !editable || isFillDragging) return null;
    const nr = normalizedRange;
    const x = computeColX(nr.endCol + 1) - 4; // right edge of last column
    const y = (nr.endRow + 1) * ROW_HEIGHT - 4; // bottom edge of last row
    return `left: ${x}px; top: ${y}px;`;
  });

  // Fill preview range
  let fillPreviewRange = $derived.by(() => {
    if (!isFillDragging || !normalizedRange || !fillTarget) return null;
    const nr = normalizedRange;
    if (fillDirection === 'down' && fillTarget.endRow > nr.endRow) {
      return { startRow: nr.endRow + 1, endRow: fillTarget.endRow, startCol: nr.startCol, endCol: nr.endCol };
    }
    if (fillDirection === 'right' && fillTarget.endCol > nr.endCol) {
      return { startRow: nr.startRow, endRow: nr.endRow, startCol: nr.endCol + 1, endCol: fillTarget.endCol };
    }
    return null;
  });

  function computeColX(orderedColIdx: number): number {
    let x = 82; // checkbox + row number
    for (let i = 0; i < orderedColIdx && i < orderedColumns.length; i++) {
      x += columnWidths[orderedColumns[i].name] ?? DEFAULT_COL_WIDTH;
    }
    return x;
  }

  // --- Column select ---
  function handleColumnSelect(colIndex: number, e: MouseEvent) {
    selectedRows = new Set();
    lastSelectedRow = null;

    if (e.shiftKey && activeCell) {
      // Extend column selection
      cellRange = {
        startRow: 0,
        startCol: activeCell.col,
        endRow: rows.length - 1,
        endCol: colIndex,
      };
    } else {
      activeCell = { row: 0, col: colIndex };
      cellRange = {
        startRow: 0,
        startCol: colIndex,
        endRow: rows.length - 1,
        endCol: colIndex,
      };
    }
  }

  function handleColumnContextMenu(colIndex: number, e: MouseEvent) {
    e.preventDefault();
    headerContextMenu = { x: e.clientX, y: e.clientY, colIndex };
  }

  function handleCopyColumnValues() {
    if (headerContextMenu === null) return;
    const col = headerContextMenu.colIndex;
    const values = rows.map(row => {
      const origCol = originalColIndex(col);
      return cellToString(row[origCol]);
    });
    copyToClipboard(values.join('\n'));
    headerContextMenu = null;
  }

  function handleCopyColumnWithHeader() {
    if (headerContextMenu === null) return;
    const col = headerContextMenu.colIndex;
    const header = orderedColumns[col]?.name ?? '';
    const values = rows.map(row => {
      const origCol = originalColIndex(col);
      return cellToString(row[origCol]);
    });
    copyToClipboard(header + '\n' + values.join('\n'));
    headerContextMenu = null;
  }

  function handleContextMenu(rowIndex: number, colIndex: number, e: MouseEvent) {
    e.preventDefault();
    contextMenu = {
      x: e.clientX,
      y: e.clientY,
      rowIndex: startIndex + rowIndex,
      colIndex: originalColIndex(colIndex),
    };

    if (!selectedRows.has(startIndex + rowIndex)) {
      selectedRows = new Set([startIndex + rowIndex]);
      lastSelectedRow = startIndex + rowIndex;
    }
  }

  function handleFilterToggle() {
    showFilterBar = !showFilterBar;
    if (!showFilterBar && filters.length > 0) {
      onFiltersChange?.([]);
    }
  }

  // --- Find & Replace ---
  function handleSearchNext() {
    if (searchMatches.length === 0) return;
    currentMatchIdx = (currentMatchIdx + 1) % searchMatches.length;
    scrollToMatch();
  }

  function handleSearchPrev() {
    if (searchMatches.length === 0) return;
    currentMatchIdx = (currentMatchIdx - 1 + searchMatches.length) % searchMatches.length;
    scrollToMatch();
  }

  function scrollToMatch() {
    const match = searchMatches[currentMatchIdx];
    if (!match || !scrollContainer) return;
    activeCell = { row: match.row, col: match.col };
    const targetScroll = match.row * ROW_HEIGHT - containerHeight / 2;
    scrollContainer.scrollTop = Math.max(0, targetScroll);
  }

  function handleReplace() {
    if (!editable || searchMatches.length === 0 || currentMatchIdx < 0) return;
    const match = searchMatches[currentMatchIdx];
    if (!match) return;
    onCellEdit?.(match.row, originalColIndex(match.col), replaceText);
    handleSearchNext();
  }

  function handleReplaceAll() {
    if (!editable || searchMatches.length === 0) return;
    // Apply in reverse order to avoid index shifting
    const sorted = [...searchMatches].sort((a, b) => b.row - a.row || b.col - a.col);
    for (const match of sorted) {
      const origCol = originalColIndex(match.col);
      const cell = rows[match.row]?.[origCol];
      if (!cell || isNull(cell)) continue;
      const val = extractCellValue(cell);
      const needle = caseSensitive ? searchQuery : searchQuery.toLowerCase();
      const haystack = caseSensitive ? val : val.toLowerCase();
      if (haystack.includes(needle)) {
        // Replace all occurrences in this cell
        let newVal = val;
        if (caseSensitive) {
          newVal = val.split(searchQuery).join(replaceText);
        } else {
          const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          newVal = val.replace(regex, replaceText);
        }
        onCellEdit?.(match.row, origCol, newVal);
      }
    }
  }

  // --- Copy helpers ---
  function getSelectedRowsData(): CellValue[][] {
    if (selectedRows.size === 0) return [];
    return Array.from(selectedRows).sort((a, b) => a - b).map(i => rows[i]).filter(Boolean);
  }

  function cellToString(cell: CellValue): string {
    if (isNull(cell)) return '';
    return extractCellValue(cell);
  }

  function rowToTsv(row: CellValue[]): string {
    return orderedColumns.map((col, i) => {
      const origIdx = originalColIndex(i);
      return cellToString(row[origIdx]);
    }).join('\t');
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function getCellRangeTsv(): string {
    if (!normalizedRange) return '';
    const nr = normalizedRange;
    const lines: string[] = [];
    for (let r = nr.startRow; r <= nr.endRow; r++) {
      const cells: string[] = [];
      for (let c = nr.startCol; c <= nr.endCol; c++) {
        const origCol = originalColIndex(c);
        const cell = rows[r]?.[origCol];
        cells.push(cell ? cellToString(cell) : '');
      }
      lines.push(cells.join('\t'));
    }
    return lines.join('\n');
  }

  function handleCopyCells() {
    const tsv = getCellRangeTsv();
    if (tsv) copyToClipboard(tsv);
  }

  function handleCopyCell() {
    if (!contextMenu) return;
    const cell = rows[contextMenu.rowIndex]?.[contextMenu.colIndex];
    if (cell) {
      copyToClipboard(cellToString(cell));
    }
  }

  function handleCopyRows() {
    const dataRows = getSelectedRowsData();
    if (dataRows.length === 0 && contextMenu) {
      const row = rows[contextMenu.rowIndex];
      if (row) {
        copyToClipboard(rowToTsv(row));
        return;
      }
    }
    const header = orderedColumns.map(c => c.name).join('\t');
    const body = dataRows.map(r => rowToTsv(r)).join('\n');
    copyToClipboard(header + '\n' + body);
  }

  function handleCopyAsInsert() {
    const dataRows = getSelectedRowsData();
    const targetRows = dataRows.length > 0 ? dataRows : (contextMenu ? [rows[contextMenu.rowIndex]].filter(Boolean) : []);
    if (targetRows.length === 0) return;

    const colNames = orderedColumns.map(c => `"${c.name}"`).join(', ');
    const tableName = schema && table ? `"${schema}"."${table}"` : '"table"';
    const inserts = targetRows.map(row => {
      const vals = orderedColumns.map((_, i) => {
        const origIdx = originalColIndex(i);
        const cell = row[origIdx];
        if (isNull(cell)) return 'NULL';
        const v = extractCellValue(cell);
        if (cell.type === 'Int' || cell.type === 'Float' || cell.type === 'Bool') return v;
        return `'${v.replace(/'/g, "''")}'`;
      }).join(', ');
      return `INSERT INTO ${tableName} (${colNames}) VALUES (${vals});`;
    }).join('\n');

    copyToClipboard(inserts);
  }

  function handleCopyAsJson() {
    const dataRows = getSelectedRowsData();
    const targetRows = dataRows.length > 0 ? dataRows : (contextMenu ? [rows[contextMenu.rowIndex]].filter(Boolean) : []);
    if (targetRows.length === 0) return;

    const jsonArray = targetRows.map(row => {
      const obj: Record<string, unknown> = {};
      orderedColumns.forEach((col, i) => {
        const origIdx = originalColIndex(i);
        const cell = row[origIdx];
        if (isNull(cell)) {
          obj[col.name] = null;
        } else if (cell.type === 'Bool') {
          obj[col.name] = cell.value;
        } else if (cell.type === 'Int' || cell.type === 'Float') {
          obj[col.name] = cell.value;
        } else {
          obj[col.name] = extractCellValue(cell);
        }
      });
      return obj;
    });

    copyToClipboard(JSON.stringify(jsonArray, null, 2));
  }

  function handleSetNullFromMenu() {
    if (!contextMenu) return;
    onCellSetNull?.(contextMenu.rowIndex, contextMenu.colIndex);
  }

  function handleFilterByValue() {
    if (!contextMenu) return;
    const cell = rows[contextMenu.rowIndex]?.[contextMenu.colIndex];
    const col = columns[contextMenu.colIndex];
    if (cell && col && !isNull(cell)) {
      onFilterByValue?.(col.name, extractCellValue(cell));
    }
  }

  function handleCopyAsCsv() {
    const dataRows = getSelectedRowsData();
    const targetRows = dataRows.length > 0 ? dataRows : (contextMenu ? [rows[contextMenu.rowIndex]].filter(Boolean) : []);
    if (targetRows.length === 0) return;
    copyAsCsv(orderedColumns, targetRows.map(r => reorderRow(r)));
  }

  function handleCopyAsMarkdown() {
    const dataRows = getSelectedRowsData();
    const targetRows = dataRows.length > 0 ? dataRows : (contextMenu ? [rows[contextMenu.rowIndex]].filter(Boolean) : []);
    if (targetRows.length === 0) return;
    copyAsMarkdown(orderedColumns, targetRows.map(r => reorderRow(r)));
  }

  // --- Paste ---
  async function handlePaste() {
    if (!editable || !activeCell) return;
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      const parsed = parseClipboardText(text);
      if (parsed.length === 0) return;

      if (onPaste) {
        onPaste(activeCell.row, originalColIndex(activeCell.col), parsed);
      } else {
        // Default: apply edits directly
        for (let r = 0; r < parsed.length; r++) {
          const targetRow = activeCell.row + r;
          if (targetRow >= rows.length) break;
          for (let c = 0; c < parsed[r].length; c++) {
            const targetCol = activeCell.col + c;
            if (targetCol >= orderedColumns.length) break;
            onCellEdit?.(targetRow, originalColIndex(targetCol), parsed[r][c]);
          }
        }
      }

      // Update selection to cover pasted area
      cellRange = {
        startRow: activeCell.row,
        startCol: activeCell.col,
        endRow: Math.min(activeCell.row + parsed.length - 1, rows.length - 1),
        endCol: Math.min(activeCell.col + (parsed[0]?.length ?? 1) - 1, orderedColumns.length - 1),
      };
    } catch {
      // Clipboard access denied — ignore
    }
  }

  // --- Keyboard handler ---
  function handleKeydown(e: KeyboardEvent) {
    // Find / Replace
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      showFindBar = true;
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      e.preventDefault();
      showFindBar = true;
      showReplace = true;
      return;
    }

    // Escape closes find bar or clears selection
    if (e.key === 'Escape') {
      if (showFindBar) {
        showFindBar = false;
        showReplace = false;
        searchQuery = '';
        searchMatches = [];
        return;
      }
      activeCell = null;
      cellRange = null;
      return;
    }

    // Ctrl+C: copy cells if range active, else rows
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      if (normalizedRange) {
        e.preventDefault();
        handleCopyCells();
        return;
      }
      if (selectedRows.size > 0) {
        e.preventDefault();
        const header = orderedColumns.map(c => c.name).join('\t');
        const body = getSelectedRowsData().map(r => rowToTsv(r)).join('\n');
        copyToClipboard(header + '\n' + body);
        return;
      }
    }

    // Ctrl+V: paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      if (editable && activeCell) {
        e.preventDefault();
        handlePaste();
        return;
      }
    }

    // Arrow key navigation
    if (activeCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const { row, col } = activeCell;
      let newRow = row;
      let newCol = col;

      if (e.key === 'ArrowUp') newRow = Math.max(0, row - 1);
      if (e.key === 'ArrowDown') newRow = Math.min(rows.length - 1, row + 1);
      if (e.key === 'ArrowLeft') newCol = Math.max(0, col - 1);
      if (e.key === 'ArrowRight') newCol = Math.min(orderedColumns.length - 1, col + 1);

      if (e.shiftKey) {
        // Extend range
        cellRange = {
          startRow: cellRange?.startRow ?? row,
          startCol: cellRange?.startCol ?? col,
          endRow: newRow,
          endCol: newCol,
        };
      } else {
        activeCell = { row: newRow, col: newCol };
        cellRange = { startRow: newRow, startCol: newCol, endRow: newRow, endCol: newCol };
      }
      activeCell = { row: newRow, col: newCol };

      // Scroll into view
      if (scrollContainer) {
        const targetY = newRow * ROW_HEIGHT;
        if (targetY < scrollContainer.scrollTop) {
          scrollContainer.scrollTop = targetY;
        } else if (targetY + ROW_HEIGHT > scrollContainer.scrollTop + containerHeight) {
          scrollContainer.scrollTop = targetY + ROW_HEIGHT - containerHeight;
        }
      }
      return;
    }

    // Enter: move active cell down
    if (e.key === 'Enter' && activeCell) {
      e.preventDefault();
      const newRow = Math.min(rows.length - 1, activeCell.row + 1);
      activeCell = { row: newRow, col: activeCell.col };
      cellRange = { startRow: newRow, startCol: activeCell.col, endRow: newRow, endCol: activeCell.col };
      return;
    }

    // Tab: move active cell right
    if (e.key === 'Tab' && activeCell) {
      e.preventDefault();
      const newCol = e.shiftKey
        ? Math.max(0, activeCell.col - 1)
        : Math.min(orderedColumns.length - 1, activeCell.col + 1);
      activeCell = { row: activeCell.row, col: newCol };
      cellRange = { startRow: activeCell.row, startCol: newCol, endRow: activeCell.row, endCol: newCol };
      return;
    }
  }

  // Helper: get cell selection columns for a given absolute row
  function getCellSelectionCols(absoluteRow: number): { start: number; end: number } | null {
    if (!normalizedRange) return null;
    if (absoluteRow < normalizedRange.startRow || absoluteRow > normalizedRange.endRow) return null;
    return { start: normalizedRange.startCol, end: normalizedRange.endCol };
  }

  // Helper: get fill preview columns for a given absolute row
  function getFillPreviewCols(absoluteRow: number): { start: number; end: number } | null {
    if (!fillPreviewRange) return null;
    if (absoluteRow < fillPreviewRange.startRow || absoluteRow > fillPreviewRange.endRow) return null;
    return { start: fillPreviewRange.startCol, end: fillPreviewRange.endCol };
  }

  // Footer info
  let cellSelectionInfo = $derived.by(() => {
    if (!normalizedRange) return '';
    const nr = normalizedRange;
    const rowCount = nr.endRow - nr.startRow + 1;
    const colCount = nr.endCol - nr.startCol + 1;
    if (rowCount === 1 && colCount === 1) return '';
    return `${rowCount}\u00d7${colCount} cells`;
  });
</script>

<svelte:window
  onresize={handleResize}
  onmousemove={(e) => { if (isDragging) handleGridMouseMove(e); if (isFillDragging) handleFillMouseMove(e); }}
  onmouseup={handleGridMouseUp}
  onmousedown={(e) => {
    if (headerContextMenu) {
      const el = document.querySelector('.header-context-menu');
      if (el && !el.contains(e.target as Node)) headerContextMenu = null;
    }
  }}
/>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="data-grid" bind:this={gridWrapper} onkeydown={handleKeydown} tabindex="0">
  {#if columns.length === 0}
    <div class="empty-state">
      <span class="text-muted">No results</span>
    </div>
  {:else}
    <div class="grid-header-wrapper">
      <GridHeader
        columns={orderedColumns}
        {columnWidths}
        {sortColumns}
        showSelectAll={editable || true}
        {allSelected}
        {someSelected}
        onResize={handleColumnResize}
        onSort={onSort}
        onSelectAll={handleSelectAll}
        onFilterToggle={onFiltersChange ? handleFilterToggle : undefined}
        {showFilterBar}
        onReorder={handleReorder}
        onColumnSelect={handleColumnSelect}
        onColumnContextMenu={handleColumnContextMenu}
      />
    </div>
    {#if showFindBar}
      <FindReplaceBar
        query={searchQuery}
        {replaceText}
        matchCount={searchMatches.length}
        currentMatchIndex={currentMatchIdx}
        {showReplace}
        {caseSensitive}
        editable={editable}
        onQueryChange={(q) => { searchQuery = q; }}
        onReplaceTextChange={(t) => { replaceText = t; }}
        onNext={handleSearchNext}
        onPrev={handleSearchPrev}
        onReplace={handleReplace}
        onReplaceAll={handleReplaceAll}
        onToggleCaseSensitive={() => { caseSensitive = !caseSensitive; }}
        onToggleReplace={() => { showReplace = !showReplace; }}
        onClose={() => { showFindBar = false; showReplace = false; searchQuery = ''; searchMatches = []; }}
      />
    {/if}
    {#if showFilterBar}
      <FilterBar
        columns={orderedColumns}
        {columnWidths}
        {filters}
        showCheckbox={true}
        onFiltersChange={onFiltersChange}
      />
    {/if}
    <div
      class="grid-body"
      bind:this={scrollContainer}
      onscroll={handleScroll}
      ondblclick={handleGridDblClick}
    >
      <div class="virtual-spacer" style="height: {totalHeight}px; position: relative;">
        <div class="virtual-rows" style="transform: translateY({offsetY}px);">
          {#each visibleRows as row, i}
            {@const absoluteIndex = startIndex + i}
            {@const selCols = getCellSelectionCols(absoluteIndex)}
            {@const fillCols = getFillPreviewCols(absoluteIndex)}
            {@const combinedSelCols = selCols && fillCols
              ? { start: Math.min(selCols.start, fillCols.start), end: Math.max(selCols.end, fillCols.end) }
              : selCols ?? fillCols}
            <GridRow
              row={reorderRow(row)}
              columns={orderedColumns}
              {columnWidths}
              rowIndex={absoluteIndex}
              {editable}
              selected={selectedRows.has(absoluteIndex)}
              showCheckbox={true}
              isDeleted={deletedRows?.has(absoluteIndex) ?? false}
              modifiedCells={modifiedCells?.get(absoluteIndex)}
              cellSelectionCols={combinedSelCols}
              activeCellCol={activeCell?.row === absoluteIndex ? activeCell.col : null}
              searchMatchCols={searchMatchesByRow.get(absoluteIndex) ?? null}
              currentMatchCol={currentMatch?.row === absoluteIndex ? currentMatch.col : null}
              foreignKeys={fkMap}
              connectionId={connectionId}
              onCellEdit={(colIndex, value) => handleCellEdit(i, colIndex, value)}
              onCellSetNull={(colIndex) => handleCellSetNull(i, colIndex)}
              onSelect={handleRowSelect}
              onContextMenu={(rowIdx, colIdx, e) => handleContextMenu(i, colIdx, e)}
              onExpandCell={onExpandCell ? (colIndex) => handleExpandCell(i, colIndex) : undefined}
              onCellMouseDown={(colIndex, e) => handleCellMouseDown(i, colIndex, e)}
            />
          {/each}
        </div>
        {#if fillHandleStyle && normalizedRange}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="fill-handle"
            style={fillHandleStyle}
            onmousedown={handleFillHandleMouseDown}
          ></div>
        {/if}
      </div>
    </div>
    <div class="grid-footer">
      <span class="row-info">{rows.length} row{rows.length !== 1 ? 's' : ''}</span>
      {#if selectedRows.size > 0}
        <span class="selection-info">{selectedRows.size} selected</span>
      {/if}
      {#if cellSelectionInfo}
        <span class="selection-info">{cellSelectionInfo}</span>
      {/if}
      {#if searchMatches.length > 0}
        <span class="search-info">{searchMatches.length} match{searchMatches.length !== 1 ? 'es' : ''}</span>
      {/if}
    </div>
  {/if}

  {#if contextMenu}
    {@const ctxRow = rows[contextMenu.rowIndex]}
    {@const ctxCell = ctxRow?.[contextMenu.colIndex]}
    {@const ctxCol = columns[contextMenu.colIndex]}
    {#if ctxRow && ctxCell && ctxCol}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        cell={ctxCell}
        column={ctxCol}
        row={ctxRow}
        columns={orderedColumns}
        {schema}
        {table}
        selectedRows={getSelectedRowsData()}
        {editable}
        hasCellRange={normalizedRange !== null && (normalizedRange.endRow > normalizedRange.startRow || normalizedRange.endCol > normalizedRange.startCol)}
        onClose={() => { contextMenu = null; }}
        onCopyCell={handleCopyCell}
        onCopyCells={handleCopyCells}
        onCopyRows={handleCopyRows}
        onCopyAsInsert={handleCopyAsInsert}
        onCopyAsJson={handleCopyAsJson}
        onCopyAsCsv={handleCopyAsCsv}
        onCopyAsMarkdown={handleCopyAsMarkdown}
        onSetNull={editable ? handleSetNullFromMenu : undefined}
        onFilterByValue={onFilterByValue ? handleFilterByValue : undefined}
      />
    {/if}
  {/if}

  {#if headerContextMenu}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="header-context-menu"
      style="left: {headerContextMenu.x}px; top: {headerContextMenu.y}px;"
    >
      <button class="menu-item" onclick={handleCopyColumnValues}>
        <span class="menu-label">Copy column values</span>
      </button>
      <button class="menu-item" onclick={handleCopyColumnWithHeader}>
        <span class="menu-label">Copy column with header</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .data-grid {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: var(--bg-primary);
    outline: none;
  }

  .grid-header-wrapper {
    flex-shrink: 0;
    overflow: hidden;
  }

  .grid-body {
    flex: 1;
    overflow: auto;
  }

  .virtual-spacer {
    width: 100%;
  }

  .virtual-rows {
    width: 100%;
  }

  .grid-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 12px;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .row-info {
    font-size: 10px;
    color: var(--text-muted);
    font-family: var(--font-mono);
    letter-spacing: 0.3px;
  }

  .selection-info {
    font-size: 10px;
    color: var(--accent);
    font-family: var(--font-mono);
    letter-spacing: 0.3px;
  }

  .search-info {
    font-size: 10px;
    color: rgba(255, 200, 50, 0.9);
    font-family: var(--font-mono);
    letter-spacing: 0.3px;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 13px;
  }

  .fill-handle {
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--accent);
    border: 1px solid var(--bg-primary);
    cursor: crosshair;
    z-index: 5;
    border-radius: 1px;
  }

  .fill-handle:hover {
    background: var(--accent-hover, #5d8cf6);
  }

  .header-context-menu {
    position: fixed;
    z-index: 10000;
    min-width: 180px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md, 6px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    padding: 4px 0;
  }

  .header-context-menu .menu-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 6px 12px;
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    text-align: left;
    font-size: 12px;
  }

  .header-context-menu .menu-item:hover {
    background: var(--bg-hover);
  }

  .header-context-menu .menu-label {
    white-space: nowrap;
  }
</style>
