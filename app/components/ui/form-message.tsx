import { forwardRef } from "react";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/misc";

export interface FormMessageProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /** Sets the content. **Required** */
  children: React.ReactNode | null;
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the `id` attribute. **Required** */
  id: string | undefined;
}

export const FormMessage = forwardRef<
  React.ElementRef<"div">,
  FormMessageProps
>(({ children, className, id, ...props }, forwardedRef) => {
  if (!children) {
    return null;
  }

  return (
    <div
      {...props}
      className={cn("flex items-baseline gap-2 text-sm", className)}
      id={id}
      ref={forwardedRef}
    >
      <Icon className="translate-y-0.5" type="alert-triangle" />
      <span>{children}</span>
    </div>
  );
});

FormMessage.displayName = "FormMessage";
