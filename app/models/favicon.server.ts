import { toFaviconServiceUrl } from "~/utils/bookmark";

type ArrayElementType<T> = T extends (infer E)[] ? E : T;

type Favicon = string | null;

type BookmarksWithUrlProp<T> = Array<ArrayElementType<T> & { url: string }>;

type BookmarksWithFaviconProp<T> = Array<
  ArrayElementType<T> & { favicon: Favicon }
>;

export async function getFavicon(url: string): Promise<Favicon> {
  try {
    const faviconServiceUrl = toFaviconServiceUrl(url);
    const response = await fetch(faviconServiceUrl);
    if (!response.ok) {
      throw new Error(`${response.status}: ${faviconServiceUrl}`);
    }
    return faviconServiceUrl;
  } catch (error) {
    return null;
  }
}

export async function mapBookmarksWithFavicon<
  T extends BookmarksWithUrlProp<T>,
>(bookmarks: T): Promise<BookmarksWithFaviconProp<T>> {
  return Promise.all(
    bookmarks.map(async (bookmark) => {
      const favicon = await getFavicon(bookmark.url);
      return { ...bookmark, favicon };
    }),
  );
}

export type BookmarksWithFaviconData<T extends BookmarksWithUrlProp<T>> =
  Awaited<ReturnType<typeof mapBookmarksWithFavicon<T>>>;
