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

export type BadgeVariants = VariantProps<typeof badgeVariants>;

export const Badge = forwardRef<
  React.ElementRef<"span">,
  React.ComponentPropsWithoutRef<"span"> & VariantProps<typeof badgeVariants>
>(({ children, className, variant, ...props }, ref) => {
  return (
    <span
      {...props}
      className={cn(badgeVariants({ className, variant }))}
      ref={ref}
    >
      {children}
    </span>
  );
});
Badge.displayName = "Badge";
