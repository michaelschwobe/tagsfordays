import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent font-medium transition-colors focus-visible:border-pink-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50",
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
        link: "text-black underline hover:underline-offset-2",
        ghost: "text-black hover:bg-slate-100",
        outlined: "border-slate-300 bg-white text-black hover:bg-slate-100",
        filled: "bg-cyan-500 text-white hover:bg-cyan-600",
        "ghost-danger": "text-pink-600 hover:bg-slate-100",
        "outlined-danger":
          "border-slate-300 bg-white text-pink-600 hover:bg-slate-100",
        "filled-danger": "bg-pink-500 text-white hover:bg-pink-600",
      },
    },
    compoundVariants: [
      {
        size: ["sm", "md", "lg"],
        variant: "link",
        className: "px-0",
      },
      {
        size: ["sm-icon", "md-icon", "lg-icon"],
        variant: "link",
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
}

export const Button = forwardRef<React.ElementRef<"button">, ButtonProps>(
  ({ children, className, size, variant, ...props }, forwardedRef) => {
    return (
      <button
        {...props}
        className={cn(buttonVariants({ className, size, variant }))}
        ref={forwardedRef}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
