import { Window } from "happy-dom";

interface AnchorImport {
  href: string;
  innerHtml: string;
  addDate: string;
}

interface BookmarkImportMaybe {
  url: string | null;
  title: string;
  createdAt: Date;
}

interface BookmarkImport {
  url: string;
  title: string;
  createdAt: Date;
}

const REG_EXP_MULTIPLE_SPACES = /\s\s+/g;

const REG_EXP_TRAILING_SLASH = /\/$/;

const ALLOWED_PROTOCOLS = ["https"] as const;

const BLOCKED_HOSTNAMES = ["mail.google.com"] as const;

const BLOCKED_SEARCH_PARAMS = [
  "affiliate_id",
  "browser",
  "cid",
  "ck_subscriber_id",
  "click_id",
  "clickid",
  "conversion_id",
  "conversion_tracking",
  "device",
  "gi",
  "lang",
  "locale",
  "ref",
  "referer",
  "referrer",
  "session_id",
  "timestamp",
  "user_id",
  "utm_campaign",
  "utm_content",
  "utm_medium",
  "utm_source",
  "utm_term",
] as const;

export function formatBookmarkUrl({
  url,
  allowedProtocols,
  blockedHostnames,
  blockedSearchParams,
}: {
  url: string;
  allowedProtocols?: readonly string[] | undefined;
  blockedHostnames?: readonly string[] | undefined;
  blockedSearchParams?: readonly string[] | undefined;
}): string | null {
  let output: string | null = null;

  if (!URL.canParse(url)) {
    return output;
  }

  const parsedUrl = new URL(url);

  if (Array.isArray(allowedProtocols) && allowedProtocols.length > 0) {
    if (!allowedProtocols.includes(parsedUrl.protocol.replace(":", ""))) {
      return output;
    }
  }

  if (Array.isArray(blockedHostnames) && blockedHostnames.length > 0) {
    if (blockedHostnames.includes(parsedUrl.hostname)) {
      return output;
    }
  }

  if (Array.isArray(blockedSearchParams) && blockedSearchParams.length > 0) {
    const searchParams = new URLSearchParams(parsedUrl.search);
    for (const blockedSearchParam of blockedSearchParams) {
      if (searchParams.has(blockedSearchParam)) {
        searchParams.delete(blockedSearchParam);
      }
    }
    parsedUrl.search = searchParams.toString();
  }

  output = parsedUrl.toString().replace(REG_EXP_TRAILING_SLASH, "");

  return output;
}

export function formatBookmarkTitle(title: string): string {
  return title.trim().replaceAll(REG_EXP_MULTIPLE_SPACES, " ");
}

export function formatBookmarkCreatedAt(value: string | null): Date {
  const defaultDate = new Date("1970-01-01T00:00:00.000+00:00");
  if (!value || value === "0" || value.length !== 10) {
    return defaultDate;
  }
  const int = parseInt(value, 10);
  if (Number.isNaN(int)) {
    return defaultDate;
  }
  const parsedDate = new Date(int * 1000);
  return parsedDate;
}

function parseBookmarkImport(
  bookmarkImportRaw: AnchorImport,
): BookmarkImportMaybe {
  return {
    url: formatBookmarkUrl({
      url: bookmarkImportRaw.href,
      allowedProtocols: ALLOWED_PROTOCOLS,
      blockedHostnames: BLOCKED_HOSTNAMES,
      blockedSearchParams: BLOCKED_SEARCH_PARAMS,
    }),
    title: formatBookmarkTitle(bookmarkImportRaw.innerHtml),
    createdAt: formatBookmarkCreatedAt(bookmarkImportRaw.addDate),
  };
}

export function sortBookmarkImports(
  a: BookmarkImportMaybe,
  b: BookmarkImportMaybe,
): number {
  return a.createdAt.getTime() - b.createdAt.getTime();
}

export function filterBookmarkImports(
  bookmarkImports: BookmarkImportMaybe[],
): BookmarkImport[] {
  const set = new Set<string>();
  const output = bookmarkImports.filter((obj) => {
    if (typeof obj.url === "string" && obj.url !== "" && !set.has(obj.url)) {
      set.add(obj.url);
      return true;
    }
    return false;
  });
  return output as BookmarkImport[];
}

export function parseAnchorImports(
  anchorImports: AnchorImport[],
): BookmarkImport[] {
  const bookmarkImports = anchorImports
    .map((el) => parseBookmarkImport(el))
    .sort((a, b) => sortBookmarkImports(a, b));
  const output = filterBookmarkImports(bookmarkImports);
  return output;
}

export async function parseBookmarkFiles(
  files: File[],
): Promise<BookmarkImport[]> {
  let anchorImportsAll: AnchorImport[] = [];

  for await (const file of files) {
    const htmlString = await file.text();

    const win = new Window();
    win.document.write(htmlString);
    const anchorNodes = win.document.querySelectorAll("a");

    const anchorImports = Array.from(anchorNodes).map((anchor) => ({
      href: anchor.getAttribute("href"),
      innerHtml: anchor.getInnerHTML(),
      addDate: anchor.getAttribute("add_date"),
    })) satisfies AnchorImport[];

    anchorImportsAll = anchorImportsAll.concat(anchorImports);

    await win.happyDOM.whenAsyncComplete();
  }

  const output = parseAnchorImports(anchorImportsAll);

  return output;
}
