import type { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { ButtonDelete } from "~/components/button-delete";
import { StatusCode } from "~/components/status-code";
import { StatusText } from "~/components/status-text";
import { Checkbox } from "~/components/ui/checkbox";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import type { loader as loaderBookmarksStatus } from "~/routes/bookmarks.status";
import { cn } from "~/utils/misc";

type BookmarksStatusData = Awaited<
  ReturnType<Awaited<ReturnType<typeof loaderBookmarksStatus>>["json"]>
>["data"];

type BookmarksStatusItem = BookmarksStatusData[0];

const columnHelper = createColumnHelper<BookmarksStatusItem>();

// TODO: Remove ts-expect-error(s) once this is fixed.
// 🤷‍♂️ Flagged as a TS error and ts-expect-error doesn't work, leaving as is.
// See node module bug https://github.com/TanStack/table/issues/5135
export const columnsBookmarksStatus: ColumnDef<BookmarksStatusItem>[] = [
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
  columnHelper.accessor((row) => row._meta.status, {
    id: "status",
    sortingFn: "alphanumeric",
    header: () => (
      <>
        <Icon type="shield" className="mx-auto" />
        <span className="sr-only">Status</span>
      </>
    ),
    cell: ({ getValue }) => <StatusCode>{getValue()}</StatusCode>,
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
  columnHelper.accessor((row) => row._meta.statusText, {
    id: "statusText",
    sortingFn: "alphanumeric",
    header: () => (
      <>
        <Icon type="info" className="mx-auto" />
        <span className="sr-only">Status Text</span>
      </>
    ),
    cell: ({ getValue }) => <StatusText>{getValue()}</StatusText>,
    footer: ({ column }) => column.id,
  }),

  // @ts-expect-error - see comment above
  columnHelper.accessor("id", {
    id: "edit",
    enableSorting: false,
    header: () => (
      <>
        <Icon type="pencil" className="mx-auto" />
        <span className="sr-only">Edit</span>
      </>
    ),
    cell: ({ getValue }) => (
      <LinkButton
        to={`/bookmarks/${getValue()}/edit`}
        size="sm-icon"
        variant="ghost"
      >
        <Icon type="pencil" />
        <span className="sr-only">Edit bookmark</span>
      </LinkButton>
    ),
    footer: ({ column }) => column.id,
  }),

  // @ts-expect-error - see comment above
  columnHelper.accessor("id", {
    id: "delete",
    enableSorting: false,
    header: () => (
      <>
        <Icon type="trash" className="mx-auto" />
        <span className="sr-only">Delete</span>
      </>
    ),
    cell: ({ getValue }) => (
      <ButtonDelete
        formAction={`/bookmarks/${getValue()}/edit`}
        label="bookmark"
        size="sm-icon"
        variant="ghost-danger"
      />
    ),
    footer: ({ column }) => column.id,
  }),
];
