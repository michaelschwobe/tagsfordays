import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const Landmark = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    label: string;
    slug: string;
    type: "trigger" | "target";
  }
>(({ className, label, slug, type, ...props }, ref) => {
  return (
    <a
      {...props}
      id={type === "trigger" ? `${slug}-trigger` : slug}
      href={`#${slug}`}
      className={cn(
        "fixed -top-10 left-4 z-50 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-black transition-all focus-visible:top-4 focus-visible:border-pink-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus-visible:border-pink-500 dark:focus-visible:ring-pink-500",
        className,
      )}
      ref={ref}
    >
      {`${type === "trigger" ? "Skip to" : "Start of"} ${label}`}
    </a>
  );
});
Landmark.displayName = "Landmark";
