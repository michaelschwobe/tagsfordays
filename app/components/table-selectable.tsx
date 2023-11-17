import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ButtonColumnSort } from "~/components/button-column-sort";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Table,
  TableWrapper,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "~/components/ui/table";
import { cn } from "~/utils/misc";

export interface RenderProps {
  idsNotSelected: string[];
  idsSelected: string[];
}

export interface TableSelectableProps<TData, TValue>
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** Sets the tfoot tr content. */
  children?: React.ReactNode | ((props: RenderProps) => React.ReactNode);
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets table column definitions, display templates, etc. **Required** */
  columns: ColumnDef<TData, TValue>[];
  /** Sets table data. **Required** */
  data: TData[];
}

export function TableSelectable<TData, TValue>({
  children,
  className,
  columns,
  data,
  ...props
}: TableSelectableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  const rows = table.getRowModel().rows;
  const rowsNotSelected = rows.filter((row) => !row.getIsSelected());
  const rowsSelected = table.getSelectedRowModel().rows;

  // TODO: Remove ts-expect-error(s) once this is fixed.
  // @ts-expect-error - 🤷‍♂️ 'id' DOES exist
  const idsNotSelected = rowsNotSelected.map((row) => row.original.id);
  // @ts-expect-error - 🤷‍♂️ 'id' DOES exist
  const idsSelected = rowsSelected.map((row) => row.original.id);

  const renderProps: RenderProps = { idsNotSelected, idsSelected };

  return (
    <>
      <TableWrapper {...props} className={cn(className)}>
        <Table>
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Th data-header-id={header.id} key={header.id}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <ButtonColumnSort
                          onClick={header.column.getToggleSortingHandler()}
                          isSortedAsc={header.column.getIsSorted() === "asc"}
                          isSortedDesc={header.column.getIsSorted() === "desc"}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </ButtonColumnSort>
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
            {rows?.length ? (
              rows.map((row) => (
                <Tr
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Td data-cell-id={cell.id} key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Td>
                  ))}
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={columns.length}>No results.</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableWrapper>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <label className="flex items-center gap-2.5 max-sm:h-10 max-sm:justify-center">
          <Checkbox
            name="idsSelectedAll"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onCheckedChange={(checked) => {
              const handler = table.getToggleAllRowsSelectedHandler();
              return handler({ target: { checked } });
            }}
            aria-controls={idsSelected.join(" ")}
          />
          <span className="sr-only">Select all rows</span>
          <span className="whitespace-nowrap text-sm tabular-nums">
            {rowsSelected.length} of {rows.length} row(s) selected.
          </span>
        </label>
        {typeof children === "function" ? children(renderProps) : children}
      </div>
    </>
  );
}
