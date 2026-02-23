export interface WorkspaceProfile {
  id: string;
  name: string;
  connectionId: string | null;
  tabs: SerializedTab[];
  activeTabId: string | null;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  createdAt: number;
  updatedAt: number;
}

export interface SerializedTab {
  type: string;
  title: string;
  connectionId: string;
  pinned?: boolean;
  sql?: string;
  schema?: string;
  table?: string;
  container?: string;
  item?: string;
}
