import { CHANGELOG } from '$lib/data/changelog';

export async function load() {
  return { changelog: CHANGELOG };
}
