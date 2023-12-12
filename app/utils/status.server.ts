export async function getStatus(input: string, timeout: number) {
  try {
    const { ok, status, statusText } = await fetch(input, {
      method: "HEAD",
      signal: AbortSignal.timeout(timeout),
    });
    const message = statusText.length > 0 ? statusText : undefined;
    return { ok, status, statusText: message ?? "Unknown" };
  } catch (error) {
    if (error instanceof Error) {
      const name = error.name.length > 0 ? error.name : undefined;
      const message = error.message.length > 0 ? error.message : undefined;
      const status =
        name === "TimeoutError" ? 408 : name === "AbortError" ? 504 : 500;
      const statusText = name ?? message ?? "Unknown";
      return { ok: false, status, statusText };
    } else {
      return { ok: false, status: 500, statusText: "Uncaught" };
    }
  }
}

export type GetStatusData = Awaited<ReturnType<typeof getStatus>>;
