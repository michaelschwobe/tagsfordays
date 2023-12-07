import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const FormLabel = forwardRef<
  React.ElementRef<"label">,
  React.ComponentPropsWithoutRef<"label">
>(({ children, className, htmlFor, ...props }, ref) => {
  return (
    <label
      {...props}
      htmlFor={htmlFor}
      className={cn("text-sm font-medium", className)}
      ref={ref}
    >
      {children}
    </label>
  );
});
FormLabel.displayName = "FormLabel";
