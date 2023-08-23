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
          isButtonGroup ? "grid grid-cols-2 gap-2" : "flex flex-col gap-1",
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
