import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export interface LandmarkProps {
  /** Sets the `class` attribute. */
  className?: string;
  /** Sets the content. **Required** */
  label: string;
  /** Sets the `id` and `href` attributes. **Required** */
  slug: string;
  /** Sets the content type. **Required** */
  type: "trigger" | "target";
}

export const Landmark = forwardRef<React.ElementRef<"a">, LandmarkProps>(
  ({ className, label, slug, type, ...props }, forwardedRef) => {
    return (
      <a
        {...props}
        className={cn(
          "fixed -top-10 left-4 z-50 rounded-md border border-slate-300 bg-slate-200 px-3 py-2 text-sm font-medium text-black transition-all focus-visible:top-4 focus-visible:border-pink-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        id={type === "trigger" ? `${slug}-trigger` : slug}
        href={`#${slug}`}
        ref={forwardedRef}
      >
        {`${type === "trigger" ? "Skip to" : "Start of"} ${label}`}
      </a>
    );
  },
);

Landmark.displayName = "Landmark";
