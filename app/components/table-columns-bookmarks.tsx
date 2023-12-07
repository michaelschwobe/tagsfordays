import type { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { ButtonFavorite } from "~/components/button-favorite";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { Favicon } from "~/components/ui/favicon";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import type { loader as loaderBookmarks } from "~/routes/bookmarks._index";
import { DateTimeFormatMMDDYYYY, cn } from "~/utils/misc";

// 🤷‍♂️ Patch type Date with type string.
type StringifyDate<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] };

type BookmarksData = Awaited<
  ReturnType<Awaited<ReturnType<typeof loaderBookmarks>>["json"]>
>["data"];

type BookmarksItem = StringifyDate<BookmarksData[0]>;

const columnHelper = createColumnHelper<BookmarksItem>();

// TODO: Remove ts-expect-error(s) once this is fixed.
// 🤷‍♂️ Flagged as a TS error and ts-expect-error doesn't work, leaving as is.
// See node module bug https://github.com/TanStack/table/issues/5135
export const columnsBookmarks: ColumnDef<BookmarksItem>[] = [
  columnHelper.display({
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
  }),

  // @ts-expect-error - see comment above
  columnHelper.accessor("title", {
    header: () => "Title",
    cell: ({ row, getValue }) => (
      <LinkButton
        to={`/bookmarks/${row.original.id}`}
        size="sm"
        variant="ghost"
        className={cn(
          "flex w-full justify-start overflow-hidden",
          "max-w-[75vw] sm:max-w-[30vw]",
        )}
      >
        <Favicon src={row.original._meta?.faviconSrc} />{" "}
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
  }),

  // @ts-expect-error - see comment above
  columnHelper.accessor("url", {
    header: () => "URL",
    cell: ({ getValue }) => (
      <LinkButton
        to={getValue()}
        target="_blank"
        rel="noopener noreferrer"
        size="sm"
        variant="ghost"
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
  }),

  // @ts-expect-error - see comment above
  columnHelper.accessor("createdAt", {
    sortingFn: "datetime",
    header: () => (
      <span>
        <Icon type="calendar" />
        <span className="sr-only">Date Created</span>
      </span>
    ),
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap px-3">
        {DateTimeFormatMMDDYYYY.format(new Date(getValue()))
          .split("/")
          .reverse()
          .join("-")}
      </span>
    ),
    footer: ({ column }) => column.id,
  }),

  // @ts-expect-error - see comment above
  columnHelper.accessor("_count.tags", {
    id: "tagRelations",
    sortingFn: "alphanumeric",
    header: () => (
      <span>
        <Icon type="tags" />
        <span className="sr-only">Tag Relations</span>
      </span>
    ),
    cell: ({ getValue }) =>
      getValue() > 0 ? <Badge>{getValue()}</Badge> : null,
    footer: ({ column }) => column.id,
  }),

  // @ts-expect-error - see comment above
  columnHelper.accessor("favorite", {
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
        isFavorite={Boolean(getValue())}
        size="sm-icon"
        variant="ghost"
      />
    ),
    footer: ({ column }) => column.id,
  }),
];
