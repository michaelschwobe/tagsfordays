import { forwardRef } from "react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/utils/misc";

export interface IntroProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const Intro = forwardRef<React.ElementRef<"div">, IntroProps>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <div
        {...props}
        className={cn(
          "px-4 pb-4 pt-2 text-center [text-wrap:balance] sm:py-0 sm:text-lg",
          className,
        )}
        ref={forwardedRef}
      >
        <h1 className="mr-4 inline font-semibold">
          {ENV.APP_NAME}{" "}
          <Badge>
            <abbr className="no-underline" title="Version">
              v
            </abbr>
            {ENV.APP_VERSION}
          </Badge>
        </h1>
        <p className="inline text-[0.875em]">{ENV.APP_DESCRIPTION_LONG}</p>
      </div>
    );
  },
);

Intro.displayName = "Intro";
