import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const H1 = forwardRef<
  React.ElementRef<"h1">,
  React.ComponentPropsWithoutRef<"h1">
>(({ children, className, ...props }, ref) => {
  return (
    <h1
      {...props}
      className={cn(
        "mr-auto flex min-h-[2.5rem] items-center gap-2 text-2xl font-medium leading-none text-black dark:text-white",
        className,
      )}
      ref={ref}
    >
      {children}
    </h1>
  );
});
H1.displayName = "H1";
