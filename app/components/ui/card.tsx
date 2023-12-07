import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const CardHeader = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  return (
    <div {...props} className={cn(className)} ref={ref}>
      {children}
    </div>
  );
});
CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  return (
    <div {...props} className={cn("space-y-2", className)} ref={ref}>
      {children}
    </div>
  );
});
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  return (
    <div
      {...props}
      className={cn(
        "mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:items-center",
        className,
      )}
      ref={ref}
    >
      {children}
    </div>
  );
});
CardFooter.displayName = "CardFooter";

export const Card = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900 sm:gap-4 sm:p-6",
        className,
      )}
      ref={ref}
    >
      {children}
    </div>
  );
});
Card.displayName = "Card";
