import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getBookmarks } from "~/models/bookmark.server";
import { requireUserId } from "~/utils/auth.server";
import type { BookmarkExportFileExtension } from "~/utils/bookmark";

type GetBookmarksData = Awaited<ReturnType<typeof getBookmarks>>;

export function createExportLoader(fileExtension: BookmarkExportFileExtension) {
  return async function loader({ request }: LoaderFunctionArgs) {
    await requireUserId(request);

    const bookmarks = await getBookmarks();

    return exportResponse({ data: bookmarks, fileExtension });
  };
}

export function createExportAction(fileExtension: BookmarkExportFileExtension) {
  return async function action({ request }: ActionFunctionArgs) {
    await requireUserId(request);

    const formData = await request.formData();
    const selectedIds = String(formData.get("selected-ids") ?? "")
      .split(",")
      .filter(Boolean);

    const bookmarks = await getBookmarks();

    return exportResponse({
      data:
        selectedIds.length > 0
          ? bookmarks.filter((el) => selectedIds.includes(el.id))
          : bookmarks,
      fileExtension,
    });
  };
}

export const mappedExportFunctions = {
  csv: formatExportAsCsv,
  html: formatExportAsHtml,
  json: formatExportAsJson,
  md: formatExportAsMarkdown,
  txt: formatExportAsText,
} as const;

export function exportResponse({
  data,
  fileExtension,
}: {
  data: GetBookmarksData;
  fileExtension: BookmarkExportFileExtension;
}) {
  const { body, mimeType } = mappedExportFunctions[fileExtension](data);
  const filename = `bookmarks_${new Date()
    .toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    })
    .replace(/\//g, "_")}.${fileExtension}`;
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename=${filename}`,
      "Content-Type": `${mimeType}; charset=utf-8`,
    },
  });
}

export function formatExportAsCsv(data: GetBookmarksData) {
  const head = ["text", "href", "date"].join(",");

  const rows = data.map(({ createdAt, title, url }) => {
    const text = title?.replace(",", "\\,") ?? "Untitled";
    const href = url;
    const date = createdAt.toUTCString().replace(",", "\\,");
    const row = [text, href, date].join(",");
    return row;
  });

  const body = [head, rows.join("\n")].join("\n");

  return { body, mimeType: "text/csv" };
}

export function formatExportAsHtml(data: GetBookmarksData) {
  const rows = data.map(({ createdAt, title, url }) => {
    const text = title ?? "Untitled";
    const href = url;
    const date = String(createdAt.getTime()).slice(0, 10);
    const row = `<DT><A HREF="${href}" ADD_DATE="${date}">${text}</A></DT>`;
    return row;
  });

  const body = [
    "<!DOCTYPE NETSCAPE-Bookmark-file-1>",
    "<!-- This is an automatically generated file.",
    "     It will be read and overwritten.",
    "     DO NOT EDIT! -->",
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    "<TITLE>Bookmarks</TITLE>",
    "<H1>Bookmarks</H1>",
    "<DL>",
    ...rows,
    "</DL>",
  ].join("\n");

  return { body, mimeType: "text/html" };
}

export function formatExportAsJson(data: GetBookmarksData) {
  const rows = data.map(({ createdAt, title, url }) => {
    return { createdAt, title, url };
  });

  const body = JSON.stringify(rows, null, 2);

  return { body, mimeType: "application/json" };
}

export function formatExportAsMarkdown(data: GetBookmarksData) {
  const rows = data.map(({ createdAt, title, url }) => {
    const text = `**${title ?? "Untitled"}**`;
    const href = `<${url}>`;
    const date = createdAt.toUTCString();
    const row = "- ".concat([text, href, date].filter(Boolean).join("<br />"));
    return row;
  });

  const body = ["# Bookmarks", "", ...rows.concat("\n")].join("\n");

  return { body, mimeType: "text/markdown" };
}

export function formatExportAsText(data: GetBookmarksData) {
  const rows = data.map(({ createdAt, title, url }) => {
    const text = title ?? "Untitled";
    const href = url;
    const date = createdAt.toUTCString();
    const row = [text, href, date].filter(Boolean).join("\n");
    return row;
  });

  const body = rows.concat("\n").join("\n\n");

  return { body, mimeType: "text/plain" };
}
