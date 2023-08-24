import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export interface BadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const Badge = forwardRef<React.ElementRef<"span">, BadgeProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <span
        {...props}
        className={cn(
          "inline-flex items-center rounded bg-gray-300 px-1 py-0.5 text-xs font-medium leading-none text-black",
          className,
        )}
        ref={forwardedRef}
      >
        <span className="sr-only">(</span>
        {children}
        <span className="sr-only">)</span>
      </span>
    );
  },
);

Badge.displayName = "Badge";
