import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const FormDescription = forwardRef<
  React.ElementRef<"p">,
  React.ComponentPropsWithoutRef<"p">
>(({ children, className, id, ...props }, ref) => {
  return (
    <p {...props} id={id} className={cn("text-sm", className)} ref={ref}>
      {children}
    </p>
  );
});
FormDescription.displayName = "FormDescription";
