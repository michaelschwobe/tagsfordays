export const BOOKMARK_SEARCH_KEYS = [
  "url",
  "title",
  "content",
  "tags",
] as const;

export type BookmarkSearchKey = (typeof BOOKMARK_SEARCH_KEYS)[number];

export const BOOKMARK_SEARCH_KEYS_LABEL_MAP = {
  url: "URL",
  title: "Title",
  content: "Content",
  tags: "Tags",
} satisfies Readonly<Record<BookmarkSearchKey, string>>;

export function getBookmarkSearchKey(key: string | null) {
  return BOOKMARK_SEARCH_KEYS.includes(key ?? "")
    ? (key as BookmarkSearchKey)
    : "url";
}
