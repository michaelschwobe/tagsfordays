import { forwardRef } from "react";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/misc";

export interface FaviconProps
  extends Omit<React.ComponentPropsWithoutRef<"img">, "children" | "src"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the `src` attribute. **Required** */
  src: string | null | undefined;
}

export const Favicon = forwardRef<React.ElementRef<"img">, FaviconProps>(
  ({ className, src, ...props }, forwardedRef) => {
    const classNames = cn("h-4 w-4", className);

    if (!src) {
      return <Icon className={classNames} type="bookmark" />;
    }

    return (
      <img
        alt=""
        {...props}
        className={classNames}
        src={src}
        width={16}
        height={16}
        ref={forwardedRef}
      />
    );
  },
);

Favicon.displayName = "Favicon";
