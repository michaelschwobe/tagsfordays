import { Form } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Favorite } from "~/components/favorite";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Favicon } from "~/components/ui/favicon";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import {
  Table,
  TableWrapper,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "~/components/ui/table";
import type { getBookmarks } from "~/models/bookmark.server";
import type { ItemWithFaviconSrcProp } from "~/models/favicon.server";
import { BOOKMARK_EXPORT_LABEL_MAP } from "~/utils/bookmark";
import { cn } from "~/utils/misc";

type GetBookmarksData = Awaited<ReturnType<typeof getBookmarks>>;

// 🤷‍♂️ Patched with string type for `createdAt` property.
type GetBookmarksDataItem = Omit<GetBookmarksData[0], "createdAt"> & {
  createdAt: Date | string;
};

type BookmarksTableData = GetBookmarksDataItem & ItemWithFaviconSrcProp;

const columnHelper = createColumnHelper<BookmarksTableData>();

// 🤷‍♂️ Flagged as a TS error and @ts-expect-error doesn't work, leaving as is.
// TODO: remove comment once this is fixed.
// See node module bug https://github.com/TanStack/table/issues/5135
export const bookmarksTableColumns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows"
        name="selectedIdsAll"
        aria-controls={table
          .getSelectedRowModel()
          .rows.map((row) => row.original.id)
          .join(" ")}
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onCheckedChange={(checked) =>
          table.getToggleAllRowsSelectedHandler()({ target: { checked } })
        }
      />
    ),
    footer: ({ column }) => column.id,
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        id={row.original.id}
        name="selectedIds"
        value={row.original.id}
        checked={row.getIsSelected()}
        indeterminate={row.getIsSomeSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked) =>
          row.getToggleSelectedHandler()({ target: { checked } })
        }
      />
    ),
  }),

  columnHelper.accessor("title", {
    header: () => "Title",
    footer: ({ column }) => column.id,
    cell: ({ row, getValue }) => (
      <ButtonTitle
        bookmarkId={row.original.id}
        faviconSrc={row.original.faviconSrc}
        title={getValue()}
      />
    ),
  }),

  columnHelper.accessor("url", {
    header: () => "URL",
    footer: ({ column }) => column.id,
    cell: ({ getValue }) => <ButtonUrl url={getValue()} />,
  }),

  columnHelper.accessor("createdAt", {
    sortingFn: "datetime",
    header: () => (
      <span>
        <Icon type="calendar" />
        <span className="sr-only">Date Created</span>
      </span>
    ),
    footer: ({ column }) => column.id,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-xs">
        {new Date(getValue()).toLocaleDateString()}
      </span>
    ),
  }),

  columnHelper.accessor("_count.tags", {
    id: "tagRelations",
    sortingFn: "alphanumeric",
    header: () => (
      <span>
        <Icon type="tags" />
        <span className="sr-only">Tag Relations</span>
      </span>
    ),
    footer: ({ column }) => column.id,
    cell: ({ getValue }) => <Badge>{getValue()}</Badge>,
  }),

  columnHelper.accessor("favorite", {
    header: () => (
      <span>
        <Icon type="heart" />
        <span className="sr-only">Favorite</span>
      </span>
    ),
    footer: ({ column }) => column.id,
    cell: ({ row, getValue }) => (
      <ButtonFavorite bookmarkId={row.original.id} defaultValue={getValue()} />
    ),
  }),
];

export interface BookmarksTableProps<TData, TValue>
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets table column definitions, display templates, etc. **Required** */
  columns: ColumnDef<TData, TValue>[];
  /** Sets table data. **Required** */
  data: TData[];
}

export function BookmarksTable<TData, TValue>({
  className,
  columns,
  data,
  ...props
}: BookmarksTableProps<TData, TValue>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  const selectedIds = table
    .getSelectedRowModel()
    // TODO: remove ts-expect-error once this is fixed
    // @ts-expect-error - 🤷‍♂️ 'id' does exist
    .rows.map((row) => row.original.id);

  return (
    <TableWrapper {...props} className={cn("border", className)}>
      <Table>
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Th
                    key={header.id}
                    className={cn(
                      "py-1.5",
                      header.column.id === "url" ? "w-full" : undefined,
                    )}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <ThButton
                        onClick={header.column.getToggleSortingHandler()}
                        isSortedAsc={header.column.getIsSorted() === "asc"}
                        isSortedDesc={header.column.getIsSorted() === "desc"}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </ThButton>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Tr
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <Td
                    key={cell.id}
                    className={cn(
                      "py-1",
                      ["createdAt", "tagRelations", "favorite"].includes(
                        cell.column.id,
                      )
                        ? "text-center"
                        : undefined,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={columns.length} className="px-4 text-center">
                No results.
              </Td>
            </Tr>
          )}
        </Tbody>
        <Tfoot>
          <Tr>
            <Td>
              <Checkbox
                aria-label="Select all rows"
                aria-controls={selectedIds.join(" ")}
                checked={table.getIsAllRowsSelected()}
                indeterminate={table.getIsSomeRowsSelected()}
                onCheckedChange={(checked) =>
                  table.getToggleAllRowsSelectedHandler()({
                    target: { checked },
                  })
                }
              />
            </Td>
            <Td className="pl-6 pr-3" colSpan={columns.length - 1}>
              <SelectedBookmarksForm
                selectedIds={selectedIds}
                totalLength={table.getRowModel().rows.length}
              >
                <ButtonExportGroup />
              </SelectedBookmarksForm>
            </Td>
          </Tr>
        </Tfoot>
      </Table>
    </TableWrapper>
  );
}

function ThButton({
  children,
  isSortedAsc,
  isSortedDesc,
  onClick,
}: {
  children: React.ReactNode;
  isSortedAsc: boolean;
  isSortedDesc: boolean;
  onClick: ((event: unknown) => void) | undefined;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="w-full max-w-[75vw] cursor-pointer select-none justify-start px-4 sm:max-w-[45vw]"
      variant="ghost"
      size="sm"
    >
      {children}
      <Icon
        type={
          isSortedAsc
            ? "chevron-up"
            : isSortedDesc
            ? "chevron-down"
            : "chevrons-up-down"
        }
      />
    </Button>
  );
}

function ButtonTitle({
  bookmarkId,
  faviconSrc,
  title,
}: {
  bookmarkId: string;
  faviconSrc: string | null | undefined;
  title: string | null | undefined;
}) {
  return (
    <LinkButton
      to={`/bookmarks/${bookmarkId}`}
      variant="ghost"
      className="w-full max-w-[75vw] justify-start overflow-hidden sm:max-w-[30vw]"
    >
      <Favicon src={faviconSrc} />{" "}
      <span className="truncate text-sm">
        {title ? <span>{title}</span> : <span aria-label="Untitled">--</span>}
      </span>
    </LinkButton>
  );
}

function ButtonUrl({ url }: { url: string }) {
  return (
    <LinkButton
      to={url}
      target="_blank"
      rel="noopener noreferrer"
      variant="ghost"
      className="w-full max-w-[75vw] justify-start overflow-hidden font-normal sm:max-w-[45vw]"
    >
      <Icon type="external-link" />
      <span className="truncate text-xs font-normal">{url}</span>
    </LinkButton>
  );
}

function ButtonFavorite({
  bookmarkId,
  defaultValue,
}: {
  bookmarkId: string;
  defaultValue: boolean | null | undefined;
}) {
  return (
    <Favorite
      formAction={`/bookmarks/${bookmarkId}`}
      defaultValue={defaultValue}
      variant="ghost"
    />
  );
}

function ButtonExportGroup() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Object.entries(BOOKMARK_EXPORT_LABEL_MAP).map(([ext, label]) => (
        <ButtonExport key={ext} formAction={`/bookmarks.${ext}`}>
          {label}
        </ButtonExport>
      ))}
    </div>
  );
}

function ButtonExport({
  children,
  formAction,
}: {
  children: React.ReactNode;
  formAction: string;
}) {
  return (
    <Button type="submit" formAction={formAction} variant="outlined" size="sm">
      <Icon type="download" />
      <span className="sr-only">Export </span>
      {children}
    </Button>
  );
}

function SelectedBookmarksForm({
  children,
  selectedIds,
  totalLength,
}: {
  children: React.ReactNode;
  selectedIds: string[];
  totalLength: number;
}) {
  return (
    <Form method="POST" reloadDocument>
      <input type="hidden" name="selected-ids" value={selectedIds.join(",")} />
      <div className="flex flex-col gap-2 max-sm:max-w-[75vw] sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm tabular-nums">
          {selectedIds.length} of {totalLength} rows selected.
        </div>
        {children}
      </div>
    </Form>
  );
}
