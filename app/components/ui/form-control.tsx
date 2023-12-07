import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const FormControl = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  return (
    <div
      {...props}
      className={cn("flex min-h-[2.5rem] items-center gap-2", className)}
      ref={ref}
    >
      {children}
    </div>
  );
});
FormControl.displayName = "FormControl";
