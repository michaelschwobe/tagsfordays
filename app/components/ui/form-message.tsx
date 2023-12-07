import { forwardRef } from "react";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/misc";

export const FormMessage = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, id, ...props }, ref) => {
  if (!children) {
    return null;
  }

  return (
    <div
      {...props}
      id={id}
      className={cn(
        "flex items-baseline gap-1 text-sm text-pink-600 dark:text-pink-500",
        className,
      )}
      ref={ref}
    >
      <Icon className="translate-y-0.5" type="alert-triangle" />
      <span>{children}</span>
    </div>
  );
});
FormMessage.displayName = "FormMessage";
