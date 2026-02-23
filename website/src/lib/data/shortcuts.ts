export interface Shortcut {
  label: string;
  key: string;
  category: 'General' | 'Tabs' | 'Editor';
}

export const shortcuts: Shortcut[] = [
  { label: 'New Query Tab', key: 'Ctrl+N', category: 'General' },
  { label: 'Command Palette', key: 'Ctrl+P', category: 'General' },
  { label: 'Toggle Sidebar', key: 'Ctrl+B', category: 'General' },
  { label: 'Refresh Schema', key: 'F5', category: 'General' },
  { label: 'Toggle Theme', key: 'Ctrl+Shift+T', category: 'General' },
  { label: 'Keyboard Shortcuts', key: 'Ctrl+K', category: 'General' },
  { label: 'Close Tab', key: 'Ctrl+W', category: 'Tabs' },
  { label: 'Next Tab', key: 'Ctrl+Tab', category: 'Tabs' },
  { label: 'Previous Tab', key: 'Ctrl+Shift+Tab', category: 'Tabs' },
  { label: 'Run Query', key: 'Ctrl+Enter', category: 'Editor' },
  { label: 'Format SQL', key: 'Ctrl+Shift+F', category: 'Editor' },
  { label: 'Save Query', key: 'Ctrl+S', category: 'Editor' },
];

export const shortcutCategories = ['General', 'Tabs', 'Editor'] as const;
