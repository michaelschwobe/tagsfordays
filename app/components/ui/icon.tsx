import { forwardRef } from "react";
import { cn } from "~/utils/misc";

export const ICON_TYPES = [
  "alert-triangle",
  "book",
  "bookmark",
  "bookmarks",
  "books",
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
  "share-2",
  "shield-alert",
  "shield",
  "split",
  "sun",
  "tag",
  "tags",
  "trash",
  "upload",
  "user",
  "x",
] as const;

export type IconType = (typeof ICON_TYPES)[number];

export const Icon = forwardRef<
  React.ElementRef<"svg">,
  React.ComponentPropsWithoutRef<"svg"> & { type: IconType }
>(({ className, type, ...props }, ref) => {
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
      ref={ref}
    >
      <use href={`/icons.svg#${type}`} />
    </svg>
  );
});
Icon.displayName = "Icon";
