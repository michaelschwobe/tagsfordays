import { Link, type LinkProps } from "@remix-run/react";
import { forwardRef } from "react";
import { buttonVariants, type ButtonVariants } from "~/components/ui/button";
import { cn } from "~/utils/misc";

interface LinkButtonProps extends LinkProps, ButtonVariants {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const LinkButton = forwardRef<React.ElementRef<"a">, LinkButtonProps>(
  ({ children, className, size, variant, ...props }, forwardedRef) => {
    return (
      <Link
        {...props}
        className={cn(buttonVariants({ className, size, variant }))}
        ref={forwardedRef}
      >
        {children}
      </Link>
    );
  },
);

LinkButton.displayName = "LinkButton";
