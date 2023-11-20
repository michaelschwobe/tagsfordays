import type { FieldConfig } from "@conform-to/react";
import { clsx, type ClassValue } from "clsx";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export async function asyncShare() {
  try {
    if (typeof document === "undefined" || !navigator.share) {
      throw new Error("Sharing unsupported");
    }
    const metaDescription = document.querySelector('meta[name="description"]');
    await navigator.share({
      url: document.location.href,
      title: document.title,
      text: metaDescription?.getAttribute("content") ?? document.location.href,
    });
  } catch (error) {
    console.error(error);
  }
}

function callAll<Args extends Array<unknown>>(
  ...fns: Array<((...args: Args) => unknown) | undefined>
) {
  return (...args: Args) => fns.forEach((fn) => fn?.(...args));
}

/**
 * Combine multiple header objects into one (uses append so headers are not overridden)
 */
export function combineHeaders(
  ...headers: Array<ResponseInit["headers"] | null | undefined>
) {
  const combined = new Headers();
  for (const header of headers) {
    if (!header) continue;
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value);
    }
  }
  return combined;
}

export function dedupe<T>(arr: T[]) {
  return [...new Set(arr)];
}

export function cn(...args: ClassValue[]) {
  return twMerge(clsx(dedupe(args)));
}

export function getDomainUrl(request: Request) {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");
  if (!host) {
    throw new Error("Could not determine domain URL.");
  }
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  console.error("Unable to get error message for error", error);
  return "Unknown Error";
}

export function getFieldError(field: FieldConfig<unknown>) {
  return field.initialError?.[""]?.[0] ?? field.error;
}

export function formatItemsFoundByCount({
  count = 0,
  singular,
  plural,
}: {
  count?: number | undefined;
  singular: string;
  plural: string;
}) {
  if (count === 0) {
    return `No ${plural} found`;
  }
  if (count === 1) {
    return `Found ${count} ${singular}`;
  }
  return `Found ${count} ${plural}`;
}

export function formatMetaTitle(title: string) {
  return title ? `${title} | ${ENV.APP_NAME}` : ENV.APP_NAME;
}

export function invariant(
  condition: any,
  message: string | (() => string),
): asserts condition {
  if (!condition) {
    throw new Error(typeof message === "function" ? message() : message);
  }
}

export function invariantResponse(
  condition: any,
  message: string | (() => string),
  responseInit?: ResponseInit,
): asserts condition {
  if (!condition) {
    throw new Response(typeof message === "function" ? message() : message, {
      status: 400,
      ...responseInit,
    });
  }
}

export function isFulfilled<T>(
  p: PromiseSettledResult<T>,
): p is PromiseFulfilledResult<T> {
  return p.status === "fulfilled";
}

export function isRejected<T>(
  p: PromiseSettledResult<T>,
): p is PromiseRejectedResult {
  return p.status === "rejected";
}

export async function promiseAllSettledUnion<T>(
  promises: Array<Promise<T>>,
): Promise<[fulfilled: T[], rejected: unknown[]]> {
  const results = await Promise.allSettled(promises);
  const fulfilled = results.filter(isFulfilled).map((result) => result.value);
  const rejected = results.filter(isRejected).map((result) => result.reason);
  return [fulfilled, rejected];
}

export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  toFallback: string = "/",
) {
  if (!to || typeof to !== "string") {
    return toFallback;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return toFallback;
  }

  return to;
}

export function toTitleCase(value: string) {
  return value.replaceAll(
    /\w\S*/g,
    (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
  );
}

export function useDoubleCheck() {
  const [isPending, setIsPending] = useState(false);

  type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

  function getButtonProps(props?: ButtonProps) {
    const onBlur: ButtonProps["onBlur"] = () => setIsPending(false);

    const onClick: ButtonProps["onClick"] = isPending
      ? undefined
      : (event) => {
          event.preventDefault();
          setIsPending(true);
        };

    return {
      ...props,
      onBlur: callAll(onBlur, props?.onBlur),
      onClick: callAll(onClick, props?.onClick),
    };
  }

  return { getButtonProps, isPending };
}

export const DateTimeFormatMMDDYYYY = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
  timeZone: "CST",
});

export const DateTimeFormatMMDDYY = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
  timeZone: "CST",
});

export const DateTimeFormatReadable = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "long",
  timeZone: "CST",
});
