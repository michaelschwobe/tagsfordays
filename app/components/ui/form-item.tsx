import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export interface FormItemProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the `class` attribute. */
  isButtonGroup?: boolean | undefined;
}

export const FormItem = forwardRef<React.ElementRef<"div">, FormItemProps>(
  ({ children, className, isButtonGroup = false, ...props }, forwardedRef) => {
    return (
      <div
        {...props}
        className={cn(
          isButtonGroup
            ? "flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between"
            : "flex flex-col gap-2",
          className,
        )}
        ref={forwardedRef}
      >
        {children}
      </div>
    );
  },
);

FormItem.displayName = "FormItem";
