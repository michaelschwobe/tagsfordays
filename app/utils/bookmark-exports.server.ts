import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getBookmarksExport } from "~/models/bookmark.server";
import { requireUserId } from "~/utils/auth.server";
import type { BookmarkExportFileExtension } from "~/utils/bookmark";
import {
  DateTimeFormatMMDDYY,
  DateTimeFormatReadable,
  safeRedirect,
} from "~/utils/misc";

type GetBookmarksExportData = Awaited<ReturnType<typeof getBookmarksExport>>;

export function createExportLoader(fileExtension: BookmarkExportFileExtension) {
  return async function loader({ request }: LoaderFunctionArgs) {
    await requireUserId(request);

    const url = new URL(request.url);
    const to = url.pathname.replace(`.${fileExtension}`, "");
    const safeRedirectTo = safeRedirect(to);

    return redirect(safeRedirectTo);
  };
}

export function createExportAction(fileExtension: BookmarkExportFileExtension) {
  return async function action({ request }: ActionFunctionArgs) {
    await requireUserId(request);

    const formData = await request.formData();
    const idsSelected = String(formData.get("ids-selected") ?? "")
      .split(",")
      .filter(Boolean);

    const items = await getBookmarksExport();
    const data =
      idsSelected.length > 0
        ? items.filter((item) => idsSelected.includes(item.id))
        : items;

    return exportResponse({ data, fileExtension });
  };
}

const mappedExportFunctions = {
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
  data: GetBookmarksExportData;
  fileExtension: BookmarkExportFileExtension;
}) {
  const { body, mimeType } = mappedExportFunctions[fileExtension](data);
  const fileDate = DateTimeFormatMMDDYY.format(new Date()).replace(/\//g, "_");
  const fileName = `bookmarks_${fileDate}.${fileExtension}`;
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename=${fileName}`,
      "Content-Type": `${mimeType}; charset=utf-8`,
    },
  });
}

export function formatExportAsCsv(data: GetBookmarksExportData) {
  const head = ["text", "href", "date"].join(",");

  const rows = data.map(({ createdAt, title, url }) => {
    const text = title ? `"${title.replaceAll(`"`, `""`)}"` : "Untitled";
    const href = url;
    const date = `"${DateTimeFormatReadable.format(createdAt)}"`;
    const row = [text, href, date].join(",");
    return row;
  });

  const body = [head, rows.join("\n")].join("\n");

  return { body, mimeType: "text/csv" };
}

export function formatExportAsHtml(data: GetBookmarksExportData) {
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

export function formatExportAsJson(data: GetBookmarksExportData) {
  const rows = data.map(({ createdAt, title, url }) => {
    return { createdAt, title, url };
  });

  const body = JSON.stringify(rows, null, 2);

  return { body, mimeType: "application/json" };
}

export function formatExportAsMarkdown(data: GetBookmarksExportData) {
  const rows = data.map(({ createdAt, title, url }) => {
    const text = `**${title ?? "Untitled"}**`;
    const href = `<${url}>`;
    const date = DateTimeFormatReadable.format(createdAt);
    const row = "- ".concat([text, href, date].filter(Boolean).join("<br />"));
    return row;
  });

  const body = ["# Bookmarks", "", ...rows.concat("\n")].join("\n");

  return { body, mimeType: "text/markdown" };
}

export function formatExportAsText(data: GetBookmarksExportData) {
  const rows = data.map(({ createdAt, title, url }) => {
    const text = title ?? "Untitled";
    const href = url;
    const date = DateTimeFormatReadable.format(createdAt);
    const row = [text, href, date].filter(Boolean).join("\n");
    return row;
  });

  const body = rows.concat("\n").join("\n\n");

  return { body, mimeType: "text/plain" };
}
