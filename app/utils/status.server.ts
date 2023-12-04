import { promiseAllSettledUnion } from "~/utils/misc";

async function getStatus(input: string, timeout: number) {
  try {
    const { ok, status, statusText } = await fetch(input, {
      method: "HEAD",
      signal: AbortSignal.timeout(timeout),
    });
    return { ok, status, statusText };
  } catch (error) {
    if (error instanceof Error) {
      if ("type" in error && error.type === "aborted") {
        return { ok: false, status: 408, statusText: "Aborted" };
      } else {
        return { ok: false, status: 500, statusText: error.message };
      }
    } else {
      return { ok: false, status: 500, statusText: "Unknown" };
    }
  }
}

export async function getStatuses<TData extends { url: string }>(
  items: TData[],
  timeout: number,
): Promise<
  ReadonlyArray<TData & { _meta: Awaited<ReturnType<typeof getStatus>> }>
> {
  const [fulfilled] = await promiseAllSettledUnion(
    items.map(async (item) => ({
      ...item,
      _meta: await getStatus(item.url, timeout),
    })),
  );
  return fulfilled;
}
