export type CellValue =
  | { type: 'Null' }
  | { type: 'Bool'; value: boolean }
  | { type: 'Int'; value: number }
  | { type: 'Float'; value: number }
  | { type: 'Text'; value: string }
  | { type: 'Timestamp'; value: string }
  | { type: 'Binary'; value: number[] }
  | { type: 'Json'; value: string };

export interface ColumnDef {
  name: string;
  data_type: string;
}

export interface QueryResponse {
  columns: ColumnDef[];
  rows: CellValue[][];
  row_count: number;
  execution_time_ms: number;
  affected_rows: number | null;
}
