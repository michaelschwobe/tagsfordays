import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export interface TextareaProps
  extends React.ComponentPropsWithoutRef<"textarea"> {
  /** Sets the `class` attribute. */
  className?: string;
  /** Sets the `name` attribute. **Required** */
  name: string;
}

export const Textarea = forwardRef<React.ElementRef<"textarea">, TextareaProps>(
  ({ className, name, ...props }, forwardedRef) => {
    return (
      <textarea
        {...props}
        className={cn(
          "min-h-[5rem] w-full",
          "rounded-md border border-slate-300 bg-white px-3 py-2 text-black transition-colors placeholder:italic placeholder:text-slate-400",
          "focus-visible:border-pink-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        name={name}
        ref={forwardedRef}
      />
    );
  },
);

Textarea.displayName = "Textarea";
