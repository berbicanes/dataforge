import { load, type Store } from '@tauri-apps/plugin-store';
import { v4 as uuidv4 } from 'uuid';
import type { WorkspaceProfile, SerializedTab } from '$lib/types/workspace';
import { connectionStore } from './connections.svelte';
import { tabStore } from './tabs.svelte';
import { uiStore } from './ui.svelte';

class WorkspacesStore {
  profiles = $state<WorkspaceProfile[]>([]);
  private store: Store | null = null;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    this.store = await load('workspaces.json');
    const saved = await this.store.get<WorkspaceProfile[]>('profiles');
    if (saved) {
      this.profiles = saved;
    }
    this.initialized = true;
  }

  private async persist() {
    if (this.store) {
      await this.store.set('profiles', this.profiles);
      await this.store.save();
    }
  }

  private serializeTabs(): SerializedTab[] {
    return tabStore.tabs.map(tab => ({
      type: tab.type,
      title: tab.title,
      connectionId: tab.connectionId,
      pinned: tab.pinned,
      sql: tab.sql,
      schema: tab.schema,
      table: tab.table,
      container: tab.container,
      item: tab.item,
    }));
  }

  saveCurrentState(name: string): WorkspaceProfile {
    const profile: WorkspaceProfile = {
      id: uuidv4(),
      name,
      connectionId: connectionStore.activeConnectionId,
      tabs: this.serializeTabs(),
      activeTabId: tabStore.activeTabId,
      sidebarCollapsed: uiStore.sidebarCollapsed,
      sidebarWidth: uiStore.sidebarWidth,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.profiles = [profile, ...this.profiles];
    this.persist();
    return profile;
  }

  restore(id: string) {
    const profile = this.profiles.find(p => p.id === id);
    if (!profile) return;

    // Close all current tabs
    const tabIds = tabStore.tabs.map(t => t.id);
    for (const tabId of tabIds) {
      tabStore.closeTab(tabId);
    }

    // Restore sidebar state
    uiStore.sidebarCollapsed = profile.sidebarCollapsed;
    uiStore.sidebarWidth = profile.sidebarWidth;

    // Restore connection
    if (profile.connectionId) {
      connectionStore.setActive(profile.connectionId);
    }

    // Restore tabs
    for (const serialized of profile.tabs) {
      tabStore.openTab({
        type: serialized.type as any,
        title: serialized.title,
        connectionId: serialized.connectionId,
        pinned: serialized.pinned,
        sql: serialized.sql,
        schema: serialized.schema,
        table: serialized.table,
        container: serialized.container,
        item: serialized.item,
      });
    }
  }

  update(id: string) {
    const profile = this.profiles.find(p => p.id === id);
    if (!profile) return;
    profile.connectionId = connectionStore.activeConnectionId;
    profile.tabs = this.serializeTabs();
    profile.activeTabId = tabStore.activeTabId;
    profile.sidebarCollapsed = uiStore.sidebarCollapsed;
    profile.sidebarWidth = uiStore.sidebarWidth;
    profile.updatedAt = Date.now();
    this.profiles = [...this.profiles];
    this.persist();
  }

  remove(id: string) {
    this.profiles = this.profiles.filter(p => p.id !== id);
    this.persist();
  }

  rename(id: string, name: string) {
    const profile = this.profiles.find(p => p.id === id);
    if (profile) {
      profile.name = name;
      profile.updatedAt = Date.now();
      this.profiles = [...this.profiles];
      this.persist();
    }
  }

  getAll(): WorkspaceProfile[] {
    return this.profiles;
  }
}

export const workspacesStore = new WorkspacesStore();
