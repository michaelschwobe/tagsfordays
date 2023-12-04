import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "~/utils/misc";

const badgeVariants = cva(
  "inline-block rounded px-1 py-0.5 text-center text-xs font-medium tabular-nums leading-none text-black",
  {
    variants: {
      variant: {
        normal: "bg-slate-200 dark:bg-slate-500",
        danger: "bg-pink-200 dark:bg-pink-500",
        warning: "bg-yellow-200  dark:bg-yellow-500",
        success: "bg-green-200 dark:bg-green-500",
      },
    },
    defaultVariants: {
      variant: "normal",
    },
  },
);

type BadgeVariants = VariantProps<typeof badgeVariants>;

interface BadgeProps
  extends React.ComponentPropsWithoutRef<"span">,
    BadgeVariants {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const Badge = forwardRef<React.ElementRef<"span">, BadgeProps>(
  ({ children, className, variant, ...props }, forwardedRef) => {
    return (
      <span
        {...props}
        className={cn(badgeVariants({ className, variant }))}
        ref={forwardedRef}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
