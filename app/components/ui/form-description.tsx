import { forwardRef } from "react";
import { cn } from "~/utils/misc";

interface FormDescriptionProps extends React.ComponentPropsWithoutRef<"p"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the `id` attribute. **Required** */
  id: string | undefined;
}

export const FormDescription = forwardRef<
  React.ElementRef<"p">,
  FormDescriptionProps
>(({ children, className, id, ...props }, forwardedRef) => {
  return (
    <p
      {...props}
      className={cn("text-sm", className)}
      id={id}
      ref={forwardedRef}
    >
      {children}
    </p>
  );
});

FormDescription.displayName = "FormDescription";
