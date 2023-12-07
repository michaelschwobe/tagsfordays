import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const FormItem = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    isButtonGroup?: boolean | undefined;
  }
>(({ children, className, isButtonGroup = false, ...props }, ref) => {
  return (
    <div
      {...props}
      className={cn(
        isButtonGroup
          ? "flex flex-col gap-2 pt-2 sm:flex-row sm:items-center"
          : "flex flex-col gap-2",
        className,
      )}
      ref={ref}
    >
      {children}
    </div>
  );
});
FormItem.displayName = "FormItem";
