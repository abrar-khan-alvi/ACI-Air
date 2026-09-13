export type SearchValue = string | number | boolean | null | undefined;

/**
 * Builds a `path?key=value` URL. Replaces the typed `search` object that
 * TanStack Router's `Link`/`navigate` accepted; Next.js takes plain strings.
 */
export function withSearch(path: string, search: Record<string, SearchValue>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value === null || value === undefined || value === "") continue;
    query.set(key, String(value));
  }
  const serialized = query.toString();
  return serialized ? `${path}?${serialized}` : path;
}

/** Turns Next's `ReadonlyURLSearchParams` into the plain record our validators expect. */
export function searchParamsToRecord(params: URLSearchParams): Record<string, unknown> {
  return Object.fromEntries(params.entries());
}
