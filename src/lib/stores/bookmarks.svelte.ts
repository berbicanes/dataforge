import { load, type Store } from '@tauri-apps/plugin-store';
import { v4 as uuidv4 } from 'uuid';
import type { ResultBookmark, ColumnDef, CellValue } from '$lib/types/query';

const MAX_BOOKMARKS = 50;

class BookmarksStore {
  bookmarks = $state<ResultBookmark[]>([]);
  private store: Store | null = null;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    this.store = await load('bookmarks.json');
    const saved = await this.store.get<ResultBookmark[]>('bookmarks');
    if (saved) {
      this.bookmarks = saved;
    }
    this.initialized = true;
  }

  private async persist() {
    if (this.store) {
      await this.store.set('bookmarks', this.bookmarks);
      await this.store.save();
    }
  }

  save(bookmark: {
    name: string;
    connectionId: string;
    sql: string;
    columns: ColumnDef[];
    rows: CellValue[][];
    rowCount: number;
    executionTimeMs: number;
  }): ResultBookmark {
    const newBookmark: ResultBookmark = {
      id: uuidv4(),
      createdAt: Date.now(),
      ...bookmark,
    };
    this.bookmarks = [newBookmark, ...this.bookmarks].slice(0, MAX_BOOKMARKS);
    this.persist();
    return newBookmark;
  }

  remove(id: string) {
    this.bookmarks = this.bookmarks.filter(b => b.id !== id);
    this.persist();
  }

  rename(id: string, name: string) {
    const bookmark = this.bookmarks.find(b => b.id === id);
    if (bookmark) {
      bookmark.name = name;
      this.bookmarks = [...this.bookmarks];
      this.persist();
    }
  }

  getById(id: string): ResultBookmark | undefined {
    return this.bookmarks.find(b => b.id === id);
  }

  getByConnection(connectionId: string): ResultBookmark[] {
    return this.bookmarks.filter(b => b.connectionId === connectionId);
  }
}

export const bookmarksStore = new BookmarksStore();
