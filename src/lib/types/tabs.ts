export type TabType = 'query' | 'table';

export interface Tab {
  id: string;
  type: TabType;
  title: string;
  connectionId: string;
  // For query tabs
  sql?: string;
  // For table tabs
  schema?: string;
  table?: string;
}
