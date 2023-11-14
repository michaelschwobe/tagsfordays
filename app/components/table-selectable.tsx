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
  Tfoot,
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
  /** Sets the thead th `class` attribute. */
  classNameMap?: Record<string, Record<string, string>>;
  /** Sets table column definitions, display templates, etc. **Required** */
  columns: ColumnDef<TData, TValue>[];
  /** Sets table data. **Required** */
  data: TData[];
}

export function TableSelectable<TData, TValue>({
  children,
  className,
  classNameMap,
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
    <TableWrapper {...props} className={cn(className)}>
      <Table>
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Th
                    className={classNameMap?.[header.id]?.["th"]}
                    key={header.id}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <ButtonColumnSort
                        className={classNameMap?.[header.id]?.["button"]}
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
                  <Td
                    className={classNameMap?.[cell.column.id]?.["td"]}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
        {children ? (
          <Tfoot>
            <Tr>
              <Td className={classNameMap?.["tfoot"]?.[0]}>
                <Checkbox
                  name="idsSelectedAll"
                  checked={table.getIsAllRowsSelected()}
                  indeterminate={table.getIsSomeRowsSelected()}
                  onCheckedChange={(checked) => {
                    const handler = table.getToggleAllRowsSelectedHandler();
                    return handler({ target: { checked } });
                  }}
                  aria-label="Select all rows"
                  aria-controls={idsSelected.join(" ")}
                />
              </Td>
              {typeof children === "function"
                ? children(renderProps)
                : children}
            </Tr>
          </Tfoot>
        ) : null}
      </Table>
    </TableWrapper>
  );
}
