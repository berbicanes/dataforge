import { load, type Store } from '@tauri-apps/plugin-store';
import { v4 as uuidv4 } from 'uuid';
import type { QuerySnippet } from '$lib/types/query';

class SnippetsStore {
  snippets = $state<QuerySnippet[]>([]);
  private store: Store | null = null;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    this.store = await load('snippets.json');
    const saved = await this.store.get<QuerySnippet[]>('snippets');
    if (saved) {
      this.snippets = saved;
    }
    this.initialized = true;
  }

  private async persist() {
    if (this.store) {
      await this.store.set('snippets', this.snippets);
      await this.store.save();
    }
  }

  save(snippet: Omit<QuerySnippet, 'id' | 'createdAt' | 'updatedAt'>) {
    const newSnippet: QuerySnippet = {
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...snippet,
    };
    this.snippets = [newSnippet, ...this.snippets];
    this.persist();
    return newSnippet;
  }

  remove(id: string) {
    this.snippets = this.snippets.filter(s => s.id !== id);
    this.persist();
  }

  update(id: string, changes: Partial<Omit<QuerySnippet, 'id' | 'createdAt'>>) {
    const snippet = this.snippets.find(s => s.id === id);
    if (snippet) {
      Object.assign(snippet, changes, { updatedAt: Date.now() });
      this.snippets = [...this.snippets];
      this.persist();
    }
  }

  getByConnection(connectionId: string): QuerySnippet[] {
    return this.snippets.filter(s => s.connectionId === connectionId);
  }

  getGlobal(): QuerySnippet[] {
    return this.snippets.filter(s => !s.connectionId);
  }
}

export const snippetsStore = new SnippetsStore();
