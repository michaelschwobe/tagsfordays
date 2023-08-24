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
          "min-h-[5rem] w-80 rounded-md border border-gray-300 bg-white px-3 py-2 text-black transition-colors file:border-0 file:bg-transparent placeholder:italic placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        name={name}
        ref={forwardedRef}
      />
    );
  },
);

Textarea.displayName = "Textarea";
