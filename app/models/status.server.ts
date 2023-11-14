import { promiseAllSettledUnion } from "~/utils/misc";

export interface GetStatusData {
  ok: boolean;
  status: number;
  statusText: string;
}

export type GetStatusesData<TData> = ReadonlyArray<
  TData & { _meta: GetStatusData }
>;

export async function getStatus(
  input: string,
  timeout: number,
): Promise<GetStatusData> {
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
): Promise<GetStatusesData<TData>> {
  const [fulfilled] = await promiseAllSettledUnion(
    items.map(async (item) => ({
      ...item,
      _meta: await getStatus(item.url, timeout),
    })),
  );
  return fulfilled;
}
