import { load, type Store } from '@tauri-apps/plugin-store';

class FavoritesStore {
  favorites = $state<Record<string, string[]>>({});
  private store: Store | null = null;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    this.store = await load('favorites.json');
    const saved = await this.store.get<Record<string, string[]>>('favorites');
    if (saved) {
      this.favorites = saved;
    }
    this.initialized = true;
  }

  private async persist() {
    if (this.store) {
      await this.store.set('favorites', this.favorites);
      await this.store.save();
    }
  }

  private getKey(schema: string, table: string): string {
    return `${schema}.${table}`;
  }

  toggle(connectionId: string, schema: string, table: string) {
    const key = this.getKey(schema, table);
    const list = this.favorites[connectionId] ?? [];
    if (list.includes(key)) {
      this.favorites = {
        ...this.favorites,
        [connectionId]: list.filter(k => k !== key),
      };
    } else {
      this.favorites = {
        ...this.favorites,
        [connectionId]: [...list, key],
      };
    }
    this.persist();
  }

  isFavorite(connectionId: string, schema: string, table: string): boolean {
    const key = this.getKey(schema, table);
    return (this.favorites[connectionId] ?? []).includes(key);
  }

  getFavorites(connectionId: string): string[] {
    return this.favorites[connectionId] ?? [];
  }

  removeFavorite(connectionId: string, key: string) {
    const list = this.favorites[connectionId] ?? [];
    this.favorites = {
      ...this.favorites,
      [connectionId]: list.filter(k => k !== key),
    };
    this.persist();
  }
}

export const favoritesStore = new FavoritesStore();
