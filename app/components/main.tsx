import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export interface MainProps extends React.ComponentPropsWithoutRef<"main"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const Main = forwardRef<React.ElementRef<"main">, MainProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <main
        {...props}
        className={cn("space-y-4 p-4 sm:space-y-8 sm:p-8", className)}
        ref={forwardedRef}
      >
        {children}
      </main>
    );
  },
);

Main.displayName = "Main";
