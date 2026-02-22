import { load, type Store } from '@tauri-apps/plugin-store';
import { DEFAULT_SHORTCUTS } from '$lib/types/shortcuts';

export type Theme = 'dark' | 'light';

class SettingsStore {
  theme = $state<Theme>('dark');
  shortcutOverrides = $state<Record<string, string>>({});
  private store: Store | null = null;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    this.store = await load('settings.json');
    const savedTheme = await this.store.get<Theme>('theme');
    if (savedTheme) {
      this.theme = savedTheme;
    }
    const savedShortcuts = await this.store.get<Record<string, string>>('shortcutOverrides');
    if (savedShortcuts) {
      this.shortcutOverrides = savedShortcuts;
    }
    this.applyTheme();
    this.initialized = true;
  }

  private async persist() {
    if (this.store) {
      await this.store.set('theme', this.theme);
      await this.store.set('shortcutOverrides', this.shortcutOverrides);
      await this.store.save();
    }
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  setTheme(theme: Theme) {
    this.theme = theme;
    this.applyTheme();
    this.persist();
  }

  toggleTheme() {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  getBinding(actionId: string): string {
    if (this.shortcutOverrides[actionId]) {
      return this.shortcutOverrides[actionId];
    }
    const action = DEFAULT_SHORTCUTS.find(s => s.id === actionId);
    return action?.defaultKey ?? '';
  }

  setShortcut(actionId: string, key: string) {
    this.shortcutOverrides = { ...this.shortcutOverrides, [actionId]: key };
    this.persist();
  }

  resetShortcut(actionId: string) {
    const { [actionId]: _, ...rest } = this.shortcutOverrides;
    this.shortcutOverrides = rest;
    this.persist();
  }

  resetAllShortcuts() {
    this.shortcutOverrides = {};
    this.persist();
  }

  /** Convert a KeyboardEvent to a normalized key string like "Ctrl+Shift+K" */
  private eventToKeyString(e: KeyboardEvent): string {
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');

    let key = e.key;
    // Normalize key names
    if (key === ' ') key = 'Space';
    else if (key === 'ArrowUp') key = 'Up';
    else if (key === 'ArrowDown') key = 'Down';
    else if (key === 'ArrowLeft') key = 'Left';
    else if (key === 'ArrowRight') key = 'Right';
    else if (key === 'Enter') key = 'Enter';
    else if (key === 'Tab') key = 'Tab';
    else if (key === 'Escape') key = 'Escape';
    else if (key.length === 1) key = key.toUpperCase();

    // Don't add modifier-only keys
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) return '';

    parts.push(key);
    return parts.join('+');
  }

  /** Match a KeyboardEvent against all bindings, return action ID or null */
  matchEvent(e: KeyboardEvent): string | null {
    const keyStr = this.eventToKeyString(e);
    if (!keyStr) return null;

    for (const action of DEFAULT_SHORTCUTS) {
      const binding = this.getBinding(action.id);
      if (binding === keyStr) {
        return action.id;
      }
    }
    return null;
  }

  /** Convert a KeyboardEvent to a display string for recording shortcuts */
  eventToDisplayString(e: KeyboardEvent): string {
    return this.eventToKeyString(e);
  }
}

export const settingsStore = new SettingsStore();
