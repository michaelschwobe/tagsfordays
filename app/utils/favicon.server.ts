import { promiseAllSettledUnion } from "~/utils/misc";

function toFaviconServiceUrl(url: string) {
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
    const blob = await response.arrayBuffer();
    const contentType = response.headers.get("content-type");
    const bufferStr = Buffer.from(blob).toString("base64");
    const base64Str = `data:${contentType};base64,${bufferStr}`;
    return base64Str;
  } catch (error) {
    return null;
  }
}

export async function getFavicons<TItem extends { url: string }>(
  items: TItem[],
  timeout?: number,
): Promise<
  ReadonlyArray<
    TItem & { _meta: { faviconSrc: Awaited<ReturnType<typeof getFavicon>> } }
  >
> {
  // The order of the responses is not guaranteed.
  const [responses] = await promiseAllSettledUnion(
    items.map(async ({ url }) => ({
      url,
      src: await getFavicon(url, timeout),
    })),
  );
  // Re-sorted based on the original order.
  return items.map((item) => {
    const response = responses.find(({ url }) => url === item.url);
    return { ...item, _meta: { faviconSrc: response?.src ?? null } };
  });
}
