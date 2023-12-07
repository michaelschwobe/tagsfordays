import { Link } from "@remix-run/react";
import { forwardRef } from "react";
import { buttonVariants, type ButtonVariants } from "~/components/ui/button";
import { cn } from "~/utils/misc";

export const LinkButton = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<typeof Link> & ButtonVariants
>(({ children, className, size, variant, ...props }, ref) => {
  return (
    <Link
      {...props}
      className={cn(buttonVariants({ className, size, variant }))}
      ref={ref}
    >
      {children}
    </Link>
  );
});
LinkButton.displayName = "LinkButton";
