type ArrayElementType<T> = T extends (infer E)[] ? E : T;

type FaviconSrc = string | null;

type ItemsWithUrlProp<T> = Array<ArrayElementType<T> & { url: string }>;

type ItemsWithFaviconSrcProp<T> = Array<
  ArrayElementType<T> & { faviconSrc: FaviconSrc }
>;

export function toFaviconServiceUrl(url: string) {
  const { hostname } = new URL(url);
  const faviconServiceUrl = new URL("https://icons.duckduckgo.com/ip3");
  faviconServiceUrl.pathname += `/${hostname}.ico`;
  return faviconServiceUrl.href;
}

export async function getFavicon(url: string): Promise<FaviconSrc> {
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

export async function mapWithFaviconSrc<T extends ItemsWithUrlProp<T>>(
  bookmarks: T,
): Promise<ItemsWithFaviconSrcProp<T>> {
  return Promise.all(
    bookmarks.map(async (bookmark) => {
      const faviconSrc = await getFavicon(bookmark.url);
      return { ...bookmark, faviconSrc };
    }),
  );
}

export type ItemsWithFaviconSrcData<T extends ItemsWithUrlProp<T>> = Awaited<
  ReturnType<typeof mapWithFaviconSrc<T>>
>;
