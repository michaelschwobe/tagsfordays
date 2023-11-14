import type { ColumnDef } from "@tanstack/react-table";
import { TableButtonExport } from "~/components/button-export";
import {
  columnBookmarkTitle,
  columnBookmarkUrl,
  columnBookmarksFavorite,
  columnCreatedAt,
  columnSelectable,
  columnTagRelations,
} from "~/components/table-columns";
import { TableSelectable } from "~/components/table-selectable";
import { Td } from "~/components/ui/table";
import type { getBookmarks } from "~/models/bookmark.server";
import type { ItemWithFaviconSrcProp } from "~/models/favicon.server";
import { BOOKMARK_EXPORT_FILE_EXTENSIONS } from "~/utils/bookmark";
import { cn } from "~/utils/misc";

// TODO: Move classNames back into table.
const classNameMap = {
  title: {
    button: "justify-start",
  },
  url: {
    th: "w-full",
    button: "justify-start",
  },
};

// TODO: Refactor table types.
type GetBookmarksData = Awaited<ReturnType<typeof getBookmarks>>;
type GetBookmarksDataItem = GetBookmarksData[0];
type GetBookmarksDataItemPatched = Omit<GetBookmarksDataItem, "createdAt"> & {
  createdAt: Date | string; // 🤷‍♂️ Patched with string type.
};
type ColumnData = GetBookmarksDataItemPatched & ItemWithFaviconSrcProp;

// TODO: Remove ts-expect-error(s) once this is fixed.
// 🤷‍♂️ Flagged as a TS error and ts-expect-error doesn't work, leaving as is.
// See node module bug https://github.com/TanStack/table/issues/5135
export const columnsTableBookmarks: ColumnDef<ColumnData>[] = [
  // @ts-expect-error - see comment above
  columnSelectable,
  // @ts-expect-error - see comment above
  columnBookmarkTitle,
  // @ts-expect-error - see comment above
  columnBookmarkUrl,
  // @ts-expect-error - see comment above
  columnCreatedAt,
  // @ts-expect-error - see comment above
  columnTagRelations,
  // @ts-expect-error - see comment above
  columnBookmarksFavorite,
];

export interface TableBookmarksProps<TData, TValue>
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets table column definitions, display templates, etc. **Required** */
  columns: ColumnDef<TData, TValue>[];
  /** Sets table data. **Required** */
  data: TData[];
}

export function TableBookmarks<TData, TValue>({
  className,
  columns,
  data,
  ...props
}: TableBookmarksProps<TData, TValue>) {
  return (
    <TableSelectable
      {...props}
      className={cn(className)}
      classNameMap={classNameMap}
      columns={columns}
      data={data}
    >
      {({ idsSelected, idsNotSelected }) => (
        <>
          <Td colSpan={5}>
            <div className="flex items-center gap-4">
              <div className="ml-3 whitespace-nowrap">
                {idsSelected.length} Selected
              </div>
              <div className="flex items-center gap-1">
                {BOOKMARK_EXPORT_FILE_EXTENSIONS.map((ext) => (
                  <TableButtonExport
                    key={ext}
                    actionRoute="/bookmarks"
                    fileExtension={ext}
                    idsSelected={
                      idsSelected.length > 0 ? idsSelected : idsNotSelected
                    }
                  />
                ))}
              </div>
            </div>
          </Td>
        </>
      )}
    </TableSelectable>
  );
}
