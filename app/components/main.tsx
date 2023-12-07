import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const Main = forwardRef<
  React.ElementRef<"main">,
  React.ComponentPropsWithoutRef<"main">
>(({ children, className, ...props }, ref) => {
  return (
    <main
      {...props}
      className={cn("space-y-4 p-4 sm:space-y-8 sm:p-8", className)}
      ref={ref}
    >
      {children}
    </main>
  );
});
Main.displayName = "Main";
