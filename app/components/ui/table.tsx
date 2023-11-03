import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const TableWrapper = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, forwardedRef) => (
  <div
    {...props}
    className={cn(
      "relative w-full overflow-x-auto rounded-lg border border-slate-300 dark:border-slate-600",
      className,
    )}
    ref={forwardedRef}
  >
    {children}
  </div>
));
TableWrapper.displayName = "TableWrapper";

export const Table = forwardRef<
  React.ElementRef<"table">,
  React.ComponentPropsWithoutRef<"table">
>(({ className, ...props }, forwardedRef) => (
  <table
    {...props}
    className={cn(
      "w-full caption-bottom bg-white text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      className,
    )}
    ref={forwardedRef}
  />
));
Table.displayName = "Table";

export const Caption = forwardRef<
  React.ElementRef<"caption">,
  React.ComponentPropsWithoutRef<"caption">
>(({ className, ...props }, forwardedRef) => (
  <caption
    {...props}
    className={cn(
      "border-t border-slate-300 bg-white py-4 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400",
      className,
    )}
    ref={forwardedRef}
  />
));
Caption.displayName = "Caption";

export const Thead = forwardRef<
  React.ElementRef<"thead">,
  React.ComponentPropsWithoutRef<"thead">
>(({ className, ...props }, forwardedRef) => (
  <thead
    {...props}
    className={cn(
      "border-slate-300 dark:border-slate-600 [&_tr]:border-b",
      className,
    )}
    ref={forwardedRef}
  />
));
Thead.displayName = "Thead";

export const Tbody = forwardRef<
  React.ElementRef<"tbody">,
  React.ComponentPropsWithoutRef<"tbody">
>(({ className, ...props }, forwardedRef) => (
  <tbody
    {...props}
    className={cn("[&_tr:last-child]:border-0", className)}
    ref={forwardedRef}
  />
));
Tbody.displayName = "Tbody";

export const Tfoot = forwardRef<
  React.ElementRef<"tfoot">,
  React.ComponentPropsWithoutRef<"tfoot">
>(({ className, ...props }, forwardedRef) => (
  <tfoot
    {...props}
    className={cn(
      "border-slate-300 font-medium dark:border-slate-600 [&_tr]:border-b-0 [&_tr]:border-t",
      className,
    )}
    ref={forwardedRef}
  />
));
Tfoot.displayName = "Tfoot";

export const Tr = forwardRef<
  React.ElementRef<"tr">,
  React.ComponentPropsWithoutRef<"tr">
>(({ className, ...props }, forwardedRef) => (
  <tr
    {...props}
    className={cn(
      "border-b border-slate-300 transition-colors data-[state=selected]:bg-slate-100 dark:border-slate-600 dark:data-[state=selected]:bg-slate-900",
      className,
    )}
    ref={forwardedRef}
  />
));
Tr.displayName = "Tr";

export const Th = forwardRef<
  React.ElementRef<"th">,
  React.ComponentPropsWithoutRef<"th">
>(({ className, ...props }, forwardedRef) => (
  <th
    {...props}
    className={cn(
      "px-1.5 py-3.5 text-left align-middle font-medium [&:has([type=checkbox],[role=checkbox])]:pl-4",
      className,
    )}
    ref={forwardedRef}
  />
));
Th.displayName = "Th";

export const Td = forwardRef<
  React.ElementRef<"td">,
  React.ComponentPropsWithoutRef<"td">
>(({ className, ...props }, forwardedRef) => (
  <td
    {...props}
    className={cn(
      "px-1.5 py-3.5 align-middle [&:has([type=checkbox],[role=checkbox])]:pl-4",
      className,
    )}
    ref={forwardedRef}
  />
));
Td.displayName = "Td";
