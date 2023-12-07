import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const Code = forwardRef<
  React.ElementRef<"code">,
  React.ComponentPropsWithoutRef<"code">
>(({ children, className, ...props }, ref) => {
  return (
    <code
      {...props}
      className={cn(
        "inline-block rounded bg-slate-200 px-1 py-0.5 text-xs font-medium leading-none text-black dark:bg-slate-700 dark:text-slate-300",
        className,
      )}
      ref={ref}
    >
      {children}
    </code>
  );
});
Code.displayName = "Code";
