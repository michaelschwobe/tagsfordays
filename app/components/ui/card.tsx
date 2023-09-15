import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export interface CardHeaderProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const CardHeader = forwardRef<React.ElementRef<"div">, CardHeaderProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <div {...props} className={cn(className)} ref={forwardedRef}>
        {children}
      </div>
    );
  },
);

CardHeader.displayName = "CardHeader";

export interface CardContentProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const CardContent = forwardRef<
  React.ElementRef<"div">,
  CardContentProps
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <div {...props} className={cn(className)} ref={forwardedRef}>
      {children}
    </div>
  );
});

CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const CardFooter = forwardRef<React.ElementRef<"div">, CardFooterProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <div
        {...props}
        className={cn(
          "mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:items-center",
          className,
        )}
        ref={forwardedRef}
      >
        {children}
      </div>
    );
  },
);

CardFooter.displayName = "CardFooter";

export interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const Card = forwardRef<React.ElementRef<"div">, CardProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <div
        {...props}
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900 sm:gap-4 sm:p-6",
          className,
        )}
        ref={forwardedRef}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
