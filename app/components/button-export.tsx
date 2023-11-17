import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import type { BookmarkExportFileExtension } from "~/utils/bookmark";
import { BOOKMARK_EXPORT_LABEL_MAP } from "~/utils/bookmark";

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
  const ext = BOOKMARK_EXPORT_LABEL_MAP[fileExtension];
  return (
    <Button {...props} size="sm" ref={forwardedRef}>
      <Icon type="download" />
      <span className="sr-only">Export {ext} file</span>
      <span aria-hidden>{ext}</span>
    </Button>
  );
});

ButtonExport.displayName = "ButtonExport";
