import { forwardRef } from "react";
import { cn } from "~/utils/misc";

interface LabelProps extends React.ComponentPropsWithoutRef<"label"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the `for` attribute. **Required** */
  htmlFor: string | undefined;
}

export const Label = forwardRef<React.ElementRef<"label">, LabelProps>(
  ({ children, className, htmlFor, ...props }, forwardedRef) => {
    return (
      <label
        {...props}
        className={cn("text-sm font-medium", className)}
        htmlFor={htmlFor}
        ref={forwardedRef}
      >
        {children}
      </label>
    );
  },
);

Label.displayName = "Label";
