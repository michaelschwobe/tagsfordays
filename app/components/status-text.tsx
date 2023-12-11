import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const StatusText = forwardRef<
  React.ElementRef<"span">,
  React.ComponentPropsWithoutRef<"span">
>(({ children, className, ...props }, ref) => {
  return (
    <span {...props} className={cn("text-xs", className)} ref={ref}>
      {typeof children === "string" ? children : "Pending"}
    </span>
  );
});
StatusText.displayName = "StatusText";
