import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  /** Sets the `class` attribute. */
  className?: string;
  /** Sets the `name` attribute. **Required** */
  name: string;
}

export const Input = forwardRef<React.ElementRef<"input">, InputProps>(
  ({ className, name, ...props }, forwardedRef) => {
    return (
      <input
        {...props}
        className={cn(
          "h-10 w-80 rounded-md border border-gray-300 bg-white px-3 py-2 text-black transition-colors file:border-0 file:bg-transparent placeholder:italic placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        name={name}
        ref={forwardedRef}
      />
    );
  },
);

Input.displayName = "Input";
