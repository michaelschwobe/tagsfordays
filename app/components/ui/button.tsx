import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md border border-transparent font-medium transition-colors focus-visible:border-pink-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:border-pink-500 dark:focus-visible:ring-pink-500",
  {
    variants: {
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-11 px-5",
        "sm-icon": "h-9 w-9 min-w-[2.25rem] text-sm",
        "md-icon": "h-10 w-10 min-w-[2.5rem]",
        "lg-icon": "h-11 w-11 min-w-[2.75rem]",
      },
      variant: {
        link: "text-black dark:text-white",
        ghost:
          "text-black hover:bg-slate-100 dark:text-white dark:hover:bg-slate-900",
        outlined:
          "border-slate-300 bg-white text-black hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-900",
        filled:
          "bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-cyan-700 dark:text-white dark:hover:bg-cyan-800",
        "link-danger": "text-pink-600 dark:text-pink-500",
        "ghost-danger":
          "text-pink-600 hover:bg-slate-100 dark:text-pink-500 dark:hover:bg-slate-900",
        "outlined-danger":
          "border-slate-300 bg-white text-pink-600 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-pink-500 dark:hover:bg-slate-900",
        "filled-danger":
          "bg-pink-500 text-white hover:bg-pink-600 dark:focus-visible:border-cyan-500 dark:focus-visible:ring-cyan-500",
        "link-warning": "text-yellow-600 dark:text-yellow-500",
        "ghost-warning":
          "text-yellow-600 hover:bg-slate-100 dark:text-yellow-500 dark:hover:bg-slate-900",
        "outlined-warning":
          "border-slate-300 bg-white text-yellow-600 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-yellow-500 dark:hover:bg-slate-900",
        "filled-warning":
          "bg-yellow-500 text-white hover:bg-yellow-600 dark:focus-visible:border-cyan-500 dark:focus-visible:ring-cyan-500",
        "link-success": "text-green-600 dark:text-green-500",
        "ghost-success":
          "text-green-600 hover:bg-slate-100 dark:text-green-500 dark:hover:bg-slate-900",
        "outlined-success":
          "border-slate-300 bg-white text-green-600 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-green-500 dark:hover:bg-slate-900",
        "filled-success":
          "bg-green-500 text-white hover:bg-green-600 dark:focus-visible:border-cyan-500 dark:focus-visible:ring-cyan-500",
      },
    },
    compoundVariants: [
      {
        variant: ["link", "link-danger"],
        className: "underline hover:underline-offset-2",
      },
      {
        size: ["sm", "md", "lg"],
        variant: ["link", "link-danger"],
        className: "px-0",
      },
      {
        size: ["sm-icon", "md-icon", "lg-icon"],
        variant: ["link", "link-danger"],
        className: "w-auto",
      },
    ],
    defaultVariants: {
      size: "md",
      variant: "outlined",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    ButtonVariants {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the `type` attribute. **Required** */
  type: "button" | "submit";
}

export const Button = forwardRef<React.ElementRef<"button">, ButtonProps>(
  ({ children, className, size, type, variant, ...props }, forwardedRef) => {
    return (
      <button
        {...props}
        type={type}
        className={cn(buttonVariants({ className, size, variant }))}
        ref={forwardedRef}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
