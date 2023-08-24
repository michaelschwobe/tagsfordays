import { Link, type LinkProps } from "@remix-run/react";
import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export interface LinkButtonProps extends LinkProps {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string;
}

export const LinkButton = forwardRef<React.ElementRef<"a">, LinkButtonProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <Link
        {...props}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-gray-300 px-3 py-2 font-medium text-black transition-colors disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        ref={forwardedRef}
      >
        {children}
      </Link>
    );
  },
);

LinkButton.displayName = "LinkButton";
