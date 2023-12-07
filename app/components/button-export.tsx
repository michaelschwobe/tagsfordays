import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import type { BookmarkExportFileExtension } from "~/utils/bookmark";
import { BOOKMARK_EXPORT_FILE_TYPE_MAP } from "~/utils/bookmark";

export const ButtonExport = forwardRef<
  React.ElementRef<typeof Button>,
  Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "children" | "size" | "value" | "variant"
  > & {
    fileExtension: BookmarkExportFileExtension;
  }
>(({ fileExtension, ...props }, ref) => {
  const fileType = BOOKMARK_EXPORT_FILE_TYPE_MAP[fileExtension];
  return (
    <Button {...props} size="sm" ref={ref}>
      <Icon type="download" />
      <span className="sr-only">Export data to a </span>
      {fileType}
      <span className="sr-only"> file</span>
    </Button>
  );
});
ButtonExport.displayName = "ButtonExport";
