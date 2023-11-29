export const BOOKMARK_EXPORT_FILE_EXTENSIONS = [
  "csv",
  "html",
  "json",
  "md",
  "txt",
] as const;

export type BookmarkExportFileExtension =
  (typeof BOOKMARK_EXPORT_FILE_EXTENSIONS)[number];

export const BOOKMARK_EXPORT_FILE_TYPE_MAP = {
  csv: "CSV",
  html: "HTML",
  json: "JSON",
  md: "Markdown",
  txt: "Text",
} satisfies Readonly<Record<BookmarkExportFileExtension, string>>;

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
