import { forwardRef } from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { H2 } from "~/components/ui/h2";
import { cn, formatItemsFoundByCount, toTitleCase } from "~/utils/misc";

type FormatItemsFoundByCountProps = Parameters<
  typeof formatItemsFoundByCount
>[0];

export interface SearchHelpProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children">,
    FormatItemsFoundByCountProps {
  /** Sets the `class` attribute. */
  className?: string;
}

export const SearchHelp = forwardRef<React.ElementRef<"div">, SearchHelpProps>(
  ({ className, count, plural, singular, ...props }, forwardedRef) => {
    const hasItems = typeof count === "number" && count > 0;
    return (
      <Card
        {...props}
        className={cn(className, hasItems ? "sr-only" : "mb-2")}
        ref={forwardedRef}
      >
        <CardHeader>
          <H2>
            {toTitleCase(formatItemsFoundByCount({ count, singular, plural }))}
          </H2>
        </CardHeader>

        {!hasItems ? (
          <CardContent>
            <p className="mb-2">Suggestions:</p>
            <ul className="list-disc pl-8">
              <li>Make sure all words are spelled correctly.</li>
              <li>Try different keywords.</li>
              <li>Try more general keywords.</li>
              <li>Try fewer keywords.</li>
            </ul>
          </CardContent>
        ) : null}
      </Card>
    );
  },
);

SearchHelp.displayName = "SearchHelp";
