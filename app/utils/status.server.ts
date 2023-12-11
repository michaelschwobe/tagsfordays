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
      const name = error.name.length > 0 ? error.name : undefined;
      const message = error.message.length > 0 ? error.message : undefined;
      const status =
        name === "TimeoutError" ? 408 : name === "AbortError" ? 504 : 500;
      const statusText = name ?? message ?? "Unknown Error";
      return { ok: false, status, statusText };
    } else {
      return { ok: false, status: 500, statusText: "Uncaught Error" };
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
