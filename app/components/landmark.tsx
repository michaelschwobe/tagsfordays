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

export const Landmark = forwardRef<HTMLAnchorElement, LandmarkProps>(
  ({ className, label, slug, type, ...props }, forwardedRef) => {
    return (
      <a
        {...props}
        className={cn(
          type === "trigger"
            ? "fixed -top-10 left-4 z-50 block bg-black px-3 py-2 text-sm text-white transition-all focus:top-4"
            : "sr-only",
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
