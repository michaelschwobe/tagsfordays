import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const ICON_TYPES = [
  "alert-triangle",
  "bookmark",
  "bookmarks",
  "calendar",
  "check",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevron-up",
  "chevrons-left",
  "chevrons-right",
  "chevrons-up-down",
  "download",
  "external-link",
  "heart",
  "home",
  "info",
  "laptop",
  "loader",
  "log-in",
  "log-out",
  "merge",
  "minus",
  "moon",
  "palette",
  "pencil",
  "plus",
  "search",
  "share",
  "split",
  "sun",
  "tag",
  "tags",
  "trash-2",
  "upload",
  "user",
  "x",
] as const;

export type IconType = (typeof ICON_TYPES)[number];

export const DEFAULT_ICON_TYPE = "alert-triangle" satisfies IconType;

export interface IconProps extends React.ComponentPropsWithoutRef<"svg"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the sprite `id` anchor. */
  type: IconType;
}

export const Icon = forwardRef<React.ElementRef<"svg">, IconProps>(
  ({ className, type, ...props }, forwardedRef) => {
    return (
      <svg
        width="1em"
        height="1em"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable={false}
        aria-hidden
        {...props}
        className={cn("shrink-0", className)}
        ref={forwardedRef}
      >
        <use href={`/icons.svg#${type}`} />
      </svg>
    );
  },
);

Icon.displayName = "Icon";
