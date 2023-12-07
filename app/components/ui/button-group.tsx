import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "~/utils/misc";

const buttonGroupItemVariants = cva(
  "inline-flex h-full grow cursor-pointer items-center justify-center gap-2 rounded-sm border border-transparent px-3 py-1 text-sm font-medium text-black transition-all hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-600",
  {
    variants: {
      variant: {
        button:
          "focus-visible:border-pink-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 aria-[pressed=true]:bg-white aria-[pressed=true]:text-black dark:focus-visible:border-pink-500 dark:focus-visible:ring-pink-500 dark:aria-[pressed=true]:bg-slate-800 dark:aria-[pressed=true]:text-white",
        input:
          "focus-within:border-pink-500 focus-within:outline-none focus-within:ring-1 focus-within:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:border-pink-500 dark:focus-visible:ring-pink-500 [&:has(:checked)]:bg-white [&:has(:checked)]:text-black dark:[&:has(:checked)]:bg-slate-800 dark:[&:has(:checked)]:text-white",
      },
    },
  },
);

export const ButtonGroupButton = forwardRef<
  React.ElementRef<"button">,
  React.ComponentPropsWithoutRef<"button"> & { "aria-pressed": boolean }
>(({ children, className, "aria-pressed": ariaPressed, ...props }, ref) => {
  return (
    <button
      {...props}
      type={ariaPressed ? "button" : "submit"}
      aria-pressed={ariaPressed}
      className={cn(buttonGroupItemVariants({ className, variant: "button" }))}
      ref={ref}
    >
      {children}
    </button>
  );
});
ButtonGroupButton.displayName = "ButtonGroupButton";

export const ButtonGroupInput = forwardRef<
  React.ElementRef<"input">,
  React.ComponentPropsWithoutRef<"input"> & { type: "checkbox" | "radio" }
>(({ children, className, id, type, ...props }, ref) => {
  return (
    <label
      htmlFor={id}
      className={cn(buttonGroupItemVariants({ className, variant: "input" }))}
    >
      <input {...props} type={type} className="sr-only" id={id} ref={ref} />
      <span>{children}</span>
    </label>
  );
});
ButtonGroupInput.displayName = "ButtonGroupInput";

export const ButtonGroup = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  return (
    <div
      {...props}
      className={cn(
        "inline-flex h-10 items-center gap-1 rounded-md bg-slate-200 p-1 dark:bg-slate-700 max-sm:w-full",
        className,
      )}
      ref={ref}
    >
      {children}
    </div>
  );
});
ButtonGroup.displayName = "ButtonGroup";
