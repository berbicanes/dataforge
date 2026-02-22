<script lang="ts">
  import { schemaStore } from '$lib/stores/schema.svelte';
  import { tabStore } from '$lib/stores/tabs.svelte';
  import { connectionStore } from '$lib/stores/connections.svelte';
  import * as schemaService from '$lib/services/schemaService';
  import type { SchemaInfo, TableInfo, ColumnInfo } from '$lib/types/schema';
  import TreeNode from './TreeNode.svelte';

  let { connectionId }: { connectionId: string } = $props();

  let schemas = $derived(schemaStore.getSchemas(connectionId));

  // Track expanded state per schema/table
  let expandedSchemas = $state<Set<string>>(new Set());
  let expandedTables = $state<Set<string>>(new Set());

  async function handleSchemaExpand(schema: SchemaInfo, expanded: boolean) {
    if (expanded) {
      expandedSchemas.add(schema.name);
      const tables = schemaStore.getTables(connectionId, schema.name);
      if (tables.length === 0) {
        await schemaService.loadTables(connectionId, schema.name);
      }
    } else {
      expandedSchemas.delete(schema.name);
    }
  }

  async function handleTableExpand(schema: string, table: string, expanded: boolean) {
    const key = `${schema}.${table}`;
    if (expanded) {
      expandedTables.add(key);
      const cols = schemaStore.getColumns(connectionId, schema, table);
      if (cols.length === 0) {
        await schemaService.loadColumns(connectionId, schema, table);
      }
    } else {
      expandedTables.delete(key);
    }
  }

  function handleTableDblClick(schema: string, table: string) {
    tabStore.openTab({
      type: 'table',
      title: table,
      connectionId,
      schema,
      table
    });
  }

  function getTables(schemaName: string): TableInfo[] {
    return schemaStore.getTables(connectionId, schemaName);
  }

  function getColumns(schemaName: string, tableName: string): ColumnInfo[] {
    return schemaStore.getColumns(connectionId, schemaName, tableName);
  }

  const ICON_FOLDER = '\u{1F4C1}';
  const ICON_TABLE = '\u{1F5C3}';
  const ICON_KEY = '\u{1F511}';

  function getColumnTypeIcon(dataType: string): string {
    const t = dataType.toLowerCase();
    if (t.includes('int') || t.includes('serial') || t.includes('numeric') || t.includes('decimal') || t.includes('float') || t.includes('double') || t.includes('real')) return '#';
    if (t.includes('bool')) return '?';
    if (t.includes('date') || t.includes('time') || t.includes('timestamp')) return '\u{1F552}';
    if (t.includes('json') || t.includes('jsonb')) return '{}';
    if (t.includes('bytea') || t.includes('blob') || t.includes('binary')) return '\u{1F4BE}';
    return 'T';
  }
</script>

<div class="schema-tree">
  {#if schemas.length === 0}
    <div class="empty-schemas">
      <span class="text-muted">No schemas loaded</span>
    </div>
  {:else}
    {#each schemas as schema}
      <TreeNode
        label={schema.name}
        icon={ICON_FOLDER}
        expandable={true}
        depth={0}
        onexpand={(exp) => handleSchemaExpand(schema, exp)}
      >
        {#snippet children()}
          {#each getTables(schema.name) as table}
            <TreeNode
              label={table.name}
              icon={ICON_TABLE}
              expandable={true}
              depth={1}
              onexpand={(exp) => handleTableExpand(schema.name, table.name, exp)}
              ondblclick={() => handleTableDblClick(schema.name, table.name)}
            >
              {#snippet children()}
                {#each getColumns(schema.name, table.name) as column}
                  <TreeNode
                    label={column.name}
                    icon={column.is_primary_key ? ICON_KEY : getColumnTypeIcon(column.data_type)}
                    expandable={false}
                    depth={2}
                  >
                    {#snippet children()}
                      <!-- leaf node, no children -->
                    {/snippet}
                  </TreeNode>
                {/each}
              {/snippet}
            </TreeNode>
          {/each}
        {/snippet}
      </TreeNode>
    {/each}
  {/if}
</div>

<style>
  .schema-tree {
    padding: 2px 0;
  }

  .empty-schemas {
    padding: 12px 16px;
    text-align: center;
    font-size: 11px;
  }
</style>
