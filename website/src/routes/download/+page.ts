import { platforms, VERSION } from '$lib/data/downloads';

export async function load() {
  return { version: VERSION, platforms };
}
