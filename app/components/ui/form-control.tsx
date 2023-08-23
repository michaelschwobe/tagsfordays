import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export interface FormControlProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const FormControl = forwardRef<
  React.ElementRef<"div">,
  FormControlProps
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <div
      {...props}
      className={cn("flex min-h-[2.5rem] items-center gap-2", className)}
      ref={forwardedRef}
    >
      {children}
    </div>
  );
});

FormControl.displayName = "FormControl";
