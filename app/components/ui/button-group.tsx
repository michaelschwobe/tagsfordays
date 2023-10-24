import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const buttonGroupItemVariants = cva(
  "inline-flex h-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-transparent px-3 py-1 text-sm font-medium text-black transition-all hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-600",
  {
    variants: {
      variant: {
        button:
          "focus-visible:border-pink-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 aria-[pressed=true]:bg-white aria-[pressed=true]:text-black dark:focus-visible:border-pink-500 dark:focus-visible:ring-pink-500 dark:aria-[pressed=true]:bg-slate-800 dark:aria-[pressed=true]:text-white",
        radio:
          "focus-within:border-pink-500 focus-within:outline-none focus-within:ring-1 focus-within:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:border-pink-500 dark:focus-visible:ring-pink-500 [&:has(:checked)]:bg-white [&:has(:checked)]:text-black dark:[&:has(:checked)]:bg-slate-800 dark:[&:has(:checked)]:text-white",
      },
    },
  },
);

export interface ButtonGroupButtonProps
  extends React.ComponentPropsWithoutRef<"button"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the `type` and `aria-pressed` attribute. */
  "aria-pressed": boolean;
}

export const ButtonGroupButton = forwardRef<
  React.ElementRef<"button">,
  ButtonGroupButtonProps
>(
  (
    { children, className, "aria-pressed": ariaPressed, ...props },
    forwardedRef,
  ) => {
    return (
      <button
        {...props}
        className={cn(
          buttonGroupItemVariants({ className, variant: "button" }),
        )}
        type={ariaPressed ? "button" : "submit"}
        aria-pressed={ariaPressed}
        ref={forwardedRef}
      >
        {children}
      </button>
    );
  },
);

ButtonGroupButton.displayName = "ButtonGroupButton";

export interface ButtonGroupRadioProps
  extends React.ComponentPropsWithoutRef<"input"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const ButtonGroupRadio = forwardRef<
  React.ElementRef<"input">,
  ButtonGroupRadioProps
>(({ children, className, id, ...props }, forwardedRef) => {
  return (
    <label
      className={cn(buttonGroupItemVariants({ className, variant: "radio" }))}
      htmlFor={id}
    >
      <input {...props} className="sr-only" id={id} ref={forwardedRef} />
      <span>{children}</span>
    </label>
  );
});

ButtonGroupRadio.displayName = "ButtonGroupRadio";

export interface ButtonGroupProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const ButtonGroup = forwardRef<
  React.ElementRef<"div">,
  ButtonGroupProps
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <div
      {...props}
      className={cn(
        "inline-flex h-10 items-center gap-1 rounded-md bg-slate-200 p-1 dark:bg-slate-700 max-sm:w-full",
        className,
      )}
      ref={forwardedRef}
    >
      {children}
    </div>
  );
});

ButtonGroup.displayName = "ButtonGroup";
