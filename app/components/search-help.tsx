import { forwardRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { H2 } from "~/components/ui/h2";
import { cn, formatItemsFoundByCount, toTitleCase } from "~/utils/misc";

export const SearchHelp = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> &
    Parameters<typeof formatItemsFoundByCount>[0]
>(({ children, className, count, plural, singular, ...props }, ref) => {
  const hasItems = typeof count === "number" && count > 0;
  return (
    <Card
      {...props}
      className={cn(className, hasItems ? "sr-only" : undefined)}
      ref={ref}
    >
      <CardHeader>
        <H2>
          {toTitleCase(formatItemsFoundByCount({ count, singular, plural }))}
        </H2>
      </CardHeader>

      {!hasItems ? (
        <>
          <CardContent>
            <p>Suggestions:</p>
            <ul className="list-disc pl-8">
              <li>Make sure all words are spelled correctly.</li>
              <li>Try different keywords.</li>
              <li>Try more general keywords.</li>
              <li>Try fewer keywords.</li>
            </ul>
          </CardContent>
          {children ? <CardFooter>{children}</CardFooter> : null}
        </>
      ) : null}
    </Card>
  );
});
SearchHelp.displayName = "SearchHelp";
