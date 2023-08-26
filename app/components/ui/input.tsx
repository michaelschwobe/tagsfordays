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
          "h-10 w-full",
          "rounded-md border border-slate-300 bg-white px-3 py-2 text-black transition-colors placeholder:italic placeholder:text-slate-400",
          "file:border-0 file:bg-transparent",
          "focus-visible:border-pink-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        name={name}
        ref={forwardedRef}
      />
    );
  },
);

Input.displayName = "Input";
