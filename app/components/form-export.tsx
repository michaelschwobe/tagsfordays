import { Form } from "@remix-run/react";
import { forwardRef } from "react";
import type { BookmarkExportFileExtension } from "~/utils/bookmark";

export const FormExport = forwardRef<
  React.ElementRef<typeof Form>,
  Omit<
    React.ComponentPropsWithoutRef<typeof Form>,
    "action" | "method" | "reloadDocument"
  > & {
    actionRoute: string;
    children: React.ReactNode;
    fileExtension: BookmarkExportFileExtension;
    idsSelected: string[];
  }
>(({ actionRoute, children, fileExtension, idsSelected, ...props }, ref) => {
  return (
    <Form
      {...props}
      method="POST"
      action={[actionRoute, fileExtension].join(".")}
      reloadDocument
      ref={ref}
    >
      <input type="hidden" name="ids-selected" value={idsSelected} hidden />
      {children}
    </Form>
  );
});
FormExport.displayName = "FormExport";
