import { promiseAllSettledUnion } from "~/utils/misc";

export function toFaviconServiceUrl(url: string) {
  const { hostname } = new URL(url);
  const faviconServiceUrl = new URL("https://icons.duckduckgo.com/ip3");
  faviconServiceUrl.pathname += `/${hostname}.ico`;
  return faviconServiceUrl.href;
}

export async function getFavicon(input: string, timeout = 300) {
  try {
    const faviconServiceUrl = toFaviconServiceUrl(input);
    const response = await fetch(faviconServiceUrl, {
      signal: AbortSignal.timeout(timeout),
    });
    if (!response.ok) {
      throw new Error(`${response.status}: ${faviconServiceUrl}`);
    }
    return { faviconSrc: faviconServiceUrl };
  } catch (error) {
    return { faviconSrc: null };
  }
}

export async function getFavicons<TData extends { url: string }>(
  items: TData[],
  timeout?: number,
): Promise<
  ReadonlyArray<TData & { _meta: Awaited<ReturnType<typeof getFavicon>> }>
> {
  const [fulfilled] = await promiseAllSettledUnion(
    items.map(async (item) => ({
      ...item,
      _meta: await getFavicon(item.url, timeout),
    })),
  );
  return fulfilled;
}
