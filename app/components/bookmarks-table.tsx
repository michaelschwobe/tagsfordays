import type { ColumnDef } from "@tanstack/react-table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Favorite } from "~/components/favorite";
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
import { cn } from "~/utils/misc";

export interface BookmarksWithFavicon {
  id: string;
  title: string | null;
  url: string;
  favorite: boolean | null;
  favicon: null;
}

const columnHelper = createColumnHelper<BookmarksWithFavicon>();

export const bookmarksTableColumns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows"
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
        faviconSrc={row.original.favicon}
        title={getValue()}
      />
    ),
  }),

  columnHelper.accessor("url", {
    header: () => "URL",
    footer: ({ column }) => column.id,
    cell: ({ getValue }) => <ButtonUrl url={getValue()} />,
  }),

  columnHelper.accessor("favorite", {
    header: () => <span className="sr-only">Favorite</span>,
    footer: ({ column }) => column.id,
    cell: ({ row, getValue }) => (
      <ButtonFavorite bookmarkId={row.original.id} defaultValue={getValue()} />
    ),
  }),
];

export interface BookmarksTableProps<TData, TValue>
  extends Omit<React.ComponentPropsWithoutRef<"table">, "children"> {
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

  return (
    <TableWrapper className="border">
      <Table {...props} className={cn(className)}>
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
                      <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                          "cursor-pointer select-none",
                          header.column.id !== "favorite"
                            ? "w-full justify-start px-4"
                            : undefined,
                        )}
                        size="sm"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <Icon
                          type={
                            header.column.getIsSorted() === "asc"
                              ? "chevron-up"
                              : header.column.getIsSorted() === "desc"
                              ? "chevron-down"
                              : "chevrons-up-down"
                          }
                        />
                      </Button>
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
                  <Td key={cell.id} className="py-1">
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
                aria-controls={table
                  .getSelectedRowModel()
                  // TODO: remove ts-expect-error once this is fixed
                  // @ts-expect-error - 🤷‍♂️ 'id' does exist
                  .rows.map((row) => row.original.id)
                  .join(" ")}
                checked={table.getIsAllRowsSelected()}
                indeterminate={table.getIsSomeRowsSelected()}
                onCheckedChange={(checked) =>
                  table.getToggleAllRowsSelectedHandler()({
                    target: { checked },
                  })
                }
              />
            </Td>
            <Td className="pl-6 pr-4 text-sm" colSpan={columns.length - 1}>
              {table.getSelectedRowModel().rows.length} of{" "}
              {table.getRowModel().rows.length} Rows selected
            </Td>
          </Tr>
        </Tfoot>
      </Table>
    </TableWrapper>
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
      className="w-full max-w-full justify-start overflow-hidden"
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
      className="w-full max-w-[65vw] justify-start overflow-hidden font-normal"
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
