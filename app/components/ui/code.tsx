import { forwardRef } from "react";
import { cn } from "~/utils/misc";

interface CodeProps extends React.ComponentPropsWithoutRef<"code"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const Code = forwardRef<React.ElementRef<"code">, CodeProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <code
        {...props}
        className={cn(
          "inline-block rounded bg-slate-200 px-1 py-0.5 text-xs font-medium leading-none text-black dark:bg-slate-700 dark:text-slate-300",
          className,
        )}
        ref={forwardedRef}
      >
        {children}
      </code>
    );
  },
);

Code.displayName = "Code";
