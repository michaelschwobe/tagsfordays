export const APP_NAME = "TagsForDays";
export const APP_DESCRIPTION_SHORT = "Relational bookmarking";
export const APP_DESCRIPTION = "Relational bookmarking for the modern web";
export const HOME_ROUTE = "/";
export const USER_LOGIN_ROUTE = "/login";
export const USER_LOGOUT_ROUTE = "/logout";

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
  } catch (err) {
    console.error(err);
  }
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
  toFallback: string = HOME_ROUTE,
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
