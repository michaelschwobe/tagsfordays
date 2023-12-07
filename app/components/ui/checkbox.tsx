import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { forwardRef } from "react";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/misc";

export const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    indeterminate?: boolean | undefined;
    onCheckedChange: NonNullable<
      CheckboxPrimitive.CheckboxProps["onCheckedChange"]
    >;
  }
>(({ className, checked, indeterminate, onCheckedChange, ...props }, ref) => {
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
      ref={ref}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Icon
          type={isIndeterminate ? "minus" : "check"}
          className="h-full w-full"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = "Checkbox";
