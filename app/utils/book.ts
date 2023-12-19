export const BOOK_SEARCH_KEYS = [
  "title",
  "content",
  "tags",
  "bookmarks",
] as const;

export type BookSearchKey = (typeof BOOK_SEARCH_KEYS)[number];

export const BOOK_SEARCH_KEYS_LABEL_MAP = {
  title: "Title",
  content: "Content",
  tags: "Tags",
  bookmarks: "Bookmarks",
} satisfies Readonly<Record<BookSearchKey, string>>;
