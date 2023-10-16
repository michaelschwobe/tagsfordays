import { Window } from "happy-dom";

export interface BookmarkImportRaw {
  url: string;
  title: string;
  createdAt: string;
}
export interface BookmarkImport {
  url: string;
  title: string;
  createdAt: Date;
}

export function parseSecondsToDate(value: string | null) {
  const defaultDate = new Date();
  if (!value || value.length !== 10 || value === "0") {
    return defaultDate;
  }
  const int = parseInt(value, 10);
  if (Number.isNaN(int)) {
    return defaultDate;
  }
  const parsedDate = new Date(int * 1000);
  if (parsedDate.toISOString() === "Invalid Date") {
    return defaultDate;
  }
  return parsedDate;
}

export function filterSecureUniqueUrls(items: BookmarkImportRaw[]) {
  const temporarySet = new Set();
  const output = items
    .map(({ url, title, createdAt }) => ({
      url,
      title: title.trim().replaceAll("  ", " ").slice(0, 45),
      createdAt: parseSecondsToDate(createdAt),
    }))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .filter(({ url }) => {
      const isRepeat = temporarySet.has(url);
      const isSecure = Boolean(url?.startsWith("https://"));
      if (!isRepeat && isSecure) {
        temporarySet.add(url);
        return true;
      }
      return false;
    });
  return output;
}

export async function parseBookmarkFiles(files: File[]) {
  let output: BookmarkImport[] = [];

  for await (const file of files) {
    const htmlString = await file.text();

    const win = new Window();
    win.document.write(htmlString);
    const anchorNodes = win.document.querySelectorAll("a");

    const bookmarkImportsRaw = Array.from(anchorNodes).map((anchor) => ({
      url: anchor.getAttribute("href"),
      title: anchor.getInnerHTML(),
      createdAt: anchor.getAttribute("add_date"),
    })) satisfies BookmarkImportRaw[];

    const bookmarkImports = filterSecureUniqueUrls(bookmarkImportsRaw);

    output = output.concat(bookmarkImports);

    await win.happyDOM.whenAsyncComplete();
  }

  return output;
}
