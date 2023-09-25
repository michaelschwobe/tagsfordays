export const BOOKMARK_SEARCH_KEYS = [
  "url",
  "title",
  "content",
  "tags",
] as const;

export type BookmarkSearchKey = (typeof BOOKMARK_SEARCH_KEYS)[number];

export const DEFAULT_BOOKMARK_SEARCH_KEY = "url" as BookmarkSearchKey;

export const BOOKMARK_SEARCH_KEYS_LABEL_MAP = {
  url: "URL",
  title: "Title",
  content: "Content",
  tags: "Tags",
} satisfies Readonly<Record<BookmarkSearchKey, string>>;

export function parseBookmarkSearchKey(key: string | null): BookmarkSearchKey {
  return BOOKMARK_SEARCH_KEYS.includes(key ?? "")
    ? (key as BookmarkSearchKey)
    : DEFAULT_BOOKMARK_SEARCH_KEY;
}

export function toFaviconServiceUrl(url: string) {
  const { hostname } = new URL(url);
  const faviconServiceUrl = new URL("https://icons.duckduckgo.com/ip3");
  faviconServiceUrl.pathname += `/${hostname}.ico`;
  return faviconServiceUrl.href;
}
