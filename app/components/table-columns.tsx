import { createColumnHelper } from "@tanstack/react-table";
import { ButtonDelete } from "~/components/button-delete";
import { ButtonFavorite } from "~/components/button-favorite";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { Favicon } from "~/components/ui/favicon";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { cn } from "~/utils/misc";

export const columnSelectable = createColumnHelper<{
  id: string;
}>().display({
  id: "select",
  header: ({ table }) => (
    <Checkbox
      name="idsSelectedAll"
      checked={table.getIsAllRowsSelected()}
      indeterminate={table.getIsSomeRowsSelected()}
      onCheckedChange={(checked) => {
        const handler = table.getToggleAllRowsSelectedHandler();
        return handler({ target: { checked } });
      }}
      aria-label="Select all rows"
      aria-controls={table
        .getSelectedRowModel()
        .rows.map((row) => row.original.id)
        .join(" ")}
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      name="idsSelected"
      id={row.original.id}
      value={row.original.id}
      checked={row.getIsSelected()}
      indeterminate={row.getIsSomeSelected()}
      disabled={!row.getCanSelect()}
      onCheckedChange={(checked) => {
        const handler = row.getToggleSelectedHandler();
        return handler({ target: { checked } });
      }}
      aria-label="Select row"
      aria-controls={row.original.id}
    />
  ),
  footer: ({ column }) => column.id,
});

export const columnCreatedAt = createColumnHelper<{
  createdAt: string;
}>().accessor("createdAt", {
  sortingFn: "datetime",
  header: () => (
    <span>
      <Icon type="calendar" />
      <span className="sr-only">Date Created</span>
    </span>
  ),
  cell: ({ getValue }) => (
    <span className="whitespace-nowrap">
      {new Date(getValue()).toLocaleDateString()}
    </span>
  ),
  footer: ({ column }) => column.id,
});

export const columnTagRelations = createColumnHelper<{
  _count: {
    tags: number;
  };
}>().accessor("_count.tags", {
  id: "tagRelations",
  sortingFn: "alphanumeric",
  header: () => (
    <span>
      <Icon type="tags" />
      <span className="sr-only">Tag Relations</span>
    </span>
  ),
  cell: ({ getValue }) => (getValue() > 0 ? <Badge>{getValue()}</Badge> : null),
  footer: ({ column }) => column.id,
});

export const columnBookmarkStatus = createColumnHelper<{
  id: string;
  _meta: { ok: boolean; status: number; statusText: string };
}>().accessor((row) => row._meta.status, {
  id: "status",
  sortingFn: "alphanumeric",
  header: () => (
    <>
      <Icon className="mx-auto" type="shield" />
      <span className="sr-only">Status</span>
    </>
  ),
  cell: ({ row, getValue }) => (
    <Badge
      variant={
        row.original._meta.ok === true
          ? "success"
          : getValue() >= 300 && getValue() <= 499
          ? "warning"
          : "danger"
      }
    >
      {getValue()}
      <span className="sr-only">{row.original._meta.statusText}</span>
    </Badge>
  ),
  footer: ({ column }) => column.id,
});

export const columnBookmarkTitle = createColumnHelper<{
  id: string;
  title: string;
  faviconSrc: string | null;
}>().accessor("title", {
  header: () => "Title",
  cell: ({ row, getValue }) => (
    <LinkButton
      to={`/bookmarks/${row.original.id}`}
      variant="ghost"
      size="sm"
      className={cn(
        "flex w-full justify-start overflow-hidden",
        "max-w-[75vw] sm:max-w-[30vw]",
      )}
    >
      <Favicon src={row.original.faviconSrc} />{" "}
      <span className="truncate">
        {getValue() ? (
          <span>{getValue()}</span>
        ) : (
          <span aria-label="Untitled">--</span>
        )}
      </span>
    </LinkButton>
  ),
  footer: ({ column }) => column.id,
});

export const columnBookmarkUrl = createColumnHelper<{
  id: string;
  url: string;
}>().accessor("url", {
  header: () => "URL",
  cell: ({ getValue }) => (
    <LinkButton
      to={getValue()}
      target="_blank"
      rel="noopener noreferrer"
      variant="ghost"
      size="sm"
      className={cn(
        "flex w-full justify-start overflow-hidden",
        "max-w-[75vw] sm:max-w-[45vw]",
      )}
    >
      <Icon type="external-link" />
      <span className="truncate font-normal">{getValue()}</span>
    </LinkButton>
  ),
  footer: ({ column }) => column.id,
});

export const columnBookmarksDelete = createColumnHelper<{
  id: string;
}>().accessor("id", {
  id: "delete",
  enableSorting: false,
  header: () => (
    <>
      <Icon className="mx-auto" type="trash-2" />
      <span className="sr-only">Delete</span>
    </>
  ),
  cell: ({ getValue }) => (
    <ButtonDelete
      formAction={`/bookmarks/${getValue()}/edit`}
      label="bookmark"
      variant="ghost-danger"
      size="sm-icon"
    />
  ),
  footer: ({ column }) => column.id,
});

export const columnBookmarksFavorite = createColumnHelper<{
  id: string;
  favorite: boolean;
}>().accessor("favorite", {
  header: () => (
    <span>
      <Icon type="heart" />
      <span className="sr-only">Favorite</span>
    </span>
  ),
  cell: ({ row, getValue }) => (
    <ButtonFavorite
      formAction={`/bookmarks/${row.original.id}/edit`}
      label="bookmark"
      isFavorite={getValue()}
      variant="ghost"
      size="sm-icon"
    />
  ),
  footer: ({ column }) => column.id,
});
