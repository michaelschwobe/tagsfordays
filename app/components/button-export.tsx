import { Form } from "@remix-run/react";
import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import type { BookmarkExportFileExtension } from "~/utils/bookmark";
import { BOOKMARK_EXPORT_LABEL_MAP } from "~/utils/bookmark";
import { cn } from "~/utils/misc";

export interface TableButtonExportProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "children" | "size" | "type" | "variant" | "value"
  > {
  /** Sets the form `action` attribute. **Required** */
  actionRoute: string;
  /** Sets the content and form `action` attribute. **Required** */
  fileExtension: BookmarkExportFileExtension;
  /** Sets the input[hidden] `value` attribute. **Required** */
  idsSelected: string[];
}

export const TableButtonExport = forwardRef<
  React.ElementRef<typeof Button>,
  TableButtonExportProps
>(
  (
    { actionRoute, className, fileExtension, idsSelected, ...props },
    forwardedRef,
  ) => {
    return (
      <Form
        method="POST"
        action={[actionRoute, fileExtension].join(".")}
        reloadDocument
      >
        <input type="hidden" name="ids-selected" value={idsSelected} />
        <Button
          {...props}
          type="submit"
          variant="ghost"
          size="sm"
          className={cn(className)}
          ref={forwardedRef}
        >
          <Icon type="download" />
          <span className="sr-only">Export </span>
          {BOOKMARK_EXPORT_LABEL_MAP[fileExtension]}
        </Button>
      </Form>
    );
  },
);

TableButtonExport.displayName = "TableButtonExport";
