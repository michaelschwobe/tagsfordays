import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const inputVariants = cva(
  "w-full max-w-sm rounded-md border border-slate-300 bg-white text-black transition-colors placeholder:italic placeholder:text-slate-400 focus-visible:border-pink-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:border-pink-500 dark:focus-visible:ring-pink-500",
  {
    variants: {
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export type InputVariants = VariantProps<typeof inputVariants>;

export interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "size">,
    InputVariants {
  /** Sets the `class` attribute. */
  className?: string;
  /** Sets the `name` attribute. **Required** */
  name: string;
}

export const Input = forwardRef<React.ElementRef<"input">, InputProps>(
  ({ className, name, size, ...props }, forwardedRef) => {
    return (
      <input
        {...props}
        className={cn(
          inputVariants({
            className: clsx("file:border-0 file:bg-transparent", className),
            size,
          }),
        )}
        name={name}
        ref={forwardedRef}
      />
    );
  },
);

Input.displayName = "Input";
