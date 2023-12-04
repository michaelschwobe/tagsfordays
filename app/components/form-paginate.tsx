import { Form } from "@remix-run/react";
import { forwardRef } from "react";
import { cn } from "~/utils/misc";

interface FormPaginateProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Form>,
    "method" | "preventScrollReset" | "replace"
  > {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const FormPaginate = forwardRef<
  React.ElementRef<typeof Form>,
  FormPaginateProps
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <Form
      {...props}
      method="GET"
      preventScrollReset
      replace
      className={cn(className)}
      data-testid="form-paginate"
      ref={forwardedRef}
    >
      {children}
    </Form>
  );
});

FormPaginate.displayName = "FormPaginate";
