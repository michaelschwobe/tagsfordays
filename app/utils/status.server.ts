import { promiseAllSettledUnion } from "~/utils/misc";

export async function getStatus(input: string, timeout: number) {
  try {
    const { ok, status, statusText } = await fetch(input, {
      method: "HEAD",
      signal: AbortSignal.timeout(timeout),
    });
    return { ok, status, statusText };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TimeoutError") {
        return { ok: false, status: 408, statusText: "Timeout" };
      } else if (error.name === "AbortError") {
        return { ok: false, status: 504, statusText: "Aborted" };
      } else {
        return {
          ok: false,
          status: 500,
          statusText: error.name ?? error.message?.slice?.(0, 8) ?? "Unknown",
        };
      }
    } else {
      return { ok: false, status: 500, statusText: "Internal" };
    }
  }
}

export type GetStatusData = Awaited<ReturnType<typeof getStatus>>;

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
