import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { forwardRef } from "react";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/misc";

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the `aria-checked` attribute to "mixed". */
  indeterminate?: boolean | undefined;
  /** Binds the `checked` attribute to external control. */
  onCheckedChange: NonNullable<
    CheckboxPrimitive.CheckboxProps["onCheckedChange"]
  >;
}

export const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    { className, checked, indeterminate, onCheckedChange, ...props },
    forwardedRef,
  ) => {
    const isIndeterminate = !checked && indeterminate === true;
    const isChecked = checked === true;
    const checkedProp = isIndeterminate ? "indeterminate" : isChecked;

    return (
      <CheckboxPrimitive.Root
        {...props}
        checked={checkedProp}
        onCheckedChange={onCheckedChange}
        className={cn(
          "h-4 w-4 shrink-0 rounded border border-slate-300 bg-white p-0.5 text-black transition-colors hover:bg-slate-100 focus-visible:border-pink-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-transparent data-[state=checked]:bg-cyan-500 data-[state=checked]:text-white data-[state=checked]:hover:bg-cyan-600 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-900 dark:focus-visible:border-pink-500 dark:focus-visible:ring-pink-500 dark:data-[state=checked]:border-transparent dark:data-[state=checked]:bg-cyan-700 dark:data-[state=checked]:text-white dark:data-[state=checked]:hover:bg-cyan-800",
          className,
        )}
        ref={forwardedRef}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          <Icon
            className="h-full w-full"
            type={isIndeterminate ? "minus" : "check"}
          />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  },
);

Checkbox.displayName = "Checkbox";
