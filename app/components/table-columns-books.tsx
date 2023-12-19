import type { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { ButtonFavorite } from "~/components/button-favorite";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import type { loader as loaderBooks } from "~/routes/books._index";
import { DateTimeFormatMMDDYYYY, cn } from "~/utils/misc";

// 🤷‍♂️ Patch type Date with type string.
type StringifyDate<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] };

type BooksData = Awaited<
  ReturnType<Awaited<ReturnType<typeof loaderBooks>>["json"]>
>["data"];

type BooksItem = StringifyDate<BooksData[0]>;

const columnHelper = createColumnHelper<BooksItem>();

// TODO: Remove ts-expect-error(s) once this is fixed.
// 🤷‍♂️ Flagged as a TS error and ts-expect-error doesn't work, leaving as is.
// See node module bug https://github.com/TanStack/table/issues/5135
export const columnsBooks: ColumnDef<BooksItem>[] = [
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
        to={`/books/${row.original.id}`}
        size="sm"
        variant="ghost"
        className={cn(
          "flex w-full justify-start overflow-hidden",
          "max-w-[75vw] sm:max-w-[30vw]",
        )}
      >
        <Icon type="book" />
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
  columnHelper.accessor("content", {
    header: () => "Content",
    cell: ({ getValue }) => (
      <div className="w-full max-w-[75vw] overflow-hidden truncate px-3 text-left sm:max-w-[30vw]">
        {getValue()}
      </div>
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
  columnHelper.accessor("_count.bookmarks", {
    id: "bookmarkRelations",
    sortingFn: "alphanumeric",
    header: () => (
      <span>
        <Icon type="bookmarks" />
        <span className="sr-only">Bookmark Relations</span>
      </span>
    ),
    cell: ({ getValue }) =>
      getValue() > 0 ? <Badge>{getValue()}</Badge> : null,
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
        formAction={`/books/${row.original.id}/edit`}
        label="book"
        isFavorite={Boolean(getValue())}
        size="sm-icon"
        variant="ghost"
      />
    ),
    footer: ({ column }) => column.id,
  }),
];
