export const SEARCH_KEYS = ["url", "title", "description", "tags"] as const;

export type SearchKey = (typeof SEARCH_KEYS)[number];

export const SEARCH_OPTIONS = [
  ["url", "URL"],
  ["title", "Title"],
  ["description", "Description"],
  ["tags", "Tags"],
] satisfies ReadonlyArray<[SearchKey, string]>;

export function getSearchKey(key: string | null) {
  return SEARCH_KEYS.includes(key ?? "") ? (key as SearchKey) : "url";
}
