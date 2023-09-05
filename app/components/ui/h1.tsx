import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export interface H1Props extends React.ComponentPropsWithoutRef<"h1"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const H1 = forwardRef<React.ElementRef<"h1">, H1Props>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <h1
        {...props}
        className={cn(
          "mr-auto flex min-h-[2.5rem] items-center gap-2 text-2xl font-medium leading-none text-black dark:text-white",
          className,
        )}
        ref={forwardedRef}
      >
        {children}
      </h1>
    );
  },
);

H1.displayName = "H1";
