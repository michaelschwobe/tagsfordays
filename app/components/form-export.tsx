import { Form } from "@remix-run/react";
import { forwardRef } from "react";
import type { BookmarkExportFileExtension } from "~/utils/bookmark";

export interface FormExportProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Form>,
    "action" | "method" | "reloadDocument"
  > {
  /** Sets the form `action` attribute. **Required** */
  actionRoute: string;
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the content and form `action` attribute. **Required** */
  fileExtension: BookmarkExportFileExtension;
  /** Sets the input[hidden] `value` attribute. **Required** */
  idsSelected: string[];
}

export const FormExport = forwardRef<
  React.ElementRef<typeof Form>,
  FormExportProps
>(
  (
    { actionRoute, children, fileExtension, idsSelected, ...props },
    forwardedRef,
  ) => {
    return (
      <Form
        {...props}
        method="POST"
        action={[actionRoute, fileExtension].join(".")}
        reloadDocument
        ref={forwardedRef}
      >
        <input type="hidden" name="ids-selected" value={idsSelected} />
        {children}
      </Form>
    );
  },
);

FormExport.displayName = "FormExport";
