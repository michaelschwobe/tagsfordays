import * as SelectPrimitive from "@radix-ui/react-select";
import { forwardRef } from "react";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/misc";

const Select = SelectPrimitive.Root;

const SelectTrigger = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    {...props}
    className={cn(
      "flex h-10 w-full max-w-md items-center justify-between rounded-md border border-slate-300 bg-white px-4 text-black transition-colors focus-visible:border-pink-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:italic data-[placeholder]:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus-visible:border-pink-500 dark:focus-visible:ring-pink-500 dark:data-[placeholder]:text-slate-500",
      className,
    )}
    ref={ref}
  >
    <span className="-mr-10 block max-w-[calc(100%-1.5rem)] truncate">
      {children}
    </span>
    <SelectPrimitive.Icon asChild>
      <Icon className="text-black dark:text-white" type="chevron-down" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectValue = SelectPrimitive.Value;

const SelectContent = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      {...props}
      position={position}
      className={cn(
        "relative z-50 w-full max-w-md overflow-hidden rounded-md bg-white text-black shadow ring-1 ring-inset ring-slate-300 transition-all dark:bg-slate-800 dark:text-white dark:ring-slate-600",
        position === "popper"
          ? "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
          : undefined,

        className,
      )}
      ref={ref}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1.5",
          position === "popper"
            ? "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
            : undefined,
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectItem = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    {...props}
    className={cn(
      "flex cursor-default select-none items-center justify-between rounded py-2 pl-2.5 pr-3 text-sm outline-none focus:bg-slate-100 dark:focus:bg-slate-900",
      className,
    )}
    ref={ref}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator>
      <Icon type="check" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export const SimpleSelect = forwardRef<
  React.ElementRef<"button">,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> & {
    children: SelectPrimitive.SelectContentProps["children"];
    className?: SelectPrimitive.SelectTriggerProps["className"];
    id?: SelectPrimitive.SelectTriggerProps["id"];
    name: NonNullable<SelectPrimitive.SelectProps["name"]>;
    placeholder?: SelectPrimitive.SelectValueProps["placeholder"];
    triggerProps?: Omit<
      SelectPrimitive.SelectTriggerProps,
      "asChild" | "children" | "className" | "id"
    >;
  }
>(
  (
    {
      children,
      className,
      id,
      name,
      placeholder = "Select…",
      triggerProps,
      ...props
    },
    ref,
  ) => {
    return (
      <Select {...props} name={name}>
        <SelectTrigger
          {...triggerProps}
          id={id}
          className={cn(className)}
          ref={ref}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    );
  },
);
SimpleSelect.displayName = "SimpleSelect";
