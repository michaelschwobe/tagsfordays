import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export interface MainProps extends React.ComponentPropsWithoutRef<"main"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string;
}

export const Main = forwardRef<React.ElementRef<"main">, MainProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <main
        {...props}
        className={cn("p-4 sm:p-8", className)}
        ref={forwardedRef}
      >
        {children}
      </main>
    );
  },
);

Main.displayName = "Main";
