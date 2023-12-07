import { forwardRef } from "react";
import { Code } from "~/components/ui/code";
import { cn } from "~/utils/misc";

export const Intro = forwardRef<
  React.ElementRef<"div">,
  Omit<React.ComponentPropsWithoutRef<"div">, "children">
>(({ className, ...props }, ref) => {
  return (
    <div
      {...props}
      className={cn(
        "p-4 text-center [text-wrap:balance] sm:text-lg",
        className,
      )}
      data-testid="intro"
      ref={ref}
    >
      <h1 className="inline font-semibold">{ENV.APP_NAME}</h1>
      <Code className="mx-3" data-testid="app-version">
        <abbr title="Version" className="no-underline">
          v
        </abbr>
        <span>{ENV.APP_VERSION}</span>
      </Code>
      <p className="inline text-[0.875em]">{ENV.APP_DESCRIPTION_LONG}</p>
    </div>
  );
});
Intro.displayName = "Intro";
