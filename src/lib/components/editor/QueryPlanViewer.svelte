<script lang="ts">
  import type { QueryResponse } from '$lib/types/query';
  import { extractCellValue } from '$lib/utils/formatters';

  let { planData, dialect }: {
    planData: QueryResponse;
    dialect: string;
  } = $props();

  let showRaw = $state(false);

  interface PlanNode {
    type: string;
    relation?: string;
    cost?: number;
    rows?: number;
    actualTime?: number;
    width?: number;
    children: PlanNode[];
    extra: Record<string, string>;
  }

  let planTree = $derived.by(() => {
    try {
      return parsePlan(planData, dialect);
    } catch {
      return null;
    }
  });

  let rawText = $derived.by(() => {
    if (!planData.rows.length) return '';
    return planData.rows.map(row => row.map(c => extractCellValue(c)).join('\t')).join('\n');
  });

  let maxCost = $derived.by(() => {
    if (!planTree) return 1;
    return getMaxCost(planTree);
  });

  function parsePlan(data: QueryResponse, dbDialect: string): PlanNode | null {
    if (!data.rows.length) return null;

    // PostgreSQL / MySQL: JSON EXPLAIN
    const firstCell = extractCellValue(data.rows[0][0]);
    if (firstCell.startsWith('[') || firstCell.startsWith('{')) {
      try {
        const json = JSON.parse(firstCell);
        if (dbDialect === 'MySQL' || dbDialect === 'MariaDB') {
          return parseMySqlJsonPlan(json);
        }
        // PostgreSQL EXPLAIN (FORMAT JSON)
        const plan = Array.isArray(json) ? json[0]?.Plan ?? json[0] : json?.Plan ?? json;
        return parsePgJsonNode(plan);
      } catch {
        return null;
      }
    }

    // SQLite: EXPLAIN QUERY PLAN returns (id, parent, unused, detail) rows
    if (dbDialect === 'SQLite' && data.columns.length >= 3) {
      return parseSQLitePlan(data);
    }

    return null;
  }

  function parsePgJsonNode(node: Record<string, unknown>): PlanNode {
    const children: PlanNode[] = [];
    if (Array.isArray(node.Plans)) {
      for (const child of node.Plans) {
        children.push(parsePgJsonNode(child as Record<string, unknown>));
      }
    }

    const extra: Record<string, string> = {};
    const skip = new Set(['Node Type', 'Relation Name', 'Total Cost', 'Plan Rows',
      'Actual Total Time', 'Plan Width', 'Plans', 'Startup Cost', 'Actual Startup Time',
      'Actual Rows', 'Actual Loops']);

    for (const [k, v] of Object.entries(node)) {
      if (!skip.has(k) && v !== undefined && v !== null) {
        extra[k] = String(v);
      }
    }

    return {
      type: String(node['Node Type'] ?? 'Unknown'),
      relation: node['Relation Name'] as string | undefined,
      cost: node['Total Cost'] as number | undefined,
      rows: (node['Actual Rows'] ?? node['Plan Rows']) as number | undefined,
      actualTime: node['Actual Total Time'] as number | undefined,
      width: node['Plan Width'] as number | undefined,
      children,
      extra,
    };
  }

  function parseMySqlJsonPlan(json: Record<string, unknown>): PlanNode {
    const qb = json.query_block as Record<string, unknown> | undefined;
    if (!qb) return { type: 'Query', children: [], extra: {} };

    const children: PlanNode[] = [];
    const nested = qb.nested_loop as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(nested)) {
      for (const item of nested) {
        const tbl = item.table as Record<string, unknown> | undefined;
        if (tbl) {
          children.push({
            type: String(tbl.access_type ?? 'scan'),
            relation: String(tbl.table_name ?? ''),
            rows: tbl.rows_examined_per_scan as number | undefined,
            cost: tbl.read_cost ? Number(tbl.read_cost) : undefined,
            children: [],
            extra: { key: String(tbl.key ?? 'none'), used_columns: String(tbl.used_columns ?? '') },
          });
        }
      }
    }

    return {
      type: 'Query Block',
      cost: qb.cost_info ? Number((qb.cost_info as Record<string, unknown>).query_cost) : undefined,
      children,
      extra: {},
    };
  }

  function parseSQLitePlan(data: QueryResponse): PlanNode {
    const root: PlanNode = { type: 'Query Plan', children: [], extra: {} };
    const nodeMap = new Map<number, PlanNode>();
    nodeMap.set(-1, root);

    for (const row of data.rows) {
      const id = Number(extractCellValue(row[0]));
      const parent = Number(extractCellValue(row[1]));
      const detail = extractCellValue(row[row.length - 1]);

      const node: PlanNode = { type: detail, children: [], extra: {} };
      nodeMap.set(id, node);
      const parentNode = nodeMap.get(parent) ?? root;
      parentNode.children.push(node);
    }

    return root;
  }

  function getMaxCost(node: PlanNode): number {
    let max = node.cost ?? 0;
    for (const child of node.children) {
      max = Math.max(max, getMaxCost(child));
    }
    return max || 1;
  }

  function costPercent(cost: number | undefined): number {
    if (!cost || !maxCost) return 0;
    return Math.round((cost / maxCost) * 100);
  }

  function isExpensive(cost: number | undefined): boolean {
    return costPercent(cost) > 60;
  }
</script>

<div class="plan-viewer">
  <div class="plan-toolbar">
    <button class="plan-toggle" class:active={!showRaw} onclick={() => showRaw = false}>Tree</button>
    <button class="plan-toggle" class:active={showRaw} onclick={() => showRaw = true}>Raw</button>
  </div>

  {#if showRaw}
    <pre class="plan-raw">{rawText}</pre>
  {:else if planTree}
    <div class="plan-tree">
      {#snippet nodeSnippet(node: PlanNode, depth: number)}
        <div class="plan-node" style="padding-left: {depth * 20 + 8}px;">
          <div class="node-header" class:expensive={isExpensive(node.cost)}>
            <span class="node-type">{node.type}</span>
            {#if node.relation}
              <span class="node-relation">on {node.relation}</span>
            {/if}
            {#if node.cost !== undefined}
              <span class="node-cost">cost: {node.cost.toFixed(2)}</span>
            {/if}
            {#if node.rows !== undefined}
              <span class="node-rows">rows: {node.rows}</span>
            {/if}
            {#if node.actualTime !== undefined}
              <span class="node-time">{node.actualTime.toFixed(3)}ms</span>
            {/if}
          </div>
          {#if node.cost !== undefined}
            <div class="cost-bar-wrapper" style="margin-left: {depth * 20 + 8}px;">
              <div class="cost-bar" class:expensive={isExpensive(node.cost)} style="width: {costPercent(node.cost)}%;"></div>
            </div>
          {/if}
          {#each node.children as child}
            {@render nodeSnippet(child, depth + 1)}
          {/each}
        </div>
      {/snippet}
      {@render nodeSnippet(planTree, 0)}
    </div>
  {:else}
    <pre class="plan-raw">{rawText}</pre>
  {/if}
</div>

<style>
  .plan-viewer {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .plan-toolbar {
    display: flex;
    gap: 2px;
    padding: 4px 8px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .plan-toggle {
    padding: 2px 10px;
    font-size: 11px;
    font-family: var(--font-sans);
    border: 1px solid var(--border-color);
    background: none;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: var(--radius-sm);
  }

  .plan-toggle.active {
    background: var(--bg-active);
    color: var(--accent);
    border-color: var(--accent);
  }

  .plan-tree {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .plan-node {
    margin-bottom: 2px;
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 8px;
    font-size: 12px;
    font-family: var(--font-mono);
    border-radius: var(--radius-sm);
  }

  .node-header:hover {
    background: var(--bg-hover);
  }

  .node-header.expensive {
    background: rgba(250, 179, 135, 0.08);
  }

  .node-type {
    font-weight: 600;
    color: var(--text-primary);
  }

  .node-relation {
    color: var(--accent);
  }

  .node-cost, .node-rows, .node-time {
    color: var(--text-muted);
    font-size: 11px;
  }

  .node-time {
    color: var(--text-secondary);
  }

  .cost-bar-wrapper {
    height: 3px;
    margin-right: 8px;
    margin-bottom: 2px;
    background: rgba(69, 71, 90, 0.2);
    border-radius: 2px;
    overflow: hidden;
  }

  .cost-bar {
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    transition: width 0.3s;
  }

  .cost-bar.expensive {
    background: var(--warning, #fab387);
  }

  .plan-raw {
    flex: 1;
    overflow: auto;
    padding: 12px;
    margin: 0;
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
