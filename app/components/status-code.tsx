import { forwardRef } from "react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/utils/misc";

export const StatusCode = forwardRef<
  React.ElementRef<"span">,
  Omit<React.ComponentPropsWithoutRef<typeof Badge>, "variant">
>(({ children, className, ...props }, ref) => {
  return (
    <Badge
      {...props}
      aria-hidden={typeof children !== "number"}
      variant={
        typeof children !== "number"
          ? undefined
          : children >= 200 && children <= 299
            ? "success"
            : children <= 499
              ? "warning"
              : "danger"
      }
      className={cn(
        typeof children === "number" ? null : "text-transparent",
        className,
      )}
      ref={ref}
    >
      {typeof children === "number" ? children : "000"}
    </Badge>
  );
});
StatusCode.displayName = "StatusCode";
