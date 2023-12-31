import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const Textarea = forwardRef<
  React.ElementRef<"textarea">,
  React.ComponentPropsWithoutRef<"textarea"> & { name: string }
>(({ className, name, ...props }, ref) => {
  return (
    <textarea
      {...props}
      name={name}
      className={cn(
        "h-20 min-h-[5rem] w-full max-w-4xl rounded-md border border-slate-300 bg-white px-4 text-black transition-colors placeholder:italic placeholder:text-slate-400 focus-visible:border-pink-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:border-pink-500 dark:focus-visible:ring-pink-500",
        className,
      )}
      ref={ref}
    />
  );
});
Textarea.displayName = "Textarea";
