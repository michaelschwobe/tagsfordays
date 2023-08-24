import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const Button = forwardRef<React.ElementRef<"button">, ButtonProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <button
        {...props}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-gray-300 px-3 py-2 font-medium text-black transition-colors disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        ref={forwardedRef}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
