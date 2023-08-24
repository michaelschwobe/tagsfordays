import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export interface H2Props extends React.ComponentPropsWithoutRef<"h2"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const H2 = forwardRef<React.ElementRef<"h2">, H2Props>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <h2
        {...props}
        className={cn("text-lg font-medium text-black", className)}
        ref={forwardedRef}
      >
        {children}
      </h2>
    );
  },
);

H2.displayName = "H2";
