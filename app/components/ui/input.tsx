import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the `name` attribute. **Required** */
  name: string;
}

export const Input = forwardRef<React.ElementRef<"input">, InputProps>(
  ({ className, name, ...props }, forwardedRef) => {
    return (
      <input
        {...props}
        className={cn(
          "h-10 w-full max-w-md rounded-md border border-slate-300 bg-white px-4 text-black transition-colors placeholder:italic placeholder:text-slate-400 focus-visible:border-pink-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:border-pink-500 dark:focus-visible:ring-pink-500",
          "file:-ml-4 file:mr-4 file:h-full file:border-0 file:bg-cyan-500 file:px-4 file:py-0 file:font-medium file:text-white hover:file:bg-cyan-600 dark:file:bg-cyan-700 dark:file:text-white dark:file:hover:bg-cyan-800",
          className,
        )}
        name={name}
        ref={forwardedRef}
      />
    );
  },
);

Input.displayName = "Input";
