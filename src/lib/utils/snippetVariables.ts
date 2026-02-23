const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;

export function parseVariables(sql: string): string[] {
  const matches = new Set<string>();
  let match;
  while ((match = VARIABLE_PATTERN.exec(sql)) !== null) {
    matches.add(match[1]);
  }
  return Array.from(matches);
}

export function substituteVariables(sql: string, values: Record<string, string>): string {
  return sql.replace(VARIABLE_PATTERN, (_, name) => {
    return values[name] ?? `{{${name}}}`;
  });
}
