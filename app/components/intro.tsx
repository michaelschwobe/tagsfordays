import { forwardRef } from "react";
import { Code } from "~/components/ui/code";
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
          "p-4 text-center [text-wrap:balance] sm:text-lg",
          className,
        )}
        data-testid="intro"
        ref={forwardedRef}
      >
        <h1 className="inline font-semibold">{ENV.APP_NAME}</h1>
        <Code className="mx-3" data-testid="app-version">
          <abbr className="no-underline" title="Version">
            v
          </abbr>
          <span>{ENV.APP_VERSION}</span>
        </Code>
        <p className="inline text-[0.875em]">{ENV.APP_DESCRIPTION_LONG}</p>
      </div>
    );
  },
);

Intro.displayName = "Intro";
