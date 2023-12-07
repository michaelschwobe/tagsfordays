import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const H2 = forwardRef<
  React.ElementRef<"h2">,
  React.ComponentPropsWithoutRef<"h2">
>(({ children, className, ...props }, ref) => {
  return (
    <h2
      {...props}
      className={cn(
        "text-lg font-medium leading-none text-black dark:text-white",
        className,
      )}
      ref={ref}
    >
      {children}
    </h2>
  );
});
H2.displayName = "H2";
