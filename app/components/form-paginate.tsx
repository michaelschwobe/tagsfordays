import { Form } from "@remix-run/react";
import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const FormPaginate = forwardRef<
  React.ElementRef<typeof Form>,
  Omit<
    React.ComponentPropsWithoutRef<typeof Form>,
    "method" | "preventScrollReset" | "replace"
  >
>(({ children, className, ...props }, ref) => {
  return (
    <Form
      {...props}
      method="GET"
      preventScrollReset
      replace
      className={cn(className)}
      data-testid="form-paginate"
      ref={ref}
    >
      {children}
    </Form>
  );
});
FormPaginate.displayName = "FormPaginate";
