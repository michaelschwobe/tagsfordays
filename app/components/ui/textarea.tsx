import clsx from "clsx";
import { forwardRef } from "react";
import type { InputVariants } from "~/components/ui/input";
import { inputVariants } from "~/components/ui/input";
import { cn } from "~/utils/misc";

export interface TextareaProps
  extends Omit<React.ComponentPropsWithoutRef<"textarea">, "size">,
    InputVariants {
  /** Sets the `class` attribute. */
  className?: string;
  /** Sets the `name` attribute. **Required** */
  name: string;
}

export const Textarea = forwardRef<React.ElementRef<"textarea">, TextareaProps>(
  ({ className, name, size, ...props }, forwardedRef) => {
    return (
      <textarea
        {...props}
        className={cn(
          inputVariants({
            className: clsx("h-20 min-h-[5rem] max-w-3xl", className),
            size,
          }),
        )}
        name={name}
        ref={forwardedRef}
      />
    );
  },
);

Textarea.displayName = "Textarea";
