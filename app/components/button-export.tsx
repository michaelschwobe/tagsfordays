import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import type { BookmarkExportFileExtension } from "~/utils/bookmark";
import { BOOKMARK_EXPORT_FILE_TYPE_MAP } from "~/utils/bookmark";

export interface ButtonExportProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "children" | "size" | "value" | "variant"
  > {
  /** Sets the content and form `action` attribute. **Required** */
  fileExtension: BookmarkExportFileExtension;
}

export const ButtonExport = forwardRef<
  React.ElementRef<typeof Button>,
  ButtonExportProps
>(({ fileExtension, ...props }, forwardedRef) => {
  const fileType = BOOKMARK_EXPORT_FILE_TYPE_MAP[fileExtension];
  return (
    <Button {...props} size="sm" ref={forwardedRef}>
      <Icon type="download" />
      <span className="sr-only">Export data to a </span>
      {fileType}
      <span className="sr-only"> file</span>
    </Button>
  );
});

ButtonExport.displayName = "ButtonExport";
