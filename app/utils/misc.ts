import { clsx, type ClassValue } from "clsx";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export const APP_NAME = "TagsForDays";
export const APP_DESCRIPTION_SHORT = "Relational bookmarking";
export const APP_DESCRIPTION = "Relational bookmarking for the modern web";

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

export function dedupe<T>(arr: T[]) {
  return [...new Set(arr)];
}

export function cn(...args: ClassValue[]) {
  return twMerge(clsx(dedupe(args)));
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

export function formatItemsFoundByCount({
  count = 0,
  single,
  plural,
}: {
  count?: number | undefined;
  single: string;
  plural: string;
}) {
  if (count === 0) {
    return `no ${plural} found`;
  }
  if (count === 1) {
    return `found ${count} ${single}`;
  }
  return `found ${count} ${plural}`;
}

export function formatMetaTitle(title: string) {
  return `${title} | ${APP_NAME}`;
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
