import * as tauri from '$lib/services/tauri';
import type { QueryResponse } from '$lib/types/query';
import { uiStore } from '$lib/stores/ui.svelte';

export async function executeQuery(connectionId: string, sql: string): Promise<QueryResponse | null> {
  uiStore.setLoading(true, 'Executing query...');
  try {
    const result = await tauri.executeQuery(connectionId, sql.trim());
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    uiStore.showError(`Query error: ${message}`);
    return null;
  } finally {
    uiStore.setLoading(false);
  }
}
